import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth-utils"

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get request body
    const body = await request.json()
    const { lenderId, accountId, bankDetails } = body

    if (!lenderId || !accountId || !bankDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify session using custom JWT auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user is updating their own data or is an admin
    if (session.id !== lenderId && session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access to another user's data" }, { status: 403 })
    }

    // Verify the account belongs to this lender
    const { data: account, error: accountError } = await supabase
      .from("payment_details")
      .select("id")
      .eq("id", accountId)
      .eq("lender_id", lenderId)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: "Bank account not found or unauthorized" }, { status: 404 })
    }

    // Update payment details
    const { data, error } = await supabase
      .from("payment_details")
      .update({
        bank_name: bankDetails.bank_name,
        bank_account_name: bankDetails.bank_account_name,
        bank_account_number: bankDetails.bank_account_number,
      })
      .eq("id", accountId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in update-bank-account API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
