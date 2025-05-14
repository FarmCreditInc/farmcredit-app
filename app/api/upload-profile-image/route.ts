import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import * as jose from "jose"

// Create a Supabase client with the service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function POST(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

  // Get user from session
  const sessionCookie = cookies().get("session")?.value
  let userId = ""
  let userEmail = ""

  if (sessionCookie) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
      userId = payload.id as string
      userEmail = payload.email as string
    } catch (error) {
      console.error("Error verifying JWT:", error)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    //const userId = formData.get("userId") as string // Using JWT now
    //const userEmail = formData.get("userEmail") as string // Using JWT now
    const userType = (formData.get("userType") as string) || "farmer" // Default to farmer if not specified

    if (!file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine the correct table based on user type
    const tableName = userType === "lender" ? "lenders" : "farmers"

    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // Store in the photos bucket with the correct path
    const filePath = `profiles/${userEmail}/${fileName}`

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from("photos").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the public URL
    const { data: publicUrlData } = supabaseAdmin.storage.from("photos").getPublicUrl(filePath)

    // Update the user's profile_url in the database
    const { error: updateError } = await supabaseAdmin
      .from(tableName)
      .update({ profile_url: publicUrlData.publicUrl })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating profile URL:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (error) {
    console.error("Error in upload-profile-image API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
