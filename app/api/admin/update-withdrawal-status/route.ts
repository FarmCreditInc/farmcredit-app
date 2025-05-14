import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"
import * as jose from "jose"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  try {
    // Get session from JWT cookie
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized - No session cookie" }, { status: 401 })
    }

    // Verify JWT token
    let userId: string
    let userRole: string
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

      if (!payload.id || payload.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
      }

      userId = payload.id as string
      userRole = payload.role as string
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get request body
    const body = await request.json()
    const { withdrawalId, status, notes } = body

    if (!withdrawalId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["pending", "processing", "successful", "failed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Update withdrawal status
    const { data, error } = await supabase
      .from("withdrawals")
      .update({
        status,
        admin_notes: notes || null,
        processed_at: status === "successful" || status === "failed" ? new Date().toISOString() : null,
      })
      .eq("id", withdrawalId)
      .select()
      .single()

    if (error) {
      console.error("Error updating withdrawal status:", error)
      return NextResponse.json({ error: `Failed to update withdrawal status: ${error.message}` }, { status: 500 })
    }

    // If status is successful, update the transaction status too
    if (status === "successful" && data.transaction_id) {
      const { error: transactionError } = await supabase
        .from("transactions")
        .update({ status: "successful" })
        .eq("id", data.transaction_id)

      if (transactionError) {
        console.error("Error updating transaction status:", transactionError)
        // Continue anyway, the withdrawal status is updated
      }
    }

    // If status is failed, update the transaction status and refund the wallet
    if (status === "failed" && data.transaction_id) {
      // Update transaction status
      const { error: transactionError } = await supabase
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", data.transaction_id)

      if (transactionError) {
        console.error("Error updating transaction status:", transactionError)
        // Continue anyway, the withdrawal status is updated
      }

      // Get the wallet to refund
      if (data.wallet_id && data.amount) {
        // Get current wallet balance
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("balance")
          .eq("id", data.wallet_id)
          .single()

        if (walletError) {
          console.error("Error fetching wallet for refund:", walletError)
        } else {
          // Refund the amount
          const newBalance = Number(wallet.balance) + Number(data.amount)
          const { error: refundError } = await supabase
            .from("wallets")
            .update({ balance: newBalance })
            .eq("id", data.wallet_id)

          if (refundError) {
            console.error("Error refunding wallet:", refundError)
          } else {
            // Create a refund transaction
            const { error: refundTransactionError } = await supabase.from("transactions").insert({
              wallet_id: data.wallet_id,
              type: "refund",
              amount: data.amount,
              purpose: `Refund for failed withdrawal (ID: ${withdrawalId})`,
              reference: `refund-${Date.now()}`,
              status: "successful",
            })

            if (refundTransactionError) {
              console.error("Error creating refund transaction:", refundTransactionError)
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal status updated to ${status}`,
      data,
    })
  } catch (error) {
    console.error("Error updating withdrawal status:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update withdrawal status" },
      { status: 500 },
    )
  }
}
