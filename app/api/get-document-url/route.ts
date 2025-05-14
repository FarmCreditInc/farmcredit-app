import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { JWT_SECRET } from "@/app/api/auth/constants"

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    // Verify user is authenticated using custom JWT
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

      if (!payload || !payload.id) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 })
      }

      // Extract bucket name and file path
      let bucket: string
      let storagePath: string

      if (filePath.includes("/")) {
        const parts = filePath.split("/")
        bucket = parts[0]
        storagePath = parts.slice(1).join("/")
      } else {
        return NextResponse.json({ error: "Invalid file path format" }, { status: 400 })
      }

      // Verify the user has access to this document
      const { data: farmerData, error: farmerError } = await supabaseAdmin
        .from("farmers")
        .select("id_document_url")
        .eq("id", payload.id)
        .single()

      if (farmerError || !farmerData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if the requested document belongs to the user
      if (farmerData.id_document_url !== filePath) {
        return NextResponse.json({ error: "Access denied to this document" }, { status: 403 })
      }

      // Generate signed URL using the service role key
      const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(storagePath, 60 * 60) // 1 hour expiry

      if (error) {
        console.error("Error generating signed URL:", error)
        return NextResponse.json({ error: "Failed to generate signed URL", details: error.message }, { status: 500 })
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
