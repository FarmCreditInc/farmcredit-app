import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { JWT_SECRET } from "@/app/api/auth/constants"

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

      if (!payload || !payload.id || payload.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
      }

      // Parse request body
      const { filePath } = await request.json()

      if (!filePath) {
        return NextResponse.json({ error: "Missing file path" }, { status: 400 })
      }

      // Extract bucket name and file path
      let bucket: string
      let path: string

      if (filePath.includes("/")) {
        const parts = filePath.split("/")
        bucket = parts[0]
        path = parts.slice(1).join("/")
      } else {
        return NextResponse.json({ error: "Invalid file path format" }, { status: 400 })
      }

      // Generate signed URL using the service role key
      const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 60) // 1 hour expiry

      if (error) {
        console.error("Error generating signed URL:", error)
        return NextResponse.json({ error: "Failed to generate signed URL", details: error }, { status: 500 })
      }

      return NextResponse.json({ success: true, url: data.signedUrl })
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error generating document URL:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
