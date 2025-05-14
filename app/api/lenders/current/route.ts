import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth-utils"

export async function GET() {
  try {
    // Get the authenticated user session using our custom JWT auth
    const session = await getSession()

    if (!session || !session.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Fetch lender data using the ID from our custom JWT session
    const { data: lenderData, error: lenderError } = await supabase
      .from("lenders")
      .select("*, address:address_id(*)")
      .eq("id", session.id)
      .single()

    if (lenderError) {
      console.error("Error fetching lender data:", lenderError)
      return NextResponse.json({ error: lenderError.message }, { status: 500 })
    }

    if (!lenderData) {
      return NextResponse.json({ error: "Lender not found" }, { status: 404 })
    }

    // Format the response to include address fields at the top level
    const formattedData = {
      ...lenderData,
      address: lenderData.address?.street_address || null,
      city: lenderData.address?.city || null,
      state: lenderData.address?.state || null,
    }

    return NextResponse.json({ success: true, data: formattedData })
  } catch (error) {
    console.error("Error in lenders/current API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
