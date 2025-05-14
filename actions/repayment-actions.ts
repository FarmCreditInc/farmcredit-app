"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { v4 as uuidv4 } from "uuid"
import { getSession } from "@/lib/auth-utils"

// Calculate platform fee based on the tiered structure
function calculatePlatformFee(amount: number): number {
  if (amount <= 20000) return 100
  if (amount <= 50000) return 200
  if (amount <= 100000) return 500
  if (amount <= 200000) return 1000
  return 1500
}

// Get active loans with repayment information for the current farmer
export async function getActiveLoansWithRepayments() {
  try {
    // Use the custom JWT authentication
    const session = await getSession()

    if (!session || session.role !== "farmer") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Get all loan applications for this farmer
    const { data: loanApplications, error: loanAppError } = await supabaseAdmin
      .from("loan_application")
      .select("id")
      .eq("farmer_id", session.id)

    if (loanAppError) {
      throw new Error(`Error fetching loan applications: ${loanAppError.message}`)
    }

    if (!loanApplications || loanApplications.length === 0) {
      return { success: true, data: [] }
    }

    // Get all loan application IDs
    const loanAppIds = loanApplications.map((app) => app.id)

    // Get active loan contracts for these applications with lender details
    const { data: contracts, error: contractsError } = await supabaseAdmin
      .from("loan_contract")
      .select(`
        id,
        loan_application_id,
        financier_id,
        amount_disbursed,
        interest_rate,
        created_at,
        status,
        loan_application:loan_application_id (
          purpose_category,
          description,
          loan_duration_days,
          estimated_total_repayment,
          farmer_id
        ),
        lender:financier_id (
          organization_name,
          email
        )
      `)
      .in("loan_application_id", loanAppIds)
      .eq("status", "active")

    if (contractsError) {
      throw new Error(`Error fetching loan contracts: ${contractsError.message}`)
    }

    if (!contracts || contracts.length === 0) {
      return { success: true, data: [] }
    }

    // For each contract, get repayments and calculate totals
    const loansWithRepayments = []

    for (const contract of contracts) {
      // Get farmer's email
      const { data: farmer, error: farmerError } = await supabaseAdmin
        .from("farmers")
        .select("email")
        .eq("id", contract.loan_application.farmer_id)
        .single()

      if (!farmerError && farmer) {
        // Add farmer email to the loan_application object
        contract.loan_application.farmer_email = farmer.email
      }

      // Get repayments for this contract
      const { data: repayments, error: repaymentsError } = await supabaseAdmin
        .from("loan_repayments")
        .select("*")
        .eq("loan_contract_id", contract.id)
        .order("created_at", { ascending: false })

      if (repaymentsError) {
        console.error(`Error fetching repayments for contract ${contract.id}:`, repaymentsError)
        continue
      }

      // Calculate total paid and total due
      let totalPaid = 0

      repayments?.forEach((repayment) => {
        if (repayment.date_paid) {
          totalPaid += Number(repayment.periodic_repayment_amount || 0)
        }
      })

      // Total due is the loan amount plus interest (from estimated_total_repayment)
      const totalDue = Number(contract.loan_application.estimated_total_repayment || 0)

      // Calculate remaining amount
      const remainingAmount = totalDue - totalPaid

      // Calculate progress percentage
      const progressPercentage = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0

      loansWithRepayments.push({
        contract,
        repayments: repayments || [],
        totalPaid,
        totalDue,
        remainingAmount,
        progressPercentage,
      })
    }

    return { success: true, data: loansWithRepayments }
  } catch (error) {
    console.error("Get active loans with repayments error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Initialize a loan repayment
export async function initializeLoanRepayment(formData: FormData) {
  try {
    // Use the custom JWT authentication
    const session = await getSession()

    if (!session || session.role !== "farmer") {
      return { success: false, error: "Unauthorized" }
    }

    const contractId = formData.get("contractId") as string
    const amount = Number(formData.get("amount"))
    const penalty = Number(formData.get("penalty") || 0)
    const totalAmount = amount + penalty

    if (!contractId || !amount || amount <= 0) {
      return { success: false, error: "Invalid payment details" }
    }

    // Verify the contract belongs to this farmer
    const { data: contract, error: contractError } = await supabaseAdmin
      .from("loan_contract")
      .select(`
        id,
        loan_application_id,
        financier_id,
        amount_disbursed,
        loan_application:loan_application_id (
          farmer_id,
          estimated_total_repayment
        )
      `)
      .eq("id", contractId)
      .single()

    if (contractError || !contract || contract.loan_application.farmer_id !== session.id) {
      return { success: false, error: "Contract not found or unauthorized" }
    }

    // Generate a unique reference for this payment
    const reference = `loan-repay-${uuidv4().substring(0, 8)}`

    // Calculate platform fee
    const platformFee = calculatePlatformFee(totalAmount)

    // Total amount to charge (including platform fee)
    const amountToCharge = totalAmount + platformFee

    // Store transaction data in transaction_history
    const transactionData = {
      contractId,
      farmerId: session.id,
      lenderId: contract.financier_id,
      amount,
      penalty,
      platformFee,
      totalAmount,
      reference,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    const { error: historyError } = await supabaseAdmin.from("transaction_history").insert({
      id: uuidv4(),
      farmer_id: session.id,
      transaction_data: transactionData,
      extracted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })

    if (historyError) {
      console.error("Error storing transaction history:", historyError)
      return { success: false, error: "Failed to initialize payment" }
    }

    // Store platform fee record
    const { error: platformFeeError } = await supabaseAdmin.from("platform_fees").insert({
      id: uuidv4(),
      loan_contract_id: contractId,
      amount: platformFee,
      fee_percentage: 1.0, // Default value as per schema
      status: "pending",
      created_at: new Date().toISOString(),
    })

    if (platformFeeError) {
      console.error("Error storing platform fee:", platformFeeError)
      // Continue anyway, this is just for record-keeping
    }

    return {
      success: true,
      data: {
        reference,
        amount: amountToCharge, // Include platform fee in the amount to charge
        contractId,
        platformFee,
      },
    }
  } catch (error) {
    console.error("Initialize loan repayment error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Process a Paystack payment - verify and update all necessary tables
export async function processPaystackPayment(reference: string) {
  try {
    console.log(`Processing Paystack payment with reference: ${reference}`)

    // Check if this payment has already been processed
    const { data: existingTransaction } = await supabaseAdmin
      .from("transaction_history")
      .select("*")
      .or(`transaction_data->reference.eq.${reference},transaction_data->paystackReference.eq.${reference}`)
      .eq("transaction_data->status", "completed")
      .single()

    if (existingTransaction) {
      console.log("Payment already processed:", existingTransaction)
      return {
        success: true,
        message: "Payment already processed",
        alreadyProcessed: true,
        data: existingTransaction.transaction_data,
        paystackData: null,
      }
    }

    // Step 1: Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return { success: false, error: "Paystack secret key not configured" }
    }

    console.log(`Sending verification request to Paystack for reference: ${reference}`)
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    })

    const verifyData = await verifyResponse.json()
    console.log("Paystack verification response:", JSON.stringify(verifyData, null, 2))

    // Check if Paystack verification was successful
    if (!verifyData.status) {
      return {
        success: false,
        error: verifyData.message || "Payment verification failed",
        paystackData: null,
      }
    }

    const paystackPaymentData = verifyData.data

    // Check if the payment status is successful
    if (paystackPaymentData.status !== "success") {
      return {
        success: false,
        error: `Payment status is ${paystackPaymentData.status}`,
        paystackData: paystackPaymentData,
      }
    }

    // At this point, Paystack has confirmed the payment was successful
    // Now process the payment in our database

    // Step 2: Get or create transaction history record
    let transactionHistory: any
    let transactionData: any
    let contractId: string
    let farmerId: string
    let lenderId: string
    let amount: number
    let penalty = 0
    let platformFee: number

    // Try to find existing transaction history
    const { data: existingHistory, error: historyError } = await supabaseAdmin
      .from("transaction_history")
      .select("*")
      .eq("transaction_data->reference", reference)
      .single()

    if (historyError || !existingHistory) {
      console.log("Transaction history not found, creating from Paystack data")

      // Extract data from Paystack response
      if (!paystackPaymentData.metadata || !paystackPaymentData.metadata.contractId) {
        return {
          success: false,
          error: "Missing contract ID in Paystack metadata",
          paystackData: paystackPaymentData,
        }
      }

      contractId = paystackPaymentData.metadata.contractId
      platformFee = Number(paystackPaymentData.metadata.platformFee || 0)
      const totalAmount = paystackPaymentData.amount / 100 // Convert from kobo to naira
      amount = totalAmount - platformFee

      // Get contract details to get farmer and lender IDs
      const { data: contract, error: contractError } = await supabaseAdmin
        .from("loan_contract")
        .select(`
          id,
          financier_id,
          loan_application:loan_application_id (
            farmer_id
          )
        `)
        .eq("id", contractId)
        .single()

      if (contractError || !contract) {
        return {
          success: false,
          error: "Contract not found",
          paystackData: paystackPaymentData,
        }
      }

      farmerId = contract.loan_application.farmer_id
      lenderId = contract.financier_id

      // Create transaction data
      transactionData = {
        contractId,
        farmerId,
        lenderId,
        amount,
        penalty,
        platformFee,
        totalAmount,
        reference,
        paystackReference: paystackPaymentData.reference,
        status: "completed", // Set directly to completed since payment is successful
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      }

      // Insert transaction history
      const transactionId = uuidv4()
      const { error: newHistoryError } = await supabaseAdmin.from("transaction_history").insert({
        id: transactionId,
        farmer_id: farmerId,
        transaction_data: transactionData,
        extracted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })

      if (newHistoryError) {
        return {
          success: false,
          error: `Failed to create transaction record: ${newHistoryError.message}`,
          paystackData: paystackPaymentData,
        }
      }
    } else {
      // Use existing transaction history
      transactionHistory = existingHistory
      transactionData = transactionHistory.transaction_data

      if (transactionData.status === "completed") {
        return {
          success: true,
          message: "Transaction already processed",
          data: transactionData,
          paystackData: paystackPaymentData,
        }
      }

      // Update transaction data
      contractId = transactionData.contractId
      farmerId = transactionData.farmerId
      lenderId = transactionData.lenderId
      amount = transactionData.amount
      penalty = transactionData.penalty || 0
      platformFee = transactionData.platformFee || 0

      // Update transaction history status
      const now = new Date().toISOString()
      const updatedTransactionData = {
        ...transactionData,
        status: "completed",
        processedAt: now,
        paystackReference: paystackPaymentData.reference,
      }

      const { error: updateHistoryError } = await supabaseAdmin
        .from("transaction_history")
        .update({
          transaction_data: updatedTransactionData,
          extracted_at: now,
        })
        .eq("id", transactionHistory.id)

      if (updateHistoryError) {
        console.error("Error updating transaction history:", updateHistoryError)
        // Continue anyway, this is not critical
      }

      // Update transaction data for further processing
      transactionData = updatedTransactionData
    }

    // Step 3: Create a new repayment record
    const now = new Date().toISOString()
    const repaymentId = uuidv4()

    // Before creating the repayment record, fetch the loan contract and application to get the due date
    const { data: contractWithApplication, error: contractFetchError } = await supabaseAdmin
      .from("loan_contract")
      .select(`
    created_at,
    loan_application:loan_application_id (
      loan_duration_days
    )
  `)
      .eq("id", contractId)
      .single()

    if (contractFetchError) {
      console.error("Error fetching contract for due date calculation:", contractFetchError)
      // Continue with null due_date if we can't fetch the contract
    }

    // Calculate due date by adding loan_duration_days to contract created_at
    let dueDate = null
    if (
      contractWithApplication &&
      contractWithApplication.loan_application &&
      contractWithApplication.loan_application.loan_duration_days
    ) {
      const contractDate = new Date(contractWithApplication.created_at)
      const durationDays = contractWithApplication.loan_application.loan_duration_days
      dueDate = new Date(contractDate.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
    }

    const { error: createRepaymentError } = await supabaseAdmin.from("loan_repayments").insert({
      id: repaymentId,
      loan_contract_id: contractId,
      periodic_repayment_amount: amount,
      date_paid: now,
      created_at: now,
      fine_amount: penalty || 0,
      fine_paid: penalty > 0,
      fine_paid_at: penalty > 0 ? now : null,
      due_date: dueDate, // Add the calculated due date
    })

    if (createRepaymentError) {
      return {
        success: false,
        error: `Error creating repayment record: ${createRepaymentError.message}`,
        paystackData: paystackPaymentData,
      }
    }

    // Step 4: Update platform fee status or create if not exists
    const { data: existingFee } = await supabaseAdmin
      .from("platform_fees")
      .select("*")
      .eq("loan_contract_id", contractId)
      .eq("status", "pending")
      .single()

    if (existingFee) {
      // Update existing platform fee
      const { error: updateFeeError } = await supabaseAdmin
        .from("platform_fees")
        .update({
          status: "collected",
          collected_at: now,
        })
        .eq("id", existingFee.id)

      if (updateFeeError) {
        console.error("Error updating platform fee:", updateFeeError)
        // Continue anyway, this is not critical
      }
    } else {
      // Create new platform fee record
      const { error: newFeeError } = await supabaseAdmin.from("platform_fees").insert({
        id: uuidv4(),
        loan_contract_id: contractId,
        amount: platformFee,
        fee_percentage: 1.0,
        status: "collected", // Set directly to collected
        collected_at: now,
        created_at: now,
      })

      if (newFeeError) {
        console.error("Error creating platform fee:", newFeeError)
        // Continue anyway, this is not critical
      }
    }

    // Step 5: Get lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("lender_id", lenderId)
      .single()

    if (walletError || !wallet) {
      return {
        success: false,
        error: `Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`,
        paystackData: paystackPaymentData,
      }
    }

    // Step 6: Credit lender's wallet
    const newBalance = wallet.balance + amount

    // Step 7: Record transaction for lender with running balance
    const lenderTransactionId = uuidv4()
    const { error: lenderTransactionError } = await supabaseAdmin.from("transactions").insert({
      id: lenderTransactionId,
      wallet_id: wallet.id,
      type: "loan_repayment",
      amount: amount,
      purpose: `Loan repayment from farmer for contract ${contractId}`,
      reference: reference,
      running_balance: newBalance,
      status: "successful",
      created_at: now,
    })

    if (lenderTransactionError) {
      return {
        success: false,
        error: `Error recording lender transaction: ${lenderTransactionError.message}`,
        paystackData: paystackPaymentData,
      }
    }

    // Step 8: Update wallet balance
    const { error: updateWalletError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", wallet.id)

    if (updateWalletError) {
      return {
        success: false,
        error: `Error updating lender wallet: ${updateWalletError.message}`,
        paystackData: paystackPaymentData,
      }
    }

    // Step 9: Check if loan is fully repaid
    // Get total paid amount
    const { data: paidRepayments, error: paidError } = await supabaseAdmin
      .from("loan_repayments")
      .select("periodic_repayment_amount")
      .eq("loan_contract_id", contractId)
      .is("date_paid", "not.null")

    if (!paidError && paidRepayments) {
      const totalPaid = paidRepayments.reduce((sum, item) => sum + Number(item.periodic_repayment_amount || 0), 0)

      // Get loan contract and application details
      const { data: loanContract, error: loanError } = await supabaseAdmin
        .from("loan_contract")
        .select(`
          amount_disbursed,
          loan_application_id,
          loan_application:loan_application_id (
            estimated_total_repayment
          )
        `)
        .eq("id", contractId)
        .single()

      if (!loanError && loanContract && loanContract.loan_application) {
        const totalAmountWithInterest = Number(loanContract.loan_application.estimated_total_repayment || 0)

        if (totalPaid >= totalAmountWithInterest) {
          // Loan is fully repaid, mark as closed
          const { error: closeContractError } = await supabaseAdmin
            .from("loan_contract")
            .update({ status: "closed" })
            .eq("id", contractId)

          if (closeContractError) {
            console.error("Error closing loan contract:", closeContractError)
          }
        }
      }
    }

    return {
      success: true,
      message: "Payment processed successfully",
      data: {
        contractId,
        repaymentId,
        amount,
        platformFee,
      },
      paystackData: paystackPaymentData,
    }
  } catch (error) {
    console.error("Process Paystack payment error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      paystackData: null,
    }
  }
}

// Verify a Paystack payment for loan repayment
// This function is kept for backward compatibility
export async function verifyPaystackRepayment(reference: string) {
  console.log("verifyPaystackRepayment called with reference:", reference)
  // This function now delegates to the new processPaystackPayment function
  return processPaystackPayment(reference)
}
