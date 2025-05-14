import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { verifyToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Get the transaction data from the request body
    const data = await request.json()
    const { walletId, type, amount, purpose, reference } = data

    if (!walletId || !type || !amount) {
      return NextResponse.json({ error: "WalletId, type, and amount are required" }, { status: 400 })
    }

    // Validate transaction type
    const validTypes = ["credit", "debit", "fee", "withdrawal", "loan_funding"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid transaction type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 },
      )
    }

    // Get user from custom JWT token
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const session = await verifyToken(sessionCookie.value)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Use Supabase client only for database operations, not for auth
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the wallet to verify ownership and get current balance
    const { data: wallet, error: walletError } = await supabase.from("wallets").select("*").eq("id", walletId).single()

    if (walletError) {
      console.error("Error fetching wallet:", walletError)
      return NextResponse.json({ error: "Could not find wallet" }, { status: 404 })
    }

    // Verify wallet ownership
    if (wallet.lender_id && wallet.lender_id !== session.id && session.role === "lender") {
      return NextResponse.json({ error: "You don't have permission to access this wallet" }, { status: 403 })
    }

    if (wallet.farmer_id && wallet.farmer_id !== session.id && session.role === "farmer") {
      return NextResponse.json({ error: "You don't have permission to access this wallet" }, { status: 403 })
    }

    try {
      // Try using the simple_wallet_transaction function
      const { data: result, error: functionError } = await supabase.rpc("simple_wallet_transaction", {
        p_wallet_id: walletId,
        p_amount: type === "credit" || type === "repayment" ? amount : -amount,
        p_type: type,
        p_purpose: purpose || type,
        p_reference: reference || `manual-${Date.now()}`,
        p_status: "successful",
      })

      if (functionError) {
        throw functionError
      }

      // Get the updated wallet balance
      const { data: updatedWallet, error: fetchError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("id", walletId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      return NextResponse.json({
        success: true,
        message: "Transaction created successfully",
        data: {
          transactionId: result,
          newBalance: updatedWallet.balance,
        },
      })
    } catch (functionError) {
      console.error("Error using simple_wallet_transaction function:", functionError)

      // Fallback to manual update if the function fails
      console.log("Falling back to manual wallet update and transaction creation")

      // Calculate new balance
      let newBalance = wallet.balance
      if (type === "credit" || type === "repayment") {
        newBalance += amount
      } else {
        // For debit, fee, withdrawal
        newBalance -= amount

        // Check if sufficient balance
        if (newBalance < 0) {
          return NextResponse.json({ error: "Insufficient funds in wallet" }, { status: 400 })
        }
      }

      // Update wallet balance
      const { error: updateError } = await supabase.from("wallets").update({ balance: newBalance }).eq("id", walletId)

      if (updateError) {
        console.error("Error updating wallet balance:", updateError)
        return NextResponse.json({ error: "Failed to update wallet balance" }, { status: 500 })
      }

      // Record transaction WITHOUT setting running_balance
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          wallet_id: walletId,
          type,
          amount,
          purpose: purpose || type,
          reference: reference || `manual-${Date.now()}`,
          status: "successful",
        })
        .select()
        .single()

      if (transactionError) {
        console.error("Error creating transaction:", transactionError)

        // Rollback wallet update
        await supabase.from("wallets").update({ balance: wallet.balance }).eq("id", walletId)

        return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Transaction created successfully (fallback method)",
        data: { transaction, newBalance },
      })
    }
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "An error occurred while creating transaction" }, { status: 500 })
  }
}
