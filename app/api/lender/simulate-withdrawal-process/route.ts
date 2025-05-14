import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json()
    const { withdrawalId } = body

    if (!withdrawalId) {
      return NextResponse.json({ error: "Missing withdrawal ID" }, { status: 400 })
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single()

    if (withdrawalError) {
      console.error("Error fetching withdrawal:", withdrawalError)
      return NextResponse.json({ error: "Failed to fetch withdrawal" }, { status: 500 })
    }

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
    }

    // Update withdrawal status to "processing"
    const { error: processingError } = await supabase
      .from("withdrawals")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId)

    if (processingError) {
      console.error("Error updating withdrawal to processing:", processingError)
      return NextResponse.json({ error: "Failed to update withdrawal status" }, { status: 500 })
    }

    // Return success response with the withdrawal ID
    return NextResponse.json({
      success: true,
      message: "Withdrawal processing started",
      data: { withdrawalId },
    })
  } catch (error) {
    console.error("Error starting withdrawal simulation:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start withdrawal simulation" },
      { status: 500 },
    )
  }
}
