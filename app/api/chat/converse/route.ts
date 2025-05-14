import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

  // Get user from session
  const sessionCookie = cookies().get("session")?.value
  let userId = ""
  let userRole = ""

  if (sessionCookie) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
      userId = payload.id as string
      userRole = payload.role as string
    } catch (error) {
      console.error("Error verifying JWT:", error)
    }
  }

  try {
    const body = await request.json()

    // Get user info based on role if authenticated
    let userInfo = body.user_info || { name: "guest" }

    if (userId && userRole) {
      if (userRole === "farmer") {
        const { data: farmer } = await supabaseAdmin.from("farmers").select("full_name").eq("id", userId).single()

        // Get the most recent credit score for this farmer
        const { data: creditScoreData } = await supabaseAdmin
          .from("credit_scores")
          .select("credit_score")
          .eq("farmer_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        const creditScore = creditScoreData?.credit_score || 0

        const { data: wallet } = await supabaseAdmin
          .from("wallets")
          .select("balance")
          .eq("farmer_id", userId)
          .maybeSingle()

        const { data: loans } = await supabaseAdmin
          .from("loan_contract")
          .select(`
            id,
            loan_application_id,
            amount_disbursed,
            interest_rate,
            created_at
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (farmer) {
          userInfo = {
            name: farmer.full_name,
            wallet_balance: wallet?.balance !== null && wallet?.balance !== undefined ? wallet.balance : 0,
            available_loans: loans || [],
            credit_score: creditScore,
          }
        }
      } else if (userRole === "lender") {
        const { data: lender } = await supabaseAdmin
          .from("lenders")
          .select("organization_name")
          .eq("id", userId)
          .single()

        const { data: wallet } = await supabaseAdmin
          .from("wallets")
          .select("balance")
          .eq("lender_id", userId)
          .maybeSingle()

        const { data: loans } = await supabaseAdmin
          .from("loan_contract")
          .select(`
            id,
            loan_application_id,
            amount_disbursed,
            interest_rate,
            created_at
          `)
          .eq("financier_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (lender) {
          userInfo = {
            name: lender.organization_name,
            wallet_balance: wallet?.balance !== null && wallet?.balance !== undefined ? wallet.balance : 0,
            available_loans: loans || [],
            credit_score: 0, // Default to 0 for lenders
          }
        }
      }
    }

    // Create a properly formatted request body with default values
    const requestBody = {
      user_info: {
        name: userInfo.name || "guest",
        // Always include these fields with default values if not available
        wallet_balance:
          userInfo.wallet_balance !== null && userInfo.wallet_balance !== undefined
            ? Number(userInfo.wallet_balance)
            : 0,
        available_loans: Array.isArray(userInfo.available_loans)
          ? userInfo.available_loans.map((loan) => ({
              id: loan.id || "string",
              loan_application_id: loan.loan_application_id || "string",
              amount_disbursed:
                loan.amount_disbursed !== null && loan.amount_disbursed !== undefined
                  ? Number(loan.amount_disbursed)
                  : 0,
              interest_rate:
                loan.interest_rate !== null && loan.interest_rate !== undefined ? Number(loan.interest_rate) : 0,
              created_at: new Date().toISOString(), // Use current time
            }))
          : [
              {
                id: "string",
                loan_application_id: "string",
                amount_disbursed: 0,
                interest_rate: 0,
                created_at: new Date().toISOString(),
              },
            ],
        credit_score:
          userInfo.credit_score !== null && userInfo.credit_score !== undefined ? Number(userInfo.credit_score) : 0,
      },
      query: body.query || "",
      context: Array.isArray(body.context)
        ? body.context.map((msg, index) => ({
            message_position: msg.message_position || index,
            sender: msg.sender === "user" ? "user" : "ai",
            message: msg.message || "",
          }))
        : [],
    }

    // Log the request for debugging
    console.log(
      "AI service request:",
      JSON.stringify(
        {
          url: "https://farmcreditai.onrender.com/converse",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
            "x-user-role": userRole,
          },
          body: requestBody,
        },
        null,
        2,
      ),
    )

    // Forward the request to the AI service
    const response = await fetch("https://farmcreditai.onrender.com/converse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
        "x-user-role": userRole,
      },
      body: JSON.stringify(requestBody),
    })

    // Log response status and headers
    console.log(`AI service response status: ${response.status}`)
    console.log(`AI service response headers:`, Object.fromEntries(response.headers.entries()))

    // Handle non-OK responses
    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = "Unknown error"
      try {
        const errorResponse = await response.json()
        errorDetails = JSON.stringify(errorResponse)
        console.error("AI service error response:", errorDetails)
      } catch (parseError) {
        try {
          errorDetails = await response.text()
          console.error("AI service error text:", errorDetails)
        } catch (textError) {
          console.error("Could not parse error response")
        }
      }

      throw new Error(`AI service responded with status: ${response.status}. Details: ${errorDetails}`)
    }

    // Parse successful response
    const data = await response.json()
    console.log("AI service successful response:", JSON.stringify(data, null, 2))

    // Return properly formatted response
    return NextResponse.json({
      success: true,
      response: data.data?.answer || "Sorry, I couldn't process your request at this time.",
      responseCode: data.responseCode,
      responseMessage: data.responseMessage,
    })
  } catch (error) {
    console.error("Error in AI conversation:", error)
    return NextResponse.json(
      {
        success: false,
        response: "Failed to get response from AI service. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
