import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"
import * as jose from "jose"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: Request) {
  try {
    // Get session from JWT cookie
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized - No session cookie" }, { status: 401 })
    }

    // Verify JWT token
    let userId: string
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

      if (!payload.id || payload.role !== "lender") {
        return NextResponse.json({ error: "Unauthorized - Invalid role" }, { status: 401 })
      }

      userId = payload.id as string
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    console.log("Fetching pending applications for lender:", userId)

    // First, get the loan applications with farmer details
    const { data: loanApplications, error: loanAppError } = await supabase
      .from("loan_application")
      .select(`
        *,
        farmer:farmer_id (
          id,
          full_name,
          profile_url
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (loanAppError) {
      console.error("Error fetching loan applications:", loanAppError)
      return NextResponse.json(
        {
          success: false,
          error: `Error fetching loan applications: ${loanAppError.message}`,
        },
        { status: 500 },
      )
    }

    console.log(`Found ${loanApplications?.length || 0} pending applications`)

    // If no applications, return empty array
    if (!loanApplications || loanApplications.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Get all farmer IDs from the applications
    const farmerIds = loanApplications.map((app) => app.farmer_id)

    // Get credit scores for these farmers in a separate query
    const { data: creditScores, error: creditScoreError } = await supabase
      .from("credit_scores")
      .select("farmer_id, credit_score")
      .in("farmer_id", farmerIds)
      .order("created_at", { ascending: false }) // Get the most recent score for each farmer

    if (creditScoreError) {
      console.error("Error fetching credit scores:", creditScoreError)
      // Continue without credit scores
    }

    // Create a map of farmer_id to credit_score for easy lookup
    const creditScoreMap = new Map()
    if (creditScores) {
      // Group by farmer_id and take the most recent score
      const farmerScoreGroups = creditScores.reduce((groups, item) => {
        if (!groups[item.farmer_id]) {
          groups[item.farmer_id] = []
        }
        groups[item.farmer_id].push(item)
        return groups
      }, {})

      // For each farmer, get the most recent score
      Object.entries(farmerScoreGroups).forEach(([farmerId, scores]) => {
        if (Array.isArray(scores) && scores.length > 0) {
          // Sort by created_at in descending order and take the first one
          const mostRecentScore = scores[0]
          creditScoreMap.set(farmerId, mostRecentScore.credit_score)
        }
      })
    }

    // Merge the credit scores into the loan applications data
    const enrichedApplications = loanApplications.map((app) => {
      if (app.farmer && creditScoreMap.has(app.farmer_id)) {
        return {
          ...app,
          farmer: {
            ...app.farmer,
            credit_score: creditScoreMap.get(app.farmer_id),
          },
        }
      }
      return {
        ...app,
        farmer: {
          ...app.farmer,
          credit_score: null, // No credit score found
        },
      }
    })

    return NextResponse.json({ success: true, data: enrichedApplications })
  } catch (error) {
    console.error("Error in pending applications API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
