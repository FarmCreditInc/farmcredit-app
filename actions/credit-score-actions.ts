"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function calculateCreditScore(farmerId: string) {
  try {
    const supabase = createClient()

    // Fetch farmer data
    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select("*, address_id")
      .eq("id", farmerId)
      .single()

    if (farmerError) {
      console.error("Error fetching farmer data:", farmerError)
      return {
        success: false,
        message: "Failed to fetch farmer data",
      }
    }

    // Fetch address data
    const { data: address, error: addressError } = await supabase
      .from("address")
      .select("*")
      .eq("id", farmer.address_id)
      .single()

    if (addressError && addressError.code !== "PGRST116") {
      console.error("Error fetching address data:", addressError)
      // Continue without address data
    }

    // Fetch next of kin data
    const { data: nextOfKin, error: nextOfKinError } = await supabase
      .from("farmer_next_of_kin")
      .select("*")
      .eq("farmer_id", farmerId)

    if (nextOfKinError) {
      console.error("Error fetching next of kin data:", nextOfKinError)
      // Continue without next of kin data
    }

    // Fetch farms data
    const { data: farms, error: farmsError } = await supabase.from("farms").select("*").eq("farmer_id", farmerId)

    if (farmsError) {
      console.error("Error fetching farms data:", farmsError)
      // Continue without farms data
    }

    // Fetch farm production data
    let farmProduction = []
    if (farms && farms.length > 0) {
      const farmIds = farms.map((farm) => farm.id)
      const { data: production, error: productionError } = await supabase
        .from("farm_production")
        .select("*")
        .in("farm_id", farmIds)

      if (productionError) {
        console.error("Error fetching farm production data:", productionError)
        // Continue without farm production data
      } else {
        farmProduction = production || []
      }
    }

    // Fetch loan application data
    const { data: loanApplications, error: loanApplicationsError } = await supabase
      .from("loan_application")
      .select("*")
      .eq("farmer_id", farmerId)

    if (loanApplicationsError) {
      console.error("Error fetching loan applications data:", loanApplicationsError)
      // Continue without loan applications data
    }

    // Fetch loan contracts data
    let loanContracts = []
    if (loanApplications && loanApplications.length > 0) {
      const loanApplicationIds = loanApplications.map((app) => app.id)
      const { data: contracts, error: contractsError } = await supabase
        .from("loan_contract")
        .select("*")
        .in("loan_application_id", loanApplicationIds)

      if (contractsError) {
        console.error("Error fetching loan contracts data:", contractsError)
        // Continue without loan contracts data
      } else {
        loanContracts = contracts || []
      }
    }

    // Fetch loan repayments data
    let loanRepayments = []
    if (loanContracts && loanContracts.length > 0) {
      const loanContractIds = loanContracts.map((contract) => contract.id)
      const { data: repayments, error: repaymentsError } = await supabase
        .from("loan_repayments")
        .select("*")
        .in("loan_contract_id", loanContractIds)

      if (repaymentsError) {
        console.error("Error fetching loan repayments data:", repaymentsError)
        // Continue without loan repayments data
      } else {
        loanRepayments = repayments || []
      }
    }

    // Fetch transaction history data
    const { data: transactionHistory, error: transactionHistoryError } = await supabase
      .from("transaction_history")
      .select("*")
      .eq("farmer_id", farmerId)

    if (transactionHistoryError) {
      console.error("Error fetching transaction history data:", transactionHistoryError)
      // Continue without transaction history data
    }

    // Prepare the request payload
    const payload = {
      farmers: {
        id: farmer.id,
        age: farmer.age || 0,
        created_at: farmer.created_at,
        highest_education: farmer.education_level || "",
        gender: farmer.gender || "",
        mobile_wallet_balance: 0, // Default to 0 if not available
        bvn: "", // Default to empty string if not available
        other_sources_of_income: "", // Default to empty string if not available
      },
      farmer_next_of_kin: (nextOfKin || []).map((kin) => ({
        id: kin.id,
        farmer_id: kin.farmer_id,
        full_name: kin.full_name || "",
      })),
      farms: (farms || []).map((farm) => ({
        id: farm.id,
        farmer_id: farm.farmer_id,
        size: farm.size || 0,
        start_date: farm.start_date || new Date().toISOString(),
        number_of_harvests: farm.number_of_harvests || 0,
      })),
      farm_production: (farmProduction || []).map((prod) => ({
        id: prod.id,
        farm_id: prod.farm_id,
        type: prod.type || "",
        expected_yield: prod.expected_yield || 0,
        expected_unit_profit: prod.expected_unit_profit || 0,
      })),
      address: address
        ? [
            {
              id: address.id,
              geopolitical_zone: address.geopolitical_zone || "",
              latitude: address.latitude || 0,
              longitude: address.longitude || 0,
            },
          ]
        : [],
      loan_application: (loanApplications || []).map((app) => ({
        id: app.id,
        farmer_id: app.farmer_id,
        amount_requested: app.amount_requested || 0,
        existing_loans: app.existing_loans === true,
        total_existing_loan_amount: app.total_existing_loan_amount || 0,
        status: app.status || "",
        created_at: app.created_at,
      })),
      loan_contract: (loanContracts || []).map((contract) => ({
        id: contract.id,
        loan_application_id: contract.loan_application_id,
        amount_disbursed: contract.amount_disbursed || 0,
        interest_rate: contract.interest_rate || 0,
        created_at: contract.created_at,
      })),
      loan_repayments: (loanRepayments || []).map((repayment) => ({
        id: repayment.id,
        loan_contract_id: repayment.loan_contract_id,
        periodic_repayment_amount: repayment.periodic_repayment_amount || 0,
        interest_amount: repayment.interest_amount || 0,
        created_at: repayment.created_at,
        date_paid: new Date().toISOString(),
        due_date: new Date().toISOString(), // Use current date instead of null
      })),
      transaction_history: (transactionHistory || []).map((transaction) => {
        // Create a new transaction_data object with only numeric values
        const numericTransactionData = {}

        // Only include amount and other numeric fields
        if (transaction.transaction_data) {
          if (typeof transaction.transaction_data.amount === "number") {
            numericTransactionData.amount = transaction.transaction_data.amount
          }

          // Add any other numeric fields that might be present
          if (typeof transaction.transaction_data.total_amount === "number") {
            numericTransactionData.total_amount = transaction.transaction_data.total_amount
          }

          if (typeof transaction.transaction_data.penalty === "number") {
            numericTransactionData.penalty = transaction.transaction_data.penalty
          }
        }

        return {
          id: transaction.id,
          farmer_id: transaction.farmer_id,
          transaction_data: numericTransactionData,
          created_at: transaction.created_at,
        }
      }),
    }

    // Make the API call to calculate credit score
    const response = await fetch("https://farmcreditai.onrender.com/calculate_credit_score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API error:", JSON.stringify(errorData))
      return {
        success: false,
        message: `API error: ${JSON.stringify(errorData)}`,
      }
    }

    const data = await response.json()

    if (data.responseCode !== 200) {
      return {
        success: false,
        message: data.responseMessage || "Failed to calculate credit score",
      }
    }

    // Extract the credit score
    const creditScore = data.data.credit_score
    const creditRating = data.data.credit_rating

    // Store the credit score in the database
    const { error: insertError } = await supabase.from("credit_scores").insert({
      farmer_id: farmerId,
      credit_score: creditScore,
    })

    if (insertError) {
      console.error("Error storing credit score:", insertError)
      return {
        success: false,
        message: "Credit score calculated but failed to store in database",
      }
    }

    // Revalidate the dashboard page to show the updated credit score
    revalidatePath("/dashboard/farmer")
    revalidatePath("/dashboard/farmer/credit-score")

    return {
      success: true,
      message: "Credit score calculated successfully",
      creditScore,
      creditRating,
    }
  } catch (error) {
    console.error("Error calculating credit score:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
