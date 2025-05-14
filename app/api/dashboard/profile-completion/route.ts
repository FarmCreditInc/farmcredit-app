import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { createClient } from "@/lib/supabase-server"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: Request) {
  try {
    // Get user session
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized", message: "No session found" }, { status: 401 })
    }

    // Verify JWT
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 })
    }

    const userId = payload.id as string
    const role = payload.role as string

    if (role !== "farmer") {
      return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get("userId")

    // Ensure the requested user ID matches the authenticated user
    if (requestedUserId && requestedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Get farmer profile
    const { data: farmer, error: farmerError } = await supabase.from("farmers").select("*").eq("id", userId).single()

    if (farmerError) {
      console.error("Error fetching farmer profile:", farmerError)
      return NextResponse.json({ error: "Database Error", message: "Failed to fetch profile" }, { status: 500 })
    }

    // Get next of kin details
    const { data: nextOfKin, error: nextOfKinError } = await supabase
      .from("farmer_next_of_kin")
      .select("*")
      .eq("farmer_id", userId)
      .maybeSingle()

    if (nextOfKinError) {
      console.error("Error fetching next of kin details:", nextOfKinError)
      return NextResponse.json(
        { error: "Database Error", message: "Failed to fetch next of kin details" },
        { status: 500 },
      )
    }

    // Create completion tasks
    const completionTasks = []

    // Check for missing next of kin details
    if (!nextOfKin) {
      completionTasks.push({
        id: "next-of-kin",
        title: "Add Next of Kin",
        description: "Add your next of kin details for your account",
        actionUrl: "/dashboard/farmer/settings",
        actionText: "Add Next of Kin",
        priority: "medium",
        details: {
          importance: "Next of kin details are important for account security and verification",
          requiredInformation: ["Full name", "Relationship", "Contact phone number", "Address"],
          privacyNote: "Your next of kin information is kept confidential and only used when necessary",
        },
      })
    }

    // Check for missing profile photo
    if (!farmer.profile_url) {
      completionTasks.push({
        id: "profile-photo",
        title: "Upload Profile Photo",
        description: "Upload a profile photo to complete your account",
        actionUrl: "/dashboard/farmer/settings",
        actionText: "Upload Photo",
        priority: "low",
        details: {
          importance: "A profile photo helps verify your identity and personalizes your account",
          fileRequirements: "Upload a clear photo of your face. Maximum file size: 5MB",
          acceptedDocuments: ["JPG", "PNG", "JPEG"],
        },
      })
    }

    return NextResponse.json({ success: true, data: completionTasks })
  } catch (error) {
    console.error("Error in profile-completion API:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch profile completion tasks" },
      { status: 500 },
    )
  }
}
