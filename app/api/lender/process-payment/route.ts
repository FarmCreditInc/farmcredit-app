import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { verifyToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Get the payment data from the request body
    const data = await request.json()
    const { reference, amount, walletId } = data

    if (!reference || !amount || !walletId) {
      return NextResponse.json({ error: "Reference, amount, and walletId are required" }, { status: 400 })
    }

    // Get user from custom JWT token
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const session = await verifyToken(sessionCookie.value)

    if (!session || session.role !== "lender") {
      return NextResponse.json({ error: "Unauthorized: Lender access required" }, { status: 403 })
    }

    const lenderId = session.id

    // Use Supabase client only for database operations, not for auth
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify the wallet belongs to this lender
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", walletId)
      .eq("lender_id", lenderId)
      .single()

    if (walletError) {
      console.error("Error fetching wallet:", walletError)
      return NextResponse.json({ error: "Could not find wallet" }, { status: 404 })
    }

    try {
      // Get the current balance
      const currentBalance = Number(wallet.balance)
      const newBalance = currentBalance + Number(amount)

      // Update wallet balance directly
      const { error: updateError } = await supabase.from("wallets").update({ balance: newBalance }).eq("id", walletId)

      if (updateError) {
        console.error("Error updating wallet balance:", updateError)
        return NextResponse.json({ error: "Failed to update wallet balance" }, { status: 500 })
      }

      // Get the latest transaction to calculate the running balance
      const { data: latestTransaction, error: latestTransactionError } = await supabase
        .from("transactions")
        .select("running_balance")
        .eq("wallet_id", walletId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      // Calculate the running balance
      let runningBalance = newBalance

      // If there's a previous transaction, use its running balance as a base
      if (latestTransaction && latestTransaction.running_balance !== null) {
        // For a credit transaction, add the amount to the previous running balance
        runningBalance = Number(latestTransaction.running_balance) + Number(amount)
      }

      // Record transaction WITH running_balance
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          wallet_id: walletId,
          type: "credit",
          amount,
          purpose: `Wallet top-up via Paystack (${reference})`,
          reference,
          running_balance: runningBalance,
          status: "successful",
        })
        .select()

      if (transactionError) {
        console.error("Error creating transaction:", transactionError)

        // Rollback wallet update
        await supabase.from("wallets").update({ balance: wallet.balance }).eq("id", walletId)

        return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        data: {
          transactionId: transaction[0].id,
          newBalance,
          runningBalance,
        },
      })
    } catch (error) {
      console.error("Process payment error:", error)

      // Attempt rollback if possible
      try {
        await supabase.from("wallets").update({ balance: wallet.balance }).eq("id", walletId)
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError)
      }

      return NextResponse.json({ error: "An error occurred while processing payment" }, { status: 500 })
    }
  } catch (error) {
    console.error("Process payment error:", error)
    return NextResponse.json({ error: "An error occurred while processing payment" }, { status: 500 })
  }
}
