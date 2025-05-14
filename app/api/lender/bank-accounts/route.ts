import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get lenderId from query params
    const lenderId = request.nextUrl.searchParams.get("lenderId")

    if (!lenderId) {
      return NextResponse.json({ error: "Lender ID is required" }, { status: 400 })
    }

    // Verify session using custom JWT auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user is requesting their own data or is an admin
    if (session.id !== lenderId && session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access to another user's data" }, { status: 403 })
    }

    // Fetch all payment details for this lender
    const { data, error } = await supabase
      .from("payment_details")
      .select("*")
      .eq("lender_id", lenderId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ accounts: data })
  } catch (error) {
    console.error("Error in bank-accounts API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
