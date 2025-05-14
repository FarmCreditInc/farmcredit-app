import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 })
    }

    // Get the current user from the session
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract bucket name and file path
    let bucket: string
    let filePath: string

    if (path.includes("/")) {
      const parts = path.split("/")
      bucket = parts[0]
      filePath = parts.slice(1).join("/")
    } else {
      return NextResponse.json({ error: "Invalid file path format" }, { status: 400 })
    }

    // Generate signed URL
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60) // 1 hour expiry

    if (error) {
      console.error("Error generating signed URL:", error)
      return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
    }

    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error("Error in get-signed-profile-url API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
