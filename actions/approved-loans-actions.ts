"use server"

import { cookies } from "next/headers"
import * as jose from "jose"
import { supabaseAdmin } from "@/lib/supabase-admin"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get the current user session
async function getCurrentUser() {
  const sessionCookie = cookies().get("session")?.value

  if (!sessionCookie) {
    console.log("No session cookie found")
    return null
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

    return payload
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return null
  }
}

interface GetApprovedLoansParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export async function getApprovedLoans({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}: GetApprovedLoansParams = {}) {
  try {
    // Get current user session
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { error: "Unauthorized access" }
    }

    const lenderId = user.id

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build query using the correct tables from your schema
    let query = supabaseAdmin
      .from("loan_contract")
      .select(`
        id,
        amount_disbursed,
        interest_rate,
        status,
        created_at,
        loan_application:loan_application_id (
          id,
          farmer_id,
          loan_duration_days,
          farmers:farmer_id (
            id,
            full_name
          )
        )
      `)
      .eq("financier_id", lenderId)
      .order("created_at", { ascending: false })

    // Add search filter if provided
    if (search) {
      query = query.textSearch("loan_application.farmers.full_name", search)
    }

    // Add status filter if provided
    if (status) {
      query = query.eq("status", status)
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from("loan_contract")
      .select("id", { count: "exact", head: true })
      .eq("financier_id", lenderId)

    // Execute query with pagination
    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching approved loans:", error)
      return { error: `Failed to fetch approved loans: ${error.message}` }
    }

    // Format the response
    const loans = data.map((contract) => {
      // Calculate due date based on created_at and loan_duration_days
      const createdAt = new Date(contract.created_at)
      const durationDays = contract.loan_application?.loan_duration_days || 30
      const dueDate = new Date(createdAt)
      dueDate.setDate(dueDate.getDate() + durationDays)

      return {
        id: contract.id,
        farmer_name: contract.loan_application?.farmers?.full_name || "Unknown Farmer",
        amount: contract.amount_disbursed || 0,
        status: contract.status,
        created_at: contract.created_at,
        due_date: dueDate.toISOString(),
      }
    })

    return {
      loans,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
      totalCount: count,
    }
  } catch (error) {
    console.error("Error in getApprovedLoans:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getApprovedLoanDetails(loanId: string) {
  try {
    // Get current user session
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { error: "Unauthorized access" }
    }

    const lenderId = user.id

    // Get loan details using the correct schema
    const { data, error } = await supabaseAdmin
      .from("loan_contract")
      .select(`
        *,
        loan_application:loan_application_id (
          *,
          farmer:farmer_id (
            *,
            address:address_id (*)
          ),
          farm:farm_id (*)
        )
      `)
      .eq("id", loanId)
      .eq("financier_id", lenderId)
      .single()

    if (error) {
      console.error("Error fetching loan details:", error)
      return { error: `Failed to fetch loan details: ${error.message}` }
    }

    // Get repayments for this loan
    const { data: repayments, error: repaymentsError } = await supabaseAdmin
      .from("loan_repayments")
      .select("*")
      .eq("loan_contract_id", loanId)
      .order("due_date", { ascending: true })

    if (repaymentsError) {
      console.error("Error fetching loan repayments:", repaymentsError)
    }

    return {
      loan: data,
      repayments: repayments || [],
    }
  } catch (error) {
    console.error("Error in getApprovedLoanDetails:", error)
    return { error: "An unexpected error occurred" }
  }
}
