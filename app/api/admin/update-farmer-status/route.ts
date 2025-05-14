import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getSession } from "@/lib/auth-utils"
import { sendApprovalEmail, sendRejectionEmail } from "@/utils/email-utils"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { id, status, admin_note } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log("Updating farmer with ID:", id, "to status:", status)

    // Get farmer details before update (to get email and name)
    const { data: farmerData, error: farmerError } = await supabaseAdmin
      .from("farmers")
      .select("email, full_name, status")
      .eq("id", id)
      .single()

    if (farmerError) {
      console.error("Error fetching farmer details:", farmerError)
      return NextResponse.json({ success: false, error: farmerError.message }, { status: 500 })
    }

    // Update farmer status and note
    const updateData: { status: string; admin_note?: string } = { status }

    // Only include admin_note if it's provided
    if (admin_note !== undefined) {
      updateData.admin_note = admin_note
    }

    const { error } = await supabaseAdmin.from("farmers").update(updateData).eq("id", id)

    if (error) {
      console.error("Error updating farmer status:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Send email notification if status is changing to approved or rejected
    // and only if the status is actually changing (not just updating a note)
    if (farmerData.status !== status) {
      try {
        if (status === "approved") {
          await sendApprovalEmail(farmerData.email, farmerData.full_name, "farmer")
        } else if (status === "rejected") {
          await sendRejectionEmail(farmerData.email, farmerData.full_name, "farmer", admin_note || "")
        }
      } catch (emailError) {
        // Log the error but don't fail the request
        console.error("Error sending email notification:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-farmer-status API:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
