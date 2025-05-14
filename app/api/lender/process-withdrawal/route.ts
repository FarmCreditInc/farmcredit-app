import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { JWT_SECRET } from "@/app/api/auth/constants"
import * as jose from "jose"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get JWT from cookies
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized - No session cookie" }, { status: 401 })
    }

    // Verify JWT
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

      if (!payload || !payload.id || payload.role !== "lender") {
        return NextResponse.json({ error: "Unauthorized - Invalid session" }, { status: 401 })
      }

      const userId = payload.id

      const { amount, bankAccountId } = await request.json()

      if (!amount || !bankAccountId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      // Get lender details
      const { data: lenderData, error: lenderError } = await supabase
        .from("lenders")
        .select("id")
        .eq("id", userId)
        .single()

      if (lenderError || !lenderData) {
        console.error("Error fetching lender:", lenderError)
        return NextResponse.json({ error: "Failed to fetch lender data" }, { status: 500 })
      }

      // Get wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("lender_id", lenderData.id)
        .single()

      if (walletError || !walletData) {
        console.error("Error fetching wallet:", walletError)
        return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 })
      }

      // Check if sufficient balance
      if (walletData.balance < amount) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }

      // Get bank account details
      const { data: bankAccount, error: bankAccountError } = await supabase
        .from("lender_bank_accounts")
        .select("*")
        .eq("id", bankAccountId)
        .eq("lender_id", lenderData.id)
        .single()

      if (bankAccountError || !bankAccount) {
        console.error("Error fetching bank account:", bankAccountError)
        return NextResponse.json({ error: "Failed to fetch bank account data" }, { status: 500 })
      }

      // Generate reference
      const reference = `WD-${uuidv4().substring(0, 8)}`

      // Create withdrawal record
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from("withdrawals")
        .insert([
          {
            wallet_id: walletData.id,
            amount,
            bank_name: bankAccount.bank_name,
            account_number: bankAccount.account_number,
            account_name: bankAccount.account_name,
            status: "pending",
            transaction_id: null, // Will be updated after transaction is created
          },
        ])
        .select()

      if (withdrawalError) {
        console.error("Error creating withdrawal:", withdrawalError)
        return NextResponse.json({ error: "Failed to create withdrawal" }, { status: 500 })
      }

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            wallet_id: walletData.id,
            type: "withdrawal",
            amount,
            purpose: `Withdrawal to ${bankAccount.bank_name} - ${bankAccount.account_number}`,
            reference,
            status: "successful",
          },
        ])
        .select()

      if (transactionError) {
        console.error("Error creating transaction:", transactionError)
        // Rollback withdrawal
        await supabase.from("withdrawals").delete().eq("id", withdrawal[0].id)
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
      }

      // Update withdrawal with transaction ID
      await supabase.from("withdrawals").update({ transaction_id: transaction[0].id }).eq("id", withdrawal[0].id)

      // Update wallet balance
      const newBalance = walletData.balance - amount
      const { error: updateError } = await supabase
        .from("wallets")
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", walletData.id)

      if (updateError) {
        console.error("Error updating wallet balance:", updateError)
        return NextResponse.json({ error: "Failed to update wallet balance" }, { status: 500 })
      }

      // Get the updated transaction with running balance
      const { data: updatedTransaction } = await supabase
        .from("transactions")
        .select("*, running_balance")
        .eq("id", transaction[0].id)
        .single()

      return NextResponse.json({
        success: true,
        withdrawal: withdrawal[0],
        transaction: updatedTransaction || transaction[0],
        newBalance,
      })
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
