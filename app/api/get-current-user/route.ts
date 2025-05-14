import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")

    // If no authorization header, try to get from cookies
    let token = authHeader ? authHeader.replace("Bearer ", "") : null

    if (!token) {
      // Try to get from cookies as fallback
      const cookieHeader = request.headers.get("cookie")
      if (cookieHeader) {
        const sessionCookie = cookieHeader.split("; ").find((row) => row.startsWith("session="))

        if (sessionCookie) {
          token = sessionCookie.split("=")[1]
        }
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the token
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Return the user data
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error in get-current-user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
