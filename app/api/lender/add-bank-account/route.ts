import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get request body
    const body = await request.json()
    const { lenderId, bankDetails } = body

    if (!lenderId || !bankDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify session using custom JWT auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user is adding their own data or is an admin
    if (session.id !== lenderId && session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access to another user's data" }, { status: 403 })
    }

    // Insert new payment details
    const { data, error } = await supabase
      .from("payment_details")
      .insert({
        lender_id: lenderId,
        bank_name: bankDetails.bank_name,
        bank_account_name: bankDetails.bank_account_name,
        bank_account_number: bankDetails.bank_account_number,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in add-bank-account API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
