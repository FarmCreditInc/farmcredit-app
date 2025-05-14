import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { getSession } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json()
    const { loanApplicationId, platformFee } = body

    if (!loanApplicationId) {
      return NextResponse.json({ error: "Missing loan application ID" }, { status: 400 })
    }

    // Verify session using custom JWT auth
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Make sure the user is a lender
    if (session.role !== "lender") {
      return NextResponse.json({ error: "Unauthorized: Only lenders can approve loans" }, { status: 403 })
    }

    const lenderId = session.id

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get loan application details
    const { data: loanApplication, error: loanAppError } = await supabase
      .from("loan_application")
      .select("*")
      .eq("id", loanApplicationId)
      .eq("status", "pending")
      .single()

    if (loanAppError || !loanApplication) {
      return NextResponse.json({ error: loanAppError?.message || "Loan application not found" }, { status: 404 })
    }

    // Get lender wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("lender_id", lenderId)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: walletError?.message || "Wallet not found" }, { status: 404 })
    }

    // Check if wallet has sufficient balance
    const loanAmount = loanApplication.amount_requested
    const totalDebit = loanAmount + platformFee

    if (wallet.balance < totalDebit) {
      return NextResponse.json(
        {
          error: "Insufficient funds in wallet",
          requiredAmount: totalDebit,
          currentBalance: wallet.balance,
        },
        { status: 400 },
      )
    }

    // Begin transaction
    // 1. Debit lender wallet
    const newBalance = wallet.balance - totalDebit
    const { error: updateWalletError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id)

    if (updateWalletError) {
      return NextResponse.json({ error: `Error updating lender wallet: ${updateWalletError.message}` }, { status: 500 })
    }

    // 2. Record transaction for loan funding
    const transactionId = uuidv4()
    const { error: transactionError } = await supabase.from("transactions").insert({
      id: transactionId,
      wallet_id: wallet.id,
      type: "loan_funding",
      amount: loanAmount,
      purpose: `Funding for loan application ${loanApplicationId}`,
      reference: loanApplicationId,
      running_balance: newBalance + platformFee,
      status: "successful",
    })

    if (transactionError) {
      // Rollback wallet update
      await supabase.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
      return NextResponse.json({ error: `Error recording transaction: ${transactionError.message}` }, { status: 500 })
    }

    // 3. Record transaction for platform fee
    const feeTransactionId = uuidv4()
    const { error: feeTransactionError } = await supabase.from("transactions").insert({
      id: feeTransactionId,
      wallet_id: wallet.id,
      type: "fee",
      amount: platformFee,
      purpose: `Platform fee for loan application ${loanApplicationId}`,
      reference: loanApplicationId,
      running_balance: newBalance,
      status: "successful",
    })

    if (feeTransactionError) {
      // Rollback previous operations
      await supabase.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
      await supabase.from("transactions").delete().eq("id", transactionId)
      return NextResponse.json(
        { error: `Error recording fee transaction: ${feeTransactionError.message}` },
        { status: 500 },
      )
    }

    // 4. Get a random vendor based on purpose category
    const purposeCategory = loanApplication.purpose_category || "general"
    const { data: vendors, error: vendorsError } = await supabase.from("vendors").select("id").limit(10)

    if (vendorsError) {
      // Continue without vendor if there's an error
      console.error("Error fetching vendors:", vendorsError)
    }

    // Randomly select a vendor if available
    let vendorId = null
    if (vendors && vendors.length > 0) {
      const randomIndex = Math.floor(Math.random() * vendors.length)
      vendorId = vendors[randomIndex].id
    }

    // 5. Create loan contract
    const contractId = uuidv4()
    const { error: contractError } = await supabase.from("loan_contract").insert({
      id: contractId,
      loan_application_id: loanApplicationId,
      financier_id: lenderId,
      amount_disbursed: loanAmount,
      interest_rate: loanApplication.interest_rate || 15, // Default to 15% if not specified
      status: "active",
      vendor_id: vendorId,
      contract_type: "standard", // Added default contract type
    })

    if (contractError) {
      // Rollback previous operations
      await supabase.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
      await supabase.from("transactions").delete().eq("id", transactionId)
      await supabase.from("transactions").delete().eq("id", feeTransactionId)
      return NextResponse.json({ error: `Error creating loan contract: ${contractError.message}` }, { status: 500 })
    }

    // 6. Create platform fee record
    const platformFeeId = uuidv4()
    const { error: platformFeeError } = await supabase.from("platform_fees").insert({
      id: platformFeeId,
      loan_contract_id: contractId,
      amount: platformFee,
      fee_percentage: 1.0, // Default percentage
      status: "collected",
      collected_at: new Date().toISOString(),
    })

    if (platformFeeError) {
      console.error("Error creating platform fee record:", platformFeeError)
      // Continue even if platform fee record creation fails
    }

    // 7. Update loan application status
    const { error: updateLoanError } = await supabase
      .from("loan_application")
      .update({
        status: "approved",
      })
      .eq("id", loanApplicationId)

    if (updateLoanError) {
      // Rollback previous operations
      await supabase.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
      await supabase.from("transactions").delete().eq("id", transactionId)
      await supabase.from("transactions").delete().eq("id", feeTransactionId)
      await supabase.from("loan_contract").delete().eq("id", contractId)
      await supabase.from("platform_fees").delete().eq("id", platformFeeId)
      return NextResponse.json(
        { error: `Error updating loan application: ${updateLoanError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data: { contractId } })
  } catch (error) {
    console.error("Error in approve-loan API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
