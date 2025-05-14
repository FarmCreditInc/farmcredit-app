import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get request body
    const body = await request.json()
    const { loanApplicationId, rejectionReason } = body

    if (!loanApplicationId) {
      return NextResponse.json({ error: "Missing loan application ID" }, { status: 400 })
    }

    if (!rejectionReason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    // Verify session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get lender ID
    const { data: lender, error: lenderError } = await supabase
      .from("lenders")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (lenderError || !lender) {
      return NextResponse.json({ error: "Lender not found" }, { status: 404 })
    }

    // Update loan application status
    const { data, error } = await supabase
      .from("loan_applications")
      .update({
        status: "rejected",
        lender_id: lender.id,
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loanApplicationId)
      .eq("status", "pending")
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for farmer
    await supabase.from("notifications").insert({
      user_id: data.farmer_id,
      title: "Loan Application Rejected",
      message: `Your loan application for ${data.amount} has been rejected. Reason: ${rejectionReason}`,
      type: "loan_rejected",
      reference_id: data.id,
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in reject-loan API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
