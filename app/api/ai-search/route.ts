import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"

export async function POST(request: Request) {
  // Get user from session
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
  const sessionCookie = cookies().get("session")?.value
  let userId = ""

  if (sessionCookie) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
      userId = payload.id as string
    } catch (error) {
      console.error("Error verifying JWT:", error)
      // For search, we might want to allow unauthenticated users, so not returning an error
    }
  }

  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Call the AI endpoint
    const response = await fetch("https://farmcreditai.onrender.com/query_faq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log("AI response:", data)

    // Extract the answer from the correct response structure
    let answer = "No answer found."

    if (data && data.responseCode === 200 && data.data && data.data.answer) {
      answer = data.data.answer
    }

    return NextResponse.json({ response: answer })
  } catch (error) {
    console.error("Error in AI search:", error)
    return NextResponse.json(
      { error: "Failed to get response from AI service. Please try again later." },
      { status: 500 },
    )
  }
}
