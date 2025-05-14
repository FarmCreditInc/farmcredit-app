import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get request body
    const body = await request.json()
    const { farmerId, bankDetails, mode, paymentDetailsId } = body

    if (!farmerId || !bankDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let result

    if (mode === "edit" && paymentDetailsId) {
      // Update existing payment details
      const { data, error } = await supabase
        .from("payment_details")
        .update({
          bank_name: bankDetails.bank_name,
          bank_account_name: bankDetails.bank_account_name,
          bank_account_number: bankDetails.bank_account_number,
          bvn: bankDetails.bvn,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentDetailsId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    } else {
      // Insert new payment details
      const { data, error } = await supabase
        .from("payment_details")
        .insert({
          farmer_id: farmerId,
          bank_name: bankDetails.bank_name,
          bank_account_name: bankDetails.bank_account_name,
          bank_account_number: bankDetails.bank_account_number,
          bvn: bankDetails.bvn,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("Error in update-bank-details API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
