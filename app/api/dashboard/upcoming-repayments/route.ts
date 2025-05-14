import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { createClient } from "@/lib/supabase-server"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: Request) {
  try {
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
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    if (!userId || userRole !== "farmer") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
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

    // Get upcoming loan repayments
    const { data: repaymentData, error: repaymentError } = await supabase
      .from("loan_repayments")
      .select(`
        id,
        periodic_repayment_amount,
        due_date,
        loan_contract_id,
        loan_contract:loan_contract_id (
          id,
          loan_application_id,
          financier_id,
          amount_disbursed,
          interest_rate,
          loan_application:loan_application_id (
            id,
            farmer_id,
            purpose_category,
            amount_requested
          )
        )
      `)
      .gt("due_date", new Date().toISOString())
      .order("due_date", { ascending: true })

    if (repaymentError) {
      console.error("Error fetching upcoming repayments:", repaymentError)
      return NextResponse.json({ error: "Database Error", message: "Failed to fetch repayments" }, { status: 500 })
    }

    // Filter repayments for the current farmer
    const farmerRepayments = repaymentData.filter(
      (repayment) => repayment.loan_contract?.loan_application?.farmer_id === userId,
    )

    if (farmerRepayments.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Get lender information for each repayment
    const lenderIds = farmerRepayments
      .map((repayment) => repayment.loan_contract?.financier_id)
      .filter((id): id is string => !!id)

    const { data: lendersData, error: lendersError } = await supabase
      .from("lenders")
      .select("id, organization_name")
      .in("id", lenderIds)

    if (lendersError) {
      console.error("Error fetching lenders:", lendersError)
      return NextResponse.json({ error: "Database Error", message: "Failed to fetch lenders" }, { status: 500 })
    }

    // Transform the data to the format we need
    const repayments = farmerRepayments.map((repayment) => {
      const lender = lendersData.find((l) => l.id === repayment.loan_contract?.financier_id)

      return {
        id: repayment.id,
        amount: repayment.periodic_repayment_amount,
        dueDate: repayment.due_date,
        status: "pending",
        details: {
          loanName: repayment.loan_contract?.loan_application?.purpose_category || "Loan",
          loanAmount: repayment.loan_contract?.amount_disbursed || 0,
          loanTerm: "12 months", // This information might not be directly available
          interestRate: `${repayment.loan_contract?.interest_rate || 0}%`,
          lender: lender?.organization_name || "Unknown Lender",
          paymentMethod: "Bank Transfer",
          contractId: repayment.loan_contract?.id,
          loanId: repayment.loan_contract?.loan_application?.id,
        },
      }
    })

    return NextResponse.json({ success: true, data: repayments })
  } catch (error) {
    console.error("Error in upcoming-repayments API:", error)
    return NextResponse.json({ error: "Internal Server Error", message: "Failed to fetch repayments" }, { status: 500 })
  }
}
