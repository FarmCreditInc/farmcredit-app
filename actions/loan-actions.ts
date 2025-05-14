"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import * as jose from "jose"
import { v4 as uuidv4 } from "uuid"
import { calculateCreditScore } from "./credit-score-actions"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get the current user session
async function getCurrentUser() {
  const sessionCookie = cookies().get("session")?.value

  if (!sessionCookie) {
    console.log("No session cookie found in loan-actions")
    return null
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

    console.log("User session verified in loan-actions:", payload.email)
    return payload
  } catch (error) {
    console.error("Error verifying JWT in loan-actions:", error)
    return null
  }
}

// Function to upload a file to Supabase storage
async function uploadFile(file: File, path: string): Promise<string | null> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    // Upload the file to Supabase storage
    const { data, error } = await supabaseAdmin.storage.from("farmer-docs").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      throw new Error(`Error uploading file: ${error.message}`)
    }

    // Get the public URL for the file
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("farmer-docs").getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error("File upload error:", error)
    return null
  }
}

// Update the calculateOutstandingLoanAmount function to include interest
async function calculateOutstandingLoanAmount(farmerId: string) {
  try {
    // Step 1: Get all loan applications for this farmer
    const { data: loanApplications, error: loanAppError } = await supabaseAdmin
      .from("loan_application")
      .select("id")
      .eq("farmer_id", farmerId)

    if (loanAppError) {
      console.error("Error fetching loan applications:", loanAppError)
      return 0
    }

    if (!loanApplications || loanApplications.length === 0) {
      return 0
    }

    // Get all loan application IDs
    const loanAppIds = loanApplications.map((app) => app.id)

    // Step 2: Get all active loan contracts for these applications
    const { data: activeContracts, error: contractsError } = await supabaseAdmin
      .from("loan_contract")
      .select("id, amount_disbursed, interest_rate")
      .in("loan_application_id", loanAppIds)
      .eq("status", "active")

    if (contractsError) {
      console.error("Error fetching active contracts:", contractsError)
      return 0
    }

    if (!activeContracts || activeContracts.length === 0) {
      return 0
    }

    // Step 3: Calculate total outstanding amount by considering repayments and interest
    let totalOutstanding = 0

    for (const contract of activeContracts) {
      // Get the original disbursed amount
      const originalAmount = contract.amount_disbursed || 0
      const interestRate = contract.interest_rate || 0

      // Calculate interest amount
      const interestAmount = originalAmount * (interestRate / 100)
      const totalAmountWithInterest = originalAmount + interestAmount

      // Get all repayments for this contract
      const { data: repayments, error: repaymentsError } = await supabaseAdmin
        .from("loan_repayments")
        .select("periodic_repayment_amount, date_paid")
        .eq("loan_contract_id", contract.id)
        .not("date_paid", "is", null) // Only consider paid repayments

      if (repaymentsError) {
        console.error("Error fetching repayments:", repaymentsError)
        totalOutstanding += totalAmountWithInterest // If error, assume no repayments
        continue
      }

      // Calculate total repaid amount
      const totalRepaid = (repayments || []).reduce((sum, repayment) => {
        return sum + (repayment.periodic_repayment_amount || 0)
      }, 0)

      // Add the outstanding amount (including interest) to the total
      totalOutstanding += totalAmountWithInterest - totalRepaid
    }

    return Math.max(0, totalOutstanding)
  } catch (error) {
    console.error("Error calculating outstanding loan amount:", error)
    return 0
  }
}

// Function to calculate existing loan information for a farmer
async function calculateExistingLoanInfo(farmerId: string) {
  try {
    // Step 1: Get all loan applications for this farmer
    const { data: loanApplications, error: loanAppError } = await supabaseAdmin
      .from("loan_application")
      .select("id")
      .eq("farmer_id", farmerId)

    if (loanAppError) {
      console.error("Error fetching loan applications:", loanAppError)
      throw new Error(`Error fetching loan applications: ${loanAppError.message}`)
    }

    if (!loanApplications || loanApplications.length === 0) {
      return {
        existing_loans: false,
        total_existing_loan_amount: 0,
        existing_loan_duration_days: 0,
      }
    }

    // Get all loan application IDs
    const loanAppIds = loanApplications.map((app) => app.id)

    // Step 2: Check if the farmer has any active loan contracts
    const { data: activeContracts, error: contractsError } = await supabaseAdmin
      .from("loan_contract")
      .select(`
        id,
        amount_disbursed,
        loan_application_id,
        loan_application:loan_application_id (loan_duration_days)
      `)
      .in("loan_application_id", loanAppIds)
      .eq("status", "active")

    if (contractsError) {
      console.error("Error fetching active contracts:", contractsError)
      throw new Error(`Error fetching active contracts: ${contractsError.message}`)
    }

    // If no active contracts, return default values
    if (!activeContracts || activeContracts.length === 0) {
      return {
        existing_loans: false,
        total_existing_loan_amount: 0,
        existing_loan_duration_days: 0,
      }
    }

    // Step 3: Calculate total outstanding amount considering repayments
    const totalOutstandingAmount = await calculateOutstandingLoanAmount(farmerId)

    // Step 4: Calculate average loan duration in days
    let totalDays = 0
    let contractsWithDuration = 0

    activeContracts.forEach((contract) => {
      if (contract.loan_application && contract.loan_application.loan_duration_days) {
        totalDays += contract.loan_application.loan_duration_days
        contractsWithDuration++
      }
    })

    const averageDurationDays = contractsWithDuration > 0 ? Math.round(totalDays / contractsWithDuration) : 0

    return {
      existing_loans: true,
      total_existing_loan_amount: totalOutstandingAmount,
      existing_loan_duration_days: averageDurationDays,
    }
  } catch (error) {
    console.error("Error calculating existing loan info:", error)
    // Return default values in case of error
    return {
      existing_loans: false,
      total_existing_loan_amount: 0,
      existing_loan_duration_days: 0,
    }
  }
}

// Submit loan application
export async function submitLoanApplication(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      return { success: false, error: "Unauthorized" }
    }

    // Get the farmer ID from the session
    const farmerId = user.id

    // First, calculate the credit score
    console.log("Calculating credit score before submitting loan application...")
    const creditScoreResult = await calculateCreditScore(farmerId)

    if (!creditScoreResult.success) {
      console.warn("Credit score calculation failed, but proceeding with loan application:", creditScoreResult.message)
      // We'll continue with the application even if credit score calculation fails
    } else {
      console.log("Credit score calculated successfully:", creditScoreResult.creditScore)
    }

    // Calculate existing loan information
    const loanInfo = await calculateExistingLoanInfo(farmerId)

    // Extract form data
    const purposeCategory = formData.get("purpose_category") as string
    const amountRequested = Number.parseFloat(formData.get("amount_requested") as string)
    const loanDurationDays = Number.parseInt(formData.get("loan_duration_days") as string)
    const preferredRepaymentPlan = formData.get("preferred_repayment_plan") as string
    const loanDescription = formData.get("loan_description") as string
    const interestRate = Number.parseFloat(formData.get("interest_rate") as string)
    const estimatedTotalRepayment = Number.parseFloat(formData.get("estimated_total_repayment") as string)

    // Get farm details from farm_id
    const farmId = formData.get("farm_id") as string
    if (!farmId) {
      return { success: false, error: "Farm ID is required" }
    }

    // Add this logging:
    console.log("Submitting loan application with farm_id:", farmId)

    // Fetch the farm details
    const { data: farmData, error: farmError } = await supabaseAdmin
      .from("farms")
      .select("*")
      .eq("id", farmId)
      .eq("farmer_id", farmerId) // Ensure the farm belongs to this farmer
      .single()

    if (farmError) {
      console.error("Error fetching farm details:", farmError.message)
      return { success: false, error: `Error fetching farm details: ${farmError.message}` }
    }

    // Get file uploads
    const businessPlan = formData.get("business_plan") as File
    const collateralDocument = formData.get("collateral_document") as File
    const salesRecord = formData.get("sales_record") as File
    const farmPhotos = formData.get("farm_photos") as File

    // Upload files to Supabase storage
    let businessPlanUrl = null
    let collateralDocumentUrl = null
    let businessSalesBookUrl = null
    let farmPhotosUrl = null

    if (businessPlan && businessPlan.size > 0) {
      businessPlanUrl = await uploadFile(businessPlan, `${farmerId}/business-plans`)
    }

    if (collateralDocument && collateralDocument.size > 0) {
      collateralDocumentUrl = await uploadFile(collateralDocument, `${farmerId}/collateral-docs`)
    }

    if (salesRecord && salesRecord.size > 0) {
      businessSalesBookUrl = await uploadFile(salesRecord, `${farmerId}/sales-records`)
    }

    if (farmPhotos && farmPhotos.size > 0) {
      farmPhotosUrl = await uploadFile(farmPhotos, `${farmerId}/farm-photos`)
    }

    // Insert the loan application into the database
    const { data, error } = await supabaseAdmin
      .from("loan_application")
      .insert({
        farmer_id: farmerId,
        purpose_category: purposeCategory,
        amount_requested: amountRequested,
        preferred_repayment_plan: preferredRepaymentPlan,
        business_plan_url: businessPlanUrl,
        collateral_document: collateralDocumentUrl,
        business_sales_book_url: businessSalesBookUrl,
        status: "pending",
        // Add the calculated loan information
        existing_loans: loanInfo.existing_loans,
        total_existing_loan_amount: loanInfo.total_existing_loan_amount,
        existing_loan_duration_days: loanInfo.existing_loan_duration_days,
        description: loanDescription, // Save the loan description to the description field
        farm_id: farmId,
        loan_duration_days: loanDurationDays, // Store the loan duration in days
        interest_rate: interestRate, // Store the calculated interest rate
        estimated_total_repayment: estimatedTotalRepayment, // Store the estimated total repayment
      })
      .select()

    if (error) {
      console.error("Error submitting loan application:", error)
      throw new Error(`Error submitting loan application: ${error.message}`)
    }

    return {
      success: true,
      data,
      creditScore: creditScoreResult.success ? creditScoreResult.creditScore : null,
    }
  } catch (error) {
    console.error("Submit loan application error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Get loan applications for a farmer
export async function getFarmerLoanApplications() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Get the farmer ID from the session
    const farmerId = user.id

    // Query the loan applications for this farmer
    const { data, error } = await supabaseAdmin
      .from("loan_application")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching loan applications: ${error.message}`)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Get farmer loan applications error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get existing loan information for a farmer
export async function getExistingLoanInfo() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      return {
        success: false,
        error: "Unauthorized",
        data: {
          existing_loans: false,
          total_existing_loan_amount: 0,
          existing_loan_duration_days: 0,
        },
      }
    }

    // Get the farmer ID from the session
    const farmerId = user.id
    console.log("Getting existing loan info for farmer:", farmerId)

    // Calculate existing loan information
    const loanInfo = await calculateExistingLoanInfo(farmerId)
    console.log("Calculated loan info:", loanInfo)

    return { success: true, data: loanInfo }
  } catch (error) {
    console.error("Get existing loan info error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: {
        existing_loans: false,
        total_existing_loan_amount: 0,
        existing_loan_duration_days: 0,
      },
    }
  }
}

// Get loan contracts for the current farmer
export async function getLoanContracts() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // First, get all loan applications for this farmer
    const { data: loanApplications, error: loanAppError } = await supabaseAdmin
      .from("loan_application")
      .select("id")
      .eq("farmer_id", user.id)

    if (loanAppError) {
      throw new Error(`Error fetching loan applications: ${loanAppError.message}`)
    }

    if (!loanApplications || loanApplications.length === 0) {
      return { success: true, data: [] }
    }

    // Get all loan application IDs
    const loanAppIds = loanApplications.map((app) => app.id)

    // Now get all contracts for these applications with vendor details
    const { data: contracts, error: contractsError } = await supabaseAdmin
      .from("loan_contract")
      .select(`
        *,
        loan_application:loan_application_id (purpose_category, status),
        vendors:vendor_id (
          id,
          name,
          contact_address,
          vendor_products (
            id,
            product,
            product_category,
            amount
          )
        )
      `)
      .in("loan_application_id", loanAppIds)

    if (contractsError) {
      throw new Error(`Error fetching loan contracts: ${contractsError.message}`)
    }

    return { success: true, data: contracts || [] }
  } catch (error) {
    console.error("Get loan contracts error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get loan repayments for a specific contract
export async function getLoanRepayments(contractId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    const { data: repayments, error } = await supabaseAdmin
      .from("loan_repayments")
      .select("*")
      .eq("loan_contract_id", contractId)
      .order("due_date", { ascending: true })

    if (error) {
      throw new Error(`Error fetching loan repayments: ${error.message}`)
    }

    return { success: true, data: repayments || [] }
  } catch (error) {
    console.error("Get loan repayments error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get all loan repayments for the current farmer
export async function getAllLoanRepayments() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Get contracts first
    const contractsResponse = await getLoanContracts()

    if (!contractsResponse.success || !contractsResponse.data || contractsResponse.data.length === 0) {
      return { success: true, data: [] }
    }

    const contracts = contractsResponse.data

    // For each contract, get repayments
    const repaymentsByContract = []

    for (const contract of contracts) {
      const { data: repayments, error } = await supabaseAdmin
        .from("loan_repayments")
        .select("*")
        .eq("loan_contract_id", contract.id)
        .order("due_date", { ascending: true })

      if (error) {
        console.error(`Error fetching repayments for contract ${contract.id}:`, error)
        continue
      }

      repaymentsByContract.push({
        contractId: contract.id,
        purpose: contract.loan_application?.purpose || "Loan",
        repayments: repayments || [],
      })
    }

    return { success: true, data: repaymentsByContract }
  } catch (error) {
    console.error("Get all loan repayments error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}
