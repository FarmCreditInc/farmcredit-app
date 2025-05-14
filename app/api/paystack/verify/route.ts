import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { verifyJWT, getSession } from "@/lib/auth-utils"
import { v4 as uuidv4 } from "uuid"

// Helper function to verify payment with Paystack
async function verifyPaystackPayment(reference: string) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackSecretKey) {
    throw new Error("Paystack secret key not configured")
  }

  const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
  })

  return await verifyResponse.json()
}

// Helper function to process successful payment
async function processSuccessfulPayment(lenderId: string, reference: string, amount: number) {
  const supabase = createClient()

  // Get lender's wallet
  const { data: walletData, error: walletError } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("lender_id", lenderId)
    .single()

  if (walletError || !walletData) {
    console.error("Error fetching wallet:", walletError)
    throw new Error("Wallet not found")
  }

  const walletId = walletData.id
  const currentBalance = Number(walletData.balance || 0)
  const newBalance = currentBalance + amount

  try {
    // Try using the safe_wallet_transaction function
    const { data: transactionData, error: transactionError } = await supabase.rpc("safe_wallet_transaction", {
      p_wallet_id: walletId,
      p_type: "credit",
      p_amount: amount,
      p_purpose: "Wallet top-up",
      p_reference: reference,
    })

    if (transactionError) {
      throw transactionError
    }

    return {
      amount,
      newBalance: transactionData.new_balance,
      transactionId: transactionData.transaction_id,
    }
  } catch (error) {
    console.error("Error using safe_wallet_transaction:", error)

    // Fallback: Direct update with manual arithmetic
    // 1. Update wallet balance
    const { error: updateError } = await supabase.from("wallets").update({ balance: newBalance }).eq("id", walletId)

    if (updateError) {
      console.error("Error updating wallet balance:", updateError)
      throw new Error("Failed to update wallet balance")
    }

    // 2. Create transaction record
    const transactionId = uuidv4()
    const { error: insertError } = await supabase.from("transactions").insert({
      id: transactionId,
      wallet_id: walletId,
      type: "credit",
      amount: amount,
      purpose: "Wallet top-up",
      reference: reference,
      running_balance: newBalance, // Direct arithmetic for running balance
      status: "successful",
    })

    if (insertError) {
      // Rollback wallet update
      await supabase.from("wallets").update({ balance: currentBalance }).eq("id", walletId)
      console.error("Error creating transaction record:", insertError)
      throw new Error("Failed to create transaction record")
    }

    return {
      amount,
      newBalance,
      transactionId,
    }
  }
}

// POST handler for API calls
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const payload = await verifyJWT(token)

    if (!payload || !payload.userId || !payload.role) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Only lenders can verify payments
    if (payload.role !== "lender") {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 })
    }

    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    // Verify payment with Paystack
    const verifyData = await verifyPaystackPayment(reference)

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          details: verifyData,
        },
        { status: 400 },
      )
    }

    // Get lender ID from the JWT payload
    const lenderId = payload.userId
    const amount = verifyData.data.amount / 100 // Convert from kobo to naira

    // Process the payment
    const result = await processSuccessfulPayment(lenderId, reference, amount)

    return NextResponse.json({
      success: true,
      message: "Payment verified and wallet updated successfully",
      data: result,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET handler for redirect from Paystack
export async function GET(request: NextRequest) {
  try {
    // Get reference from URL query parameters
    const url = new URL(request.url)
    const reference = url.searchParams.get("reference")
    const trxref = url.searchParams.get("trxref") // Paystack sometimes uses this parameter

    // Get the base URL from the request
    const baseUrl = url.origin

    // If no reference is provided, redirect to wallet page with error
    if (!reference && !trxref) {
      const redirectUrl = new URL("/dashboard/lender/wallet", baseUrl)
      redirectUrl.searchParams.set("status", "error")
      redirectUrl.searchParams.set("message", "No payment reference provided")
      return NextResponse.redirect(redirectUrl)
    }

    const paymentRef = reference || trxref

    // Verify payment with Paystack
    try {
      const verifyData = await verifyPaystackPayment(paymentRef as string)

      // Check if payment was successful
      if (verifyData.status && verifyData.data.status === "success") {
        // Get user session using custom JWT authentication
        const session = await getSession()

        if (!session || session.role !== "lender") {
          // If no valid session, redirect with error
          const redirectUrl = new URL("/dashboard/lender/wallet", baseUrl)
          redirectUrl.searchParams.set("status", "error")
          redirectUrl.searchParams.set("message", "User not authenticated or not a lender")
          return NextResponse.redirect(redirectUrl)
        }

        try {
          // Process the payment - update wallet and create transaction
          const amount = verifyData.data.amount / 100 // Convert from kobo to naira
          await processSuccessfulPayment(session.id, paymentRef as string, amount)

          // Redirect with success status
          const redirectUrl = new URL("/dashboard/lender/wallet", baseUrl)
          redirectUrl.searchParams.set("status", "success")
          redirectUrl.searchParams.set("reference", paymentRef as string)
          return NextResponse.redirect(redirectUrl)
        } catch (error) {
          console.error("Error processing payment:", error)
          // Redirect with processing error
          const redirectUrl = new URL("/dashboard/lender/wallet", baseUrl)
          redirectUrl.searchParams.set("status", "error")
          redirectUrl.searchParams.set("message", "Error processing payment")
          return NextResponse.redirect(redirectUrl)
        }
      } else {
        // Payment verification failed
        const redirectUrl = new URL("/dashboard/lender/wallet", baseUrl)
        redirectUrl.searchParams.set("status", "failed")
        redirectUrl.searchParams.set("reference", paymentRef as string)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      const redirectUrl = new URL("/dashboard/lender/wallet", baseUrl)
      redirectUrl.searchParams.set("status", "error")
      redirectUrl.searchParams.set("message", "Payment verification failed")
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error("Error handling payment callback:", error)
    // If we can't get the base URL from the request, fall back to a relative URL
    const redirectUrl = new URL("/dashboard/lender/wallet", "http://localhost:3000")
    redirectUrl.searchParams.set("status", "error")
    redirectUrl.searchParams.set("message", "Internal server error")
    return NextResponse.redirect(redirectUrl)
  }
}
