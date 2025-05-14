import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get request body
    const body = await request.json()
    const { lenderId } = body

    if (!lenderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Soft delete lender account
    const { error } = await supabase
      .from("lenders")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lenderId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete-lender-account API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
