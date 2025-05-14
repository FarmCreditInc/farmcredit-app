"use server"

import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function verifyAndProcessPayment(reference: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = session.user.id

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return { success: false, error: "Paystack secret key not configured" }
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    })

    const verifyData = await verifyResponse.json()

    if (!verifyData.status || verifyData.data.status !== "success") {
      return {
        success: false,
        error: "Payment verification failed",
        details: verifyData,
      }
    }

    // Check if this payment has already been processed
    const { data: existingTransaction } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("reference", reference)
      .single()

    if (existingTransaction) {
      return {
        success: true,
        message: "Payment already processed",
        alreadyProcessed: true,
      }
    }

    // Get lender's wallet
    const { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("lender_id", userId)
      .single()

    if (walletError || !walletData) {
      console.error("Error fetching wallet:", walletError)
      return { success: false, error: "Wallet not found" }
    }

    const walletId = walletData.id
    const amount = verifyData.data.amount / 100 // Convert from kobo to naira

    // Create transaction record
    const { data: transactionData, error: transactionError } = await supabase.rpc("create_wallet_transaction", {
      p_wallet_id: walletId,
      p_type: "credit",
      p_amount: amount,
      p_purpose: "Wallet top-up",
      p_reference: reference,
    })

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
      return { success: false, error: "Failed to process transaction" }
    }

    return {
      success: true,
      message: "Payment verified and wallet updated successfully",
      data: {
        amount,
        newBalance: transactionData.new_balance,
        transactionId: transactionData.transaction_id,
      },
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return {
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
