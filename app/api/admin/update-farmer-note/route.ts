import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getSession } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { id, admin_note } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Update farmer note
    const { error } = await supabaseAdmin.from("farmers").update({ admin_note }).eq("id", id)

    if (error) {
      console.error("Error updating farmer note:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-farmer-note API:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
