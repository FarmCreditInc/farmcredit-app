import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import * as jose from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET() {
  try {
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "No session cookie found" }, { status: 401 })
    }

    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

      return NextResponse.json({
        session: {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name,
        },
      })
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid JWT token", details: String(jwtError) }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Session error", details: String(error) }, { status: 500 })
  }
}
