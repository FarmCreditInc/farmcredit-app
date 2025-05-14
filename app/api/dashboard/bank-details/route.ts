import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get farmerId from query params
    const farmerId = request.nextUrl.searchParams.get("farmerId")

    if (!farmerId) {
      return NextResponse.json({ error: "Farmer ID is required" }, { status: 400 })
    }

    // Verify session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch payment details
    const { data, error } = await supabase.from("payment_details").select("*").eq("farmer_id", farmerId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "No payment details found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in bank-details API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
