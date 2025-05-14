import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"
import * as jose from "jose"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  try {
    // Get session from JWT cookie instead of Supabase session
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized - No session cookie" }, { status: 401 })
    }

    // Verify JWT token
    let userId: string
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

      if (!payload.id || payload.role !== "lender") {
        return NextResponse.json({ error: "Unauthorized - Invalid role" }, { status: 401 })
      }

      userId = payload.id as string
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get request body
    const body = await request.json()
    const { amount, bankAccountId } = body

    if (!amount || !bankAccountId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Parse amount to ensure it's a number
    const withdrawalAmount = Number.parseFloat(amount)
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 })
    }

    // 1. Get wallet data
    const { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("lender_id", userId)
      .single()

    if (walletError) {
      console.error("Error fetching wallet:", walletError)
      return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 })
    }

    if (!walletData) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // 2. Check if there's sufficient balance
    if (walletData.balance < withdrawalAmount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // 3. Get bank account details from payment_details instead of lender_bank_accounts
    const { data: bankAccountData, error: bankAccountError } = await supabase
      .from("payment_details")
      .select("*")
      .eq("id", bankAccountId)
      .eq("lender_id", userId)
      .single()

    if (bankAccountError) {
      console.error("Error fetching bank account:", bankAccountError)
      return NextResponse.json({ error: "Failed to fetch bank account" }, { status: 500 })
    }

    if (!bankAccountData) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 })
    }

    // 4. Generate IDs and references
    const transactionId = uuidv4()
    const withdrawalId = uuidv4()
    const reference = `WD-${Date.now().toString().substring(7)}`

    // 5. Get the latest transaction to calculate running balance
    const { data: latestTransaction, error: latestTransactionError } = await supabase
      .from("transactions")
      .select("running_balance")
      .eq("wallet_id", walletData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestTransactionError) {
      console.error("Error fetching latest transaction:", latestTransactionError)
      // Continue anyway, we'll use wallet balance as fallback
    }

    // Calculate the new running balance using direct arithmetic
    // If there's a previous transaction, use its running balance as a base
    // Otherwise, use the current wallet balance as the base
    const previousRunningBalance =
      latestTransaction?.running_balance !== undefined && latestTransaction?.running_balance !== null
        ? Number(latestTransaction.running_balance)
        : Number(walletData.balance)

    // For a withdrawal, subtract the amount from the previous running balance
    const newRunningBalance = previousRunningBalance - withdrawalAmount

    // 6. Update wallet balance directly without transaction
    const newBalance = Number(walletData.balance) - withdrawalAmount
    const { error: updateWalletError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", walletData.id)

    if (updateWalletError) {
      console.error("Error updating wallet:", updateWalletError)
      return NextResponse.json({ error: "Failed to update wallet balance" }, { status: 500 })
    }

    // 7. Create transaction record with calculated running balance
    const { error: insertTransactionError } = await supabase.from("transactions").insert({
      id: transactionId,
      wallet_id: walletData.id,
      type: "withdrawal",
      amount: withdrawalAmount,
      purpose: "Withdrawal to bank",
      reference,
      status: "pending",
      running_balance: newRunningBalance, // Set the calculated running balance
    })

    if (insertTransactionError) {
      console.error("Error creating transaction:", insertTransactionError)
      // Attempt to rollback wallet update
      await supabase
        .from("wallets")
        .update({ balance: walletData.balance, updated_at: new Date().toISOString() })
        .eq("id", walletData.id)
      return NextResponse.json({ error: "Failed to create transaction record" }, { status: 500 })
    }

    // 8. Create withdrawal record
    const { error: insertWithdrawalError } = await supabase.from("withdrawals").insert({
      id: withdrawalId,
      wallet_id: walletData.id,
      amount: withdrawalAmount,
      bank_name: bankAccountData.bank_name,
      account_number: bankAccountData.bank_account_number,
      account_name: bankAccountData.bank_account_name,
      status: "pending",
      transaction_id: transactionId,
      bank_account_id: bankAccountId,
    })

    if (insertWithdrawalError) {
      console.error("Error creating withdrawal:", insertWithdrawalError)
      // Attempt to rollback previous operations
      await supabase
        .from("wallets")
        .update({ balance: walletData.balance, updated_at: new Date().toISOString() })
        .eq("id", walletData.id)
      await supabase.from("transactions").delete().eq("id", transactionId)
      return NextResponse.json({ error: "Failed to create withdrawal record" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: {
        withdrawalId,
        transactionId,
        reference,
        newBalance,
        newRunningBalance,
      },
    })
  } catch (error) {
    console.error("Error processing withdrawal:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process withdrawal" },
      { status: 500 },
    )
  }
}
