import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json()
    const { withdrawalId } = body

    if (!withdrawalId) {
      return NextResponse.json({ error: "Missing withdrawal ID" }, { status: 400 })
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single()

    if (withdrawalError) {
      console.error("Error fetching withdrawal:", withdrawalError)
      return NextResponse.json({ error: "Failed to fetch withdrawal" }, { status: 500 })
    }

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
    }

    // Update withdrawal status to "successful"
    const { error: updateError } = await supabase
      .from("withdrawals")
      .update({
        status: "successful",
        updated_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId)

    if (updateError) {
      console.error("Error updating withdrawal to successful:", updateError)
      return NextResponse.json({ error: "Failed to update withdrawal status" }, { status: 500 })
    }

    // If there's a transaction ID, update that too
    if (withdrawal.transaction_id) {
      const { error: transactionError } = await supabase
        .from("transactions")
        .update({ status: "successful" })
        .eq("id", withdrawal.transaction_id)

      if (transactionError) {
        console.error("Error updating transaction status:", transactionError)
        // Continue anyway, the withdrawal status is updated
      }
    }

    // Create a notification for the lender
    if (withdrawal.wallet_id) {
      // First, get the wallet to find the lender
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("lender_id")
        .eq("id", withdrawal.wallet_id)
        .single()

      if (!walletError && wallet && wallet.lender_id) {
        // Create notification
        const { error: notificationError } = await supabase.from("notifications").insert({
          title: "Withdrawal Successful",
          message: `Your withdrawal of ${withdrawal.amount} NGN to ${withdrawal.bank_name} (${withdrawal.account_number}) has been processed successfully.`,
          type: "withdrawal",
          recipient_type: "lender",
          user_id: wallet.lender_id,
          reference_id: withdrawalId,
        })

        if (notificationError) {
          console.error("Error creating notification:", notificationError)
          // Continue anyway, the withdrawal status is updated
        }
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Withdrawal completed successfully",
      data: { withdrawalId },
    })
  } catch (error) {
    console.error("Error completing withdrawal simulation:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete withdrawal simulation" },
      { status: 500 },
    )
  }
}
