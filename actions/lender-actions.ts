"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import * as jose from "jose"
import { v4 as uuidv4 } from "uuid"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { Resend } from "resend"

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY)

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Platform fee percentage (5%)
const PLATFORM_FEE_PERCENTAGE = 0.05

// Helper function to get the current user session
async function getCurrentUser() {
  const sessionCookie = cookies().get("session")?.value

  if (!sessionCookie) {
    console.log("No session cookie found in lender-actions")
    return null
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

    console.log("User session verified in lender-actions:", payload.email)
    return payload
  } catch (error) {
    console.error("Error verifying JWT in lender-actions:", error)
    return null
  }
}

// Get pending loan applications
export async function getPendingLoanApplications() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // First, get the loan applications with farmer details
    const { data: loanApplications, error: loanAppError } = await supabaseAdmin
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
      throw new Error(`Error fetching loan applications: ${loanAppError.message}`)
    }

    // If no applications, return empty array
    if (!loanApplications || loanApplications.length === 0) {
      return { success: true, data: [] }
    }

    // Get all farmer IDs from the applications
    const farmerIds = loanApplications.map((app) => app.farmer_id)

    // Get credit scores for these farmers in a separate query
    const { data: creditScores, error: creditScoreError } = await supabaseAdmin
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

    return { success: true, data: enrichedApplications }
  } catch (error) {
    console.error("Get pending loan applications error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get lender wallet
export async function getLenderWallet() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: null }
    }

    // Get the lender's wallet
    const { data: existingWallet, error: fetchError } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("lender_id", user.id)
      .maybeSingle() // Use maybeSingle instead of single to avoid error when no record exists

    // If wallet exists, return it
    if (existingWallet) {
      return { success: true, data: existingWallet }
    }

    // If no wallet exists, create one
    if (fetchError && fetchError.code !== "PGRST116") {
      // If it's an error other than "no rows returned", throw it
      throw new Error(`Error fetching lender wallet: ${fetchError.message}`)
    }

    // Create a new wallet for the lender
    console.log("Creating new wallet for lender:", user.id)
    const { data: newWallet, error: createError } = await supabaseAdmin
      .from("wallets")
      .insert({
        lender_id: user.id,
        balance: 0,
        locked_balance: 0,
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Error creating lender wallet: ${createError.message}`)
    }

    return { success: true, data: newWallet }
  } catch (error) {
    console.error("Get lender wallet error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: null,
    }
  }
}

// Approve loan application
export async function approveLoanApplication(loanApplicationId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized" }
    }

    // Start a transaction
    const { data: loanApplication, error: loanAppError } = await supabaseAdmin
      .from("loan_application")
      .select("*")
      .eq("id", loanApplicationId)
      .eq("status", "pending")
      .single()

    if (loanAppError || !loanApplication) {
      throw new Error(`Error fetching loan application: ${loanAppError?.message || "Loan application not found"}`)
    }

    // Get lender wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    // Calculate platform fee
    const loanAmount = loanApplication.amount_requested
    const platformFee = loanAmount * PLATFORM_FEE_PERCENTAGE
    const totalDebit = loanAmount + platformFee

    // Check if wallet has sufficient balance
    if (wallet.balance < totalDebit) {
      return {
        success: false,
        error: "Insufficient funds in wallet",
        requiredAmount: totalDebit,
        currentBalance: wallet.balance,
      }
    }

    // Begin transaction
    // 1. Debit lender wallet
    const newBalance = wallet.balance - totalDebit
    const { error: updateWalletError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", wallet.id)

    if (updateWalletError) {
      throw new Error(`Error updating lender wallet: ${updateWalletError.message}`)
    }

    // 2. Record transaction for loan funding
    const transactionId = uuidv4()
    const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
      id: transactionId,
      wallet_id: wallet.id,
      type: "loan_funding",
      amount: loanAmount,
      purpose: `Funding for loan application ${loanApplicationId}`,
      reference: loanApplicationId,
    })

    if (transactionError) {
      // Rollback wallet update
      await supabaseAdmin.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
      throw new Error(`Error recording transaction: ${transactionError.message}`)
    }

    // 3. Record transaction for platform fee
    const feeTransactionId = uuidv4()
    const { error: feeTransactionError } = await supabaseAdmin.from("transactions").insert({
      id: feeTransactionId,
      wallet_id: wallet.id,
      type: "fee",
      amount: platformFee,
      purpose: `Platform fee for loan application ${loanApplicationId}`,
      reference: loanApplicationId,
    })

    if (feeTransactionError) {
      // Rollback previous operations
      await supabaseAdmin.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
      await supabaseAdmin.from("transactions").delete().eq("id", transactionId)
      throw new Error(`Error recording fee transaction: ${feeTransactionError.message}`)
    }

    // 4. Create loan contract
    const contractId = uuidv4()
    const { error: contractError } = await supabaseAdmin.from("loan_contract").insert({
      id: contractId,
      loan_application_id: loanApplicationId,
      financier_id: user.id,
      amount_disbursed: loanAmount,
      interest_rate: 0.15, // 15% interest rate (can be made configurable)
      status: "active",
    })

    if (contractError) {
      // Rollback previous operations
      await supabaseAdmin.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
      await supabaseAdmin.from("transactions").delete().eq("id", transactionId)
      await supabaseAdmin.from("transactions").delete().eq("id", feeTransactionId)
      throw new Error(`Error creating loan contract: ${contractError.message}`)
    }

    // 5. Update loan application status
    const { error: updateLoanError } = await supabaseAdmin
      .from("loan_application")
      .update({ status: "approved" })
      .eq("id", loanApplicationId)

    if (updateLoanError) {
      // Rollback previous operations
      await supabaseAdmin.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
      await supabaseAdmin.from("transactions").delete().eq("id", transactionId)
      await supabaseAdmin.from("transactions").delete().eq("id", feeTransactionId)
      await supabaseAdmin.from("loan_contract").delete().eq("id", contractId)
      throw new Error(`Error updating loan application: ${updateLoanError.message}`)
    }

    // Generate and send loan contract
    const contractResult = await generateLoanContract(loanApplicationId, contractId)
    if (!contractResult.success) {
      console.error("Warning: Contract generation failed but loan was approved:", contractResult.error)
    }

    return { success: true, data: { contractId, contractGenerated: contractResult.success } }
  } catch (error) {
    console.error("Approve loan application error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Add this new function after the approveLoanApplication function but before the getApprovedLoans function

// Generate and send loan contract PDF
export async function generateLoanContract(loanApplicationId: string, contractId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: null }
    }

    // Get loan contract details
    const { data: contract, error: contractError } = await supabaseAdmin
      .from("loan_contract")
      .select(`
        *,
        loan_application:loan_application_id (
          *,
          farmer:farmer_id (
            id,
            full_name,
            email,
            phone,
            address_id
          )
        )
      `)
      .eq("id", contractId)
      .eq("financier_id", user.id)
      .single()

    if (contractError || !contract) {
      throw new Error(`Error fetching loan contract: ${contractError?.message || "Contract not found"}`)
    }

    // Get lender details with address
    const { data: lender, error: lenderError } = await supabaseAdmin
      .from("lenders")
      .select(`
        id,
        organization_name, 
        email, 
        phone,
        address:address_id (
          street_address,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq("id", user.id)
      .single()

    if (lenderError || !lender) {
      throw new Error(`Error fetching lender details: ${lenderError?.message || "Lender not found"}`)
    }

    // Get farmer address
    const { data: farmerAddress, error: farmerAddressError } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("id", contract.loan_application.farmer.address_id)
      .single()

    if (farmerAddressError && farmerAddressError.code !== "PGRST116") {
      console.error("Error fetching farmer address:", farmerAddressError)
      // Continue without address if there's an error
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

    let page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { width, height } = page.getSize()

    // Add header with theme color (green for FarmCredit)
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(0.15, 0.65, 0.35), // Green color for FarmCredit
    })

    // Add FarmCredit logo text in white
    page.drawText("FarmCredit", {
      x: 50,
      y: height - 60,
      size: 32,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    // Add contract title in white
    page.drawText("Loan Agreement", {
      x: 50,
      y: height - 90,
      size: 18,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    // Add contract reference number
    const contractReference = contractId.substring(0, 8).toUpperCase()
    page.drawText(`Contract Reference: ${contractReference}`, {
      x: width - 250,
      y: height - 90,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    // Add date
    const currentDate = new Date().toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    page.drawText(`Date: ${currentDate}`, {
      x: width - 250,
      y: height - 110,
      size: 10,
      font: timesRomanFont,
      color: rgb(1, 1, 1), // White color
    })

    // Start content after header
    let yPosition = height - 150

    // Add parties section
    page.drawText("PARTIES TO THE AGREEMENT", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    })

    yPosition -= 30

    // Lender details
    page.drawText("Lender:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    page.drawText(lender.organization_name, {
      x: 150,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
    })

    yPosition -= 20

    // Format lender address
    let lenderAddressText = ""
    if (lender.address) {
      const addressParts = []
      if (lender.address.street_address) addressParts.push(lender.address.street_address)
      if (lender.address.city) addressParts.push(lender.address.city)
      if (lender.address.state) addressParts.push(lender.address.state)
      if (lender.address.country) addressParts.push(lender.address.country)
      if (lender.address.postal_code) addressParts.push(lender.address.postal_code)

      lenderAddressText = addressParts.join(", ")
    }

    if (lenderAddressText) {
      page.drawText("Address:", {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
      })

      // Handle long addresses by splitting into multiple lines if needed
      const maxLineLength = 60
      if (lenderAddressText.length > maxLineLength) {
        const words = lenderAddressText.split(" ")
        let currentLine = ""
        let lineCount = 0

        for (const word of words) {
          if ((currentLine + " " + word).length <= maxLineLength) {
            currentLine += (currentLine ? " " : "") + word
          } else {
            page.drawText(currentLine, {
              x: 150,
              y: yPosition - lineCount * 15,
              size: 12,
              font: timesRomanFont,
            })
            lineCount++
            currentLine = word
          }
        }

        if (currentLine) {
          page.drawText(currentLine, {
            x: 150,
            y: yPosition - lineCount * 15,
            size: 12,
            font: timesRomanFont,
          })
          lineCount++
        }

        yPosition -= lineCount * 15
      } else {
        page.drawText(lenderAddressText, {
          x: 150,
          y: yPosition,
          size: 12,
          font: timesRomanFont,
        })
        yPosition -= 20
      }
    }

    // Lender contact
    page.drawText("Contact:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    page.drawText(`${lender.email}${lender.phone ? `, ${lender.phone}` : ""}`, {
      x: 150,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
    })

    yPosition -= 40

    // Farmer details
    page.drawText("Borrower:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    page.drawText(contract.loan_application.farmer.full_name, {
      x: 150,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
    })

    yPosition -= 20

    // Format farmer address
    let farmerAddressText = ""
    if (farmerAddress) {
      const addressParts = []
      if (farmerAddress.street_address) addressParts.push(farmerAddress.street_address)
      if (farmerAddress.city) addressParts.push(farmerAddress.city)
      if (farmerAddress.state) addressParts.push(farmerAddress.state)
      if (farmerAddress.country) addressParts.push(farmerAddress.country)
      if (farmerAddress.postal_code) addressParts.push(farmerAddress.postal_code)

      farmerAddressText = addressParts.join(", ")
    }

    if (farmerAddressText) {
      page.drawText("Address:", {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
      })

      // Handle long addresses by splitting into multiple lines if needed
      const maxLineLength = 60
      if (farmerAddressText.length > maxLineLength) {
        const words = farmerAddressText.split(" ")
        let currentLine = ""
        let lineCount = 0

        for (const word of words) {
          if ((currentLine + " " + word).length <= maxLineLength) {
            currentLine += (currentLine ? " " : "") + word
          } else {
            page.drawText(currentLine, {
              x: 150,
              y: yPosition - lineCount * 15,
              size: 12,
              font: timesRomanFont,
            })
            lineCount++
            currentLine = word
          }
        }

        if (currentLine) {
          page.drawText(currentLine, {
            x: 150,
            y: yPosition - lineCount * 15,
            size: 12,
            font: timesRomanFont,
          })
          lineCount++
        }

        yPosition -= lineCount * 15
      } else {
        page.drawText(farmerAddressText, {
          x: 150,
          y: yPosition,
          size: 12,
          font: timesRomanFont,
        })
        yPosition -= 20
      }
    }

    // Farmer contact
    page.drawText("Contact:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    page.drawText(
      `${contract.loan_application.farmer.email}${contract.loan_application.farmer.phone ? `, ${contract.loan_application.farmer.phone}` : ""}`,
      {
        x: 150,
        y: yPosition,
        size: 12,
        font: timesRomanFont,
      },
    )

    yPosition -= 40

    // Add loan details section
    page.drawText("LOAN DETAILS", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    })

    yPosition -= 30

    // Loan amount
    page.drawText("Loan Amount:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    page.drawText(formatCurrencyForPDF(contract.amount_disbursed), {
      x: 200,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
    })

    yPosition -= 20

    // Interest rate
    page.drawText("Interest Rate:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    page.drawText(`${contract.interest_rate * 100}% per annum`, {
      x: 200,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
    })

    yPosition -= 20

    // Loan term
    page.drawText("Loan Term:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    page.drawText(`${contract.loan_application.loan_duration_days || 12} months`, {
      x: 200,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
    })

    yPosition -= 20

    // Purpose
    page.drawText("Purpose:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    // Handle long purpose text by splitting into multiple lines if needed
    const purposeText = contract.loan_application.purpose || "Agricultural financing"
    const maxPurposeLength = 60
    if (purposeText.length > maxPurposeLength) {
      const words = purposeText.split(" ")
      let currentLine = ""
      let lineCount = 0

      for (const word of words) {
        if ((currentLine + " " + word).length <= maxPurposeLength) {
          currentLine += (currentLine ? " " : "") + word
        } else {
          page.drawText(currentLine, {
            x: 200,
            y: yPosition - lineCount * 15,
            size: 12,
            font: timesRomanFont,
          })
          lineCount++
          currentLine = word
        }
      }

      if (currentLine) {
        page.drawText(currentLine, {
          x: 200,
          y: yPosition - lineCount * 15,
          size: 12,
          font: timesRomanFont,
        })
        lineCount++
      }

      yPosition -= lineCount * 15
    } else {
      page.drawText(purposeText, {
        x: 200,
        y: yPosition,
        size: 12,
        font: timesRomanFont,
      })
      yPosition -= 20
    }

    yPosition -= 20

    // Add terms and conditions section
    page.drawText("TERMS AND CONDITIONS", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    })

    yPosition -= 30

    // Terms and conditions text
    const termsText = [
      "1. Disbursement: The loan amount shall be disbursed to the Borrower within 5 business days of the execution of this agreement.",
      "2. Repayment: The Borrower shall repay the loan in equal monthly installments over the term of the loan.",
      "3. Late Payment: A late payment fee of 2% will be charged on any payment that is more than 7 days overdue.",
      "4. Prepayment: The Borrower may prepay the loan in part or in full without penalty.",
      "5. Default: If the Borrower defaults on the loan, the Lender may take appropriate legal action to recover the outstanding amount.",
      "6. Amendments: Any amendments to this agreement must be in writing and signed by both parties.",
      "7. Governing Law: This agreement shall be governed by the laws of the Federal Republic of Nigeria.",
    ]

    // Draw each term with proper spacing
    for (const term of termsText) {
      // Check if we need a new page
      if (yPosition < 100) {
        // Add page number
        page.drawText("Page 1 of 2", {
          x: width - 100,
          y: 30,
          size: 10,
          font: timesRomanFont,
        })

        // Add new page
        page = pdfDoc.addPage([595.28, 841.89])
        yPosition = height - 50

        // Add page number to new page
        page.drawText("Page 2 of 2", {
          x: width - 100,
          y: 30,
          size: 10,
          font: timesRomanFont,
        })
      }

      // Handle long terms by splitting into multiple lines if needed
      const maxTermLength = 80
      if (term.length > maxTermLength) {
        const words = term.split(" ")
        let currentLine = ""
        let lineCount = 0
        let firstLine = true

        for (const word of words) {
          if ((currentLine + " " + word).length <= maxTermLength) {
            currentLine += (currentLine ? " " : "") + word
          } else {
            page.drawText(firstLine ? currentLine : "  " + currentLine, {
              x: 50,
              y: yPosition - lineCount * 15,
              size: 11,
              font: timesRomanFont,
            })
            lineCount++
            currentLine = word
            firstLine = false
          }
        }

        if (currentLine) {
          page.drawText(firstLine ? currentLine : "  " + currentLine, {
            x: 50,
            y: yPosition - lineCount * 15,
            size: 11,
            font: timesRomanFont,
          })
          lineCount++
        }

        yPosition -= lineCount * 15
      } else {
        page.drawText(term, {
          x: 50,
          y: yPosition,
          size: 11,
          font: timesRomanFont,
        })
        yPosition -= 20
      }

      yPosition -= 10 // Extra spacing between terms
    }

    yPosition -= 30

    // Add signatures section
    page.drawText("SIGNATURES", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    })

    yPosition -= 30

    // Lender signature
    page.drawText("Lender:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    })

    page.drawText(lender.organization_name, {
      x: 150,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
    })

    yPosition -= 40

    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 250, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    })

    page.drawText("Authorized Signature", {
      x: 50,
      y: yPosition - 15,
      size: 10,
      font: italicFont,
    })

    // Borrower signature (on the right side)
    page.drawText("Borrower:", {
      x: 300,
      y: yPosition + 40,
      size: 12,
      font: boldFont,
    })

    page.drawText(contract.loan_application.farmer.full_name, {
      x: 400,
      y: yPosition + 40,
      size: 12,
      font: timesRomanFont,
    })

    page.drawLine({
      start: { x: 300, y: yPosition },
      end: { x: 500, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    })

    page.drawText("Signature", {
      x: 300,
      y: yPosition - 15,
      size: 10,
      font: italicFont,
    })

    // Add footer
    const footerY = 60
    page.drawText("This is an official loan agreement document.", {
      x: 50,
      y: footerY,
      size: 10,
      font: timesRomanFont,
    })

    page.drawText(`Generated on ${currentDate}`, {
      x: 50,
      y: footerY - 15,
      size: 10,
      font: timesRomanFont,
    })

    // Add contact email
    page.drawText("support@farmcredit.com", {
      x: 50,
      y: footerY - 30,
      size: 10,
      font: timesRomanFont,
    })

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save()
    const pdfBuffer = Buffer.from(pdfBytes)

    // Send contract email to both lender and farmer
    try {
      const result = await sendContractEmail(
        lender.email,
        lender.organization_name,
        contract.loan_application.farmer.email,
        contract.loan_application.farmer.full_name,
        contractId,
        contract.amount_disbursed,
        contract.loan_application.purpose || "Agricultural financing",
        pdfBuffer,
      )

      return {
        success: true,
        data: {
          message: "Loan contract has been generated and sent to both parties",
          contractId,
          lenderEmail: lender.email,
          farmerEmail: contract.loan_application.farmer.email,
        },
      }
    } catch (emailError) {
      console.error("Error sending contract emails:", emailError)
      throw new Error(
        `Error sending contract emails: ${emailError instanceof Error ? emailError.message : "Unknown error"}`,
      )
    }
  } catch (error) {
    console.error("Generate loan contract error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: null,
    }
  }
}

// Add this new function after the getApprovedLoans function

// Get detailed loan information
export async function getLoanDetails(loanId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: null }
    }

    // Get the loan contract with loan application and farmer details
    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loan_contract")
      .select(`
        *,
        loan_application:loan_application_id (
          *,
          farmer:farmer_id (
            id,
            full_name,
            profile_url,
            email,
            phone,
            location,
            farming_experience
          ),
          farm:farm_id (
            id,
            name,
            size,
            location,
            primary_crop,
            secondary_crops,
            number_of_harvests,
            uses_irrigation,
            uses_fertilizer,
            uses_machinery,
            description
          )
        )
      `)
      .eq("id", loanId)
      .eq("financier_id", user.id)
      .single()

    if (loanError) {
      throw new Error(`Error fetching loan details: ${loanError.message}`)
    }

    // Get repayments for this loan with more detailed information
    const { data: repayments, error: repaymentsError } = await supabaseAdmin
      .from("loan_repayments")
      .select("*")
      .eq("loan_contract_id", loanId)
      .order("due_date", { ascending: true })

    if (repaymentsError) {
      throw new Error(`Error fetching loan repayments: ${repaymentsError.message}`)
    }

    // Calculate additional metrics
    const paidRepayments = (repayments || []).filter((r) => r.date_paid)
    const totalPaid = paidRepayments.reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalExpected = loan.amount_disbursed * (1 + loan.interest_rate)
    const remainingBalance = totalExpected - totalPaid

    // Find next payment
    const nextPayment = (repayments || [])
      .filter((r) => !r.date_paid)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

    return {
      success: true,
      data: {
        loan,
        repayments: repayments || [],
        summary: {
          totalPaid,
          totalExpected,
          remainingBalance,
          progressPercentage: Math.min(100, Math.round((totalPaid / totalExpected) * 100)),
          nextPaymentDate: nextPayment?.due_date || null,
          nextPaymentAmount: nextPayment?.amount || null,
        },
      },
    }
  } catch (error) {
    console.error("Get loan details error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: null,
    }
  }
}

// Get approved loans - FIXED to use profile_url instead of profile_image_url
export async function getApprovedLoans() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Query approved loans with loan application details and include repayment information
    const { data: contracts, error } = await supabaseAdmin
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
          purpose_category,
          loan_duration_days,
          farmer:farmer_id (
            id,
            full_name,
            email,
            profile_url
          )
        )
      `)
      .eq("financier_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching approved loans: ${error.message}`)
    }

    if (!contracts || contracts.length === 0) {
      return { success: true, data: [] }
    }

    // Get all contract IDs
    const contractIds = contracts.map((contract) => contract.id)

    // Fetch repayments for all contracts in a single query
    const { data: allRepayments, error: repaymentsError } = await supabaseAdmin
      .from("loan_repayments")
      .select("*")
      .in("loan_contract_id", contractIds)

    if (repaymentsError) {
      console.error("Error fetching repayments:", repaymentsError)
      // Continue without repayments data
    }

    // Group repayments by loan_contract_id
    const repaymentsByContract: Record<string, any[]> = {}
    if (allRepayments) {
      allRepayments.forEach((repayment) => {
        if (!repaymentsByContract[repayment.loan_contract_id]) {
          repaymentsByContract[repayment.loan_contract_id] = []
        }
        repaymentsByContract[repayment.loan_contract_id].push(repayment)
      })
    }

    // Enrich contracts with repayment information
    const enrichedContracts = contracts.map((contract) => {
      const contractRepayments = repaymentsByContract[contract.id] || []

      // Calculate total repaid amount
      const totalRepaid = contractRepayments
        .filter((r) => r.date_paid) // Only count paid repayments
        .reduce((sum, r) => sum + (r.amount || 0), 0)

      // Calculate total expected amount
      const totalExpected = contract.amount_disbursed * (1 + contract.interest_rate)

      // Find the next payment
      const nextPayment = contractRepayments
        .filter((r) => !r.date_paid) // Only unpaid repayments
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

      return {
        id: contract.id,
        loan_amount: contract.amount_disbursed,
        interest_rate: contract.interest_rate,
        loan_duration_days: contract.loan_application.loan_duration_days,
        status: contract.status,
        created_at: contract.created_at,
        disbursed_at: contract.created_at, // Using created_at as disbursed_at
        farmer_id: contract.loan_application.farmer.id,
        farmer_name: contract.loan_application.farmer.full_name,
        farmer_email: contract.loan_application.farmer.email,
        farmer_profile_url: contract.loan_application.farmer.profile_url,
        purpose: contract.loan_application.purpose_category,
        total_repaid: totalRepaid,
        total_expected: totalExpected,
        outstanding_balance: totalExpected - totalRepaid,
        next_payment_date: nextPayment?.due_date || null,
        next_payment_amount: nextPayment?.amount || null,
        repayment_progress: totalExpected > 0 ? (totalRepaid / totalExpected) * 100 : 0,
      }
    })

    return { success: true, data: enrichedContracts }
  } catch (error) {
    console.error("Get approved loans error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get loan repayments
export async function getLoanRepayments(contractId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Verify the contract belongs to this lender
    const { data: contract, error: contractError } = await supabaseAdmin
      .from("loan_contract")
      .select("id")
      .eq("id", contractId)
      .eq("financier_id", user.id)
      .single()

    if (contractError || !contract) {
      return { success: false, error: "Contract not found or unauthorized", data: [] }
    }

    // Get repayments for this contract
    const { data, error } = await supabaseAdmin
      .from("loan_repayments")
      .select("*")
      .eq("loan_contract_id", contractId)
      .order("due_date", { ascending: true })

    if (error) {
      throw new Error(`Error fetching loan repayments: ${error.message}`)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Get loan repayments error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Top up wallet
export async function topUpWallet(amount: number) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized" }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    try {
      // Update wallet balance directly
      const newBalance = wallet.balance + amount
      const { error: updateError } = await supabaseAdmin
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id)

      if (updateError) {
        throw new Error(`Error updating wallet balance: ${updateError.message}`)
      }

      // Record transaction WITHOUT setting running_balance
      const transactionId = uuidv4()
      const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
        id: transactionId,
        wallet_id: wallet.id,
        type: "credit",
        amount,
        purpose: "Wallet top-up",
        reference: `topup-${Date.now()}`,
        status: "successful",
      })

      if (transactionError) {
        // Rollback wallet update
        await supabaseAdmin.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
        throw new Error(`Error recording transaction: ${transactionError.message}`)
      }

      return { success: true, data: { newBalance, transactionId } }
    } catch (error) {
      console.error("Top up wallet error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }
    }
  } catch (error) {
    console.error("Top up wallet error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Withdraw funds
export async function withdrawFunds(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized" }
    }

    const amount = Number(formData.get("amount"))
    const bankName = formData.get("bankName") as string
    const accountNumber = formData.get("accountNumber") as string
    const accountName = formData.get("accountName") as string

    if (!amount || amount <= 0) {
      return { success: false, error: "Invalid withdrawal amount" }
    }

    if (!bankName || !accountNumber || !accountName) {
      return { success: false, error: "Bank details are required" }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      return {
        success: false,
        error: "Insufficient funds in wallet",
        requiredAmount: amount,
        currentBalance: wallet.balance,
      }
    }

    try {
      // Update wallet balance directly
      const currentBalance = Number(wallet.balance)
      const newBalance = currentBalance - amount

      const { error: updateError } = await supabaseAdmin
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id)

      if (updateError) {
        throw new Error(`Error updating wallet balance: ${updateError.message}`)
      }

      // Get the latest transaction to calculate the running balance
      const { data: latestTransaction, error: latestTransactionError } = await supabaseAdmin
        .from("transactions")
        .select("running_balance")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      // Calculate the running balance
      let runningBalance = newBalance

      // If there's a previous transaction, use its running balance as a base
      if (latestTransaction && latestTransaction.running_balance !== null) {
        // For a withdrawal transaction, subtract the amount from the previous running balance
        runningBalance = Number(latestTransaction.running_balance) - Number(amount)
      }

      // Record transaction WITH running_balance
      const transactionId = uuidv4()
      const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
        id: transactionId,
        wallet_id: wallet.id,
        type: "withdrawal",
        amount,
        purpose: "Withdrawal to bank account",
        reference: `withdrawal-${Date.now()}`,
        running_balance: runningBalance,
        status: "successful",
      })

      if (transactionError) {
        // Rollback wallet update
        await supabaseAdmin.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
        throw new Error(`Error recording transaction: ${transactionError.message}`)
      }

      // Record withdrawal
      const withdrawalId = uuidv4()
      const { error: withdrawalError } = await supabaseAdmin.from("withdrawals").insert({
        id: withdrawalId,
        wallet_id: wallet.id,
        amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        transaction_id: transactionId,
        status: "pending",
      })

      if (withdrawalError) {
        // Rollback previous operations
        await supabaseAdmin.from("wallets").update({ balance: wallet.balance }).eq("id", wallet.id)
        await supabaseAdmin.from("transactions").delete().eq("id", transactionId)
        throw new Error(`Error recording withdrawal: ${withdrawalError.message}`)
      }

      // Start the simulation process
      await simulateWithdrawalProcess(withdrawalId)

      return { success: true, data: { newBalance, runningBalance, withdrawalId } }
    } catch (error) {
      console.error("Withdraw funds error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }
    }
  } catch (error) {
    console.error("Withdraw funds error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Get transaction history
export async function getTransactionHistory() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    // Get transactions for this wallet
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .limit(10) // Limit to 10 most recent transactions

    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Get transaction history error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get recent transactions (for dashboard)
export async function getRecentTransactions(limit = 5) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    // Get recent transactions for this wallet
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Error fetching recent transactions: ${error.message}`)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Get recent transactions error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get withdrawal history
export async function getWithdrawalHistory() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    // Get withdrawals for this wallet
    const { data, error } = await supabaseAdmin
      .from("withdrawals")
      .select(`
        *,
        transaction:transaction_id (
          created_at
        )
      `)
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching withdrawals: ${error.message}`)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Get withdrawal history error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Generate transaction statement PDF and send via email
export async function generateTransactionStatement(startDate: string, endDate: string) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: null }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    // Get lender details with address
    const { data: lender, error: lenderError } = await supabaseAdmin
      .from("lenders")
      .select(`
        organization_name, 
        email, 
        phone,
        address:address_id (
          street_address,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq("id", user.id)
      .single()

    if (lenderError || !lender) {
      throw new Error(`Error fetching lender details: ${lenderError?.message || "Lender not found"}`)
    }

    // Get transactions for this wallet within date range
    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: true })

    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`)
    }

    // Calculate opening balance (balance at start date)
    const { data: earlierTransactions, error: earlierError } = await supabaseAdmin
      .from("transactions")
      .select("running_balance")
      .eq("wallet_id", wallet.id)
      .lt("created_at", startDate)
      .order("created_at", { ascending: false })
      .limit(1)

    if (earlierError) {
      throw new Error(`Error fetching earlier transactions: ${earlierError.message}`)
    }

    // Opening balance is either the running balance of the last transaction before the start date
    // or 0 if there are no earlier transactions
    const openingBalance =
      earlierTransactions && earlierTransactions.length > 0 ? earlierTransactions[0].running_balance : 0

    // Calculate totals
    let totalCredit = 0
    let totalDebit = 0

    // In the generateTransactionStatement function, find the section where it calculates totalCredit and totalDebit
    // and modify it to include "loan_repayment" as a credit type:

    // Replace this code:
    transactions.forEach((transaction) => {
      if (transaction.type === "credit" || transaction.type === "repayment") {
        totalCredit += Number(transaction.amount)
      } else {
        totalDebit += Number(transaction.amount)
      }
    })

    // With this updated code:
    transactions.forEach((transaction) => {
      if (transaction.type === "credit" || transaction.type === "repayment" || transaction.type === "loan_repayment") {
        totalCredit += Number(transaction.amount)
      } else {
        totalDebit += Number(transaction.amount)
      }
    })

    // Closing balance is opening balance + total credits - total debits
    const closingBalance =
      transactions.length > 0 ? transactions[transactions.length - 1].running_balance : openingBalance

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { width, height } = page.getSize()

    // Add header with theme color (green for FarmCredit)
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(0.15, 0.65, 0.35), // Green color for FarmCredit
    })

    // Add FarmCredit logo text in white
    page.drawText("FarmCredit", {
      x: 50,
      y: height - 60,
      size: 32,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    // Add statement title in white
    page.drawText("Transaction Statement", {
      x: 50,
      y: height - 90,
      size: 18,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    // Left side information
    const leftColumnX = 50
    const infoStartY = height - 150

    // Lender name
    page.drawText(lender.organization_name, {
      x: leftColumnX,
      y: infoStartY,
      size: 12,
      font: boldFont,
    })

    // Format address if available
    let formattedAddress = ""
    if (lender.address) {
      const addressParts = []
      if (lender.address.street_address) addressParts.push(lender.address.street_address)
      if (lender.address.city) addressParts.push(lender.address.city)
      if (lender.address.state) addressParts.push(lender.address.state)
      if (lender.address.country) addressParts.push(lender.address.country)
      if (lender.address.postal_code) addressParts.push(lender.address.postal_code)

      formattedAddress = addressParts.join(", ")
    }

    // Address (if available)
    if (formattedAddress) {
      // Split address into multiple lines if too long
      const maxLineLength = 60
      if (formattedAddress.length > maxLineLength) {
        const lines = []
        let currentLine = ""
        const words = formattedAddress.split(" ")

        for (const word of words) {
          if ((currentLine + " " + word).length <= maxLineLength) {
            currentLine += (currentLine ? " " : "") + word
          } else {
            lines.push(currentLine)
            currentLine = word
          }
        }

        if (currentLine) {
          lines.push(currentLine)
        }

        // Draw each line of the address
        for (let i = 0; i < lines.length; i++) {
          page.drawText(lines[i], {
            x: leftColumnX,
            y: infoStartY - 20 - i * 15,
            size: 10,
            font: timesRomanFont,
          })
        }
      } else {
        page.drawText(formattedAddress, {
          x: leftColumnX,
          y: infoStartY - 20,
          size: 10,
          font: timesRomanFont,
        })
      }
    }

    // Currency
    page.drawText("Currency: NGN", {
      x: leftColumnX,
      y: infoStartY - (formattedAddress ? 60 : 40),
      size: 10,
      font: timesRomanFont,
    })

    // Date
    const currentMonth = new Date().toLocaleString("default", { month: "long" })
    const currentYear = new Date().getFullYear()
    page.drawText(`Date: ${currentMonth} ${currentYear}`, {
      x: leftColumnX,
      y: infoStartY - (formattedAddress ? 80 : 60),
      size: 10,
      font: timesRomanFont,
    })

    // Right side information
    const rightColumnX = 350

    // Total Credit
    page.drawText(`Total Credit: ${formatCurrencyForPDF(totalCredit)}`, {
      x: rightColumnX,
      y: infoStartY,
      size: 10,
      font: boldFont,
    })

    // Total Debit
    page.drawText(`Total Debit: -${formatCurrencyForPDF(totalDebit)}`, {
      x: rightColumnX,
      y: infoStartY - 20,
      size: 10,
      font: boldFont,
    })

    // Opening Balance
    page.drawText(`Opening Balance: ${formatCurrencyForPDF(openingBalance)}`, {
      x: rightColumnX,
      y: infoStartY - 40,
      size: 10,
      font: boldFont,
    })

    // Closing Balance
    page.drawText(`Closing Balance: ${formatCurrencyForPDF(closingBalance)}`, {
      x: rightColumnX,
      y: infoStartY - 60,
      size: 10,
      font: boldFont,
    })

    // Add table header
    const tableTop = infoStartY - 100
    const rowHeight = 25
    const col1 = 50 // Date
    const col2 = 130 // Transaction ID
    const col3 = 230 // Description
    const col4 = 400 // Credit
    const col5 = 470 // Debit
    const col6 = 540 // Balance

    // Add table header background
    page.drawRectangle({
      x: 40,
      y: tableTop - 5,
      width: width - 80,
      height: 30,
      color: rgb(0.15, 0.65, 0.35), // Green color for FarmCredit
    })

    // Draw table header text in white
    page.drawText("DATE", {
      x: col1,
      y: tableTop + 10,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    page.drawText("TRANSACTION ID", {
      x: col2,
      y: tableTop + 10,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    page.drawText("DESCRIPTION", {
      x: col3,
      y: tableTop + 10,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    page.drawText("CREDIT (+)", {
      x: col4,
      y: tableTop + 10,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    page.drawText("DEBIT (-)", {
      x: col5,
      y: tableTop + 10,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    page.drawText("BALANCE", {
      x: col6,
      y: tableTop + 10,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1), // White color
    })

    // Draw transactions
    let currentY = tableTop - rowHeight
    let currentPage = page
    let pageNumber = 1
    const totalPages = Math.ceil(transactions.length / 20) + 1 // Estimate pages

    for (const transaction of transactions) {
      // Check if we need a new page
      if (currentY < 100) {
        // Add page number to current page
        currentPage.drawText(`Page ${pageNumber} of ${totalPages}`, {
          x: width - 100,
          y: 30,
          size: 10,
          font: timesRomanFont,
        })

        pageNumber++
        currentPage = pdfDoc.addPage([595.28, 841.89])
        currentY = height - 50

        // Add table header to new page
        page.drawRectangle({
          x: 40,
          y: currentY - 5,
          width: width - 80,
          height: 30,
          color: rgb(0.15, 0.65, 0.35), // Green color for FarmCredit
        })

        // Draw table header text in white
        currentPage.drawText("DATE", {
          x: col1,
          y: currentY + 10,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentPage.drawText("TRANSACTION ID", {
          x: col2,
          y: currentY + 10,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentPage.drawText("DESCRIPTION", {
          x: col3,
          y: currentY + 10,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentPage.drawText("CREDIT (+)", {
          x: col4,
          y: currentY + 10,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentPage.drawText("DEBIT (-)", {
          x: col5,
          y: currentY + 10,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentPage.drawText("BALANCE", {
          x: col6,
          y: currentY + 10,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentY -= rowHeight
      }

      // Format date
      const date = new Date(transaction.created_at)
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

      // Format transaction ID - use last 8 characters if too long
      const transactionId =
        transaction.id.length > 8 ? transaction.id.substring(transaction.id.length - 8) : transaction.id

      // Format description - truncate if too long
      const description = transaction.purpose
        ? transaction.purpose.length > 30
          ? transaction.purpose.substring(0, 27) + "..."
          : transaction.purpose
        : transaction.type.toUpperCase()

      // Determine if credit or debit
      const isCredit =
        transaction.type === "credit" || transaction.type === "repayment" || transaction.type === "loan_repayment"
      const creditAmount = isCredit ? formatCurrencyForPDF(transaction.amount) : "0.00"
      const debitAmount = !isCredit ? formatCurrencyForPDF(transaction.amount) : "0.00"
      const balance = formatCurrencyForPDF(transaction.running_balance || 0)

      // Draw alternating row background
      if (transactions.indexOf(transaction) % 2 === 0) {
        currentPage.drawRectangle({
          x: 40,
          y: currentY - 5,
          width: width - 80,
          height: rowHeight,
          color: rgb(0.95, 0.95, 0.95),
        })
      }

      // Draw transaction row
      currentPage.drawText(formattedDate, {
        x: col1,
        y: currentY + 5,
        size: 8,
        font: timesRomanFont,
      })

      currentPage.drawText(transactionId, {
        x: col2,
        y: currentY + 5,
        size: 8,
        font: timesRomanFont,
      })

      currentPage.drawText(description, {
        x: col3,
        y: currentY + 5,
        size: 8,
        font: timesRomanFont,
      })

      currentPage.drawText(creditAmount, {
        x: col4,
        y: currentY + 5,
        size: 8,
        font: timesRomanFont,
      })

      currentPage.drawText(debitAmount, {
        x: col5,
        y: currentY + 5,
        size: 8,
        font: timesRomanFont,
      })

      currentPage.drawText(balance, {
        x: col6,
        y: currentY + 5,
        size: 8,
        font: timesRomanFont,
      })

      currentY -= rowHeight
    }

    // Add page number to last page
    currentPage.drawText(`Page ${pageNumber} of ${totalPages}`, {
      x: width - 100,
      y: 30,
      size: 10,
      font: timesRomanFont,
    })

    // Add footer
    const footerY = 60
    currentPage.drawText("This is an automatically generated statement.", {
      x: 50,
      y: footerY,
      size: 10,
      font: timesRomanFont,
    })

    const now = new Date()
    currentPage.drawText(`Generated on ${now.toLocaleDateString()}, ${now.toLocaleTimeString()}`, {
      x: 50,
      y: footerY - 15,
      size: 10,
      font: timesRomanFont,
    })

    // Add contact email
    currentPage.drawText("support@farmcredit.com", {
      x: 50,
      y: footerY - 30,
      size: 10,
      font: timesRomanFont,
    })

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save()
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64")

    // Generate filename
    const filename = `transaction_statement_${new Date().toISOString().split("T")[0]}.pdf`

    // Send email with PDF attachment
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: process.env.MAIL_DEFAULT_SENDER || "noreply@farmcredit.com",
        to: lender.email,
        subject: "Your FarmCredit Transaction Statement",
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Transaction Statement</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #27ae60;
            padding: 20px;
            text-align: center;
            color: white;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888;
          }
          .button {
            display: inline-block;
            background-color: #27ae60;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FarmCredit</div>
            <div>Transaction Statement</div>
          </div>
          <div class="content">
            <h2>Dear ${lender.organization_name},</h2>
            <p>Your transaction statement for the period <strong>${new Date(startDate).toLocaleDateString()}</strong> to <strong>${new Date(endDate).toLocaleDateString()}</strong> has been generated and is attached to this email.</p>
            <p>This statement provides a detailed record of all transactions during this period, including deposits, withdrawals, and loan funding activities.</p>
            <p>You can view your current balance and transaction history anytime by logging into your FarmCredit dashboard.</p>
            <p>If you have any questions about this statement or notice any discrepancies, please contact our support team.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://farmcredit.com"}/dashboard/lender/transactions" class="button">View Transactions</a>
            <p>Thank you for your continued partnership with FarmCredit.</p>
            <p>Best regards,<br>The FarmCredit Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} FarmCredit. All rights reserved.</p>
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
        attachments: [
          {
            filename,
            content: pdfBase64,
          },
        ],
      })

      if (emailError) {
        console.error("Error sending email:", emailError)
        throw new Error(`Error sending email: ${emailError.message}`)
      }

      return {
        success: true,
        data: {
          message: "Statement has been sent to your email",
          email: lender.email,
        },
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      throw new Error(`Error sending email: ${emailError instanceof Error ? emailError.message : "Unknown error"}`)
    }
  } catch (error) {
    console.error("Generate transaction statement error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: null,
    }
  }
}

// Add this new helper function for PDF-safe currency formatting right before the existing formatCurrency function
function formatCurrencyForPDF(amount: number): string {
  return (
    new Intl.NumberFormat("en-NG", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " NGN"
  )
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Get dashboard analytics - FIXED to handle case when no loans exist
export async function getLenderAnalytics() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: null }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    // Get total amount funded
    const { data: fundingData, error: fundingError } = await supabaseAdmin
      .from("transactions")
      .select("amount")
      .eq("type", "loan_funding")
      .eq("wallet_id", wallet.id)

    if (fundingError) {
      throw new Error(`Error fetching funding data: ${fundingError.message}`)
    }

    const totalFunded = fundingData.reduce((sum, item) => sum + Number(item.amount), 0)

    // Get active loans count - handle case when no loans exist
    const { count: activeLoansCount, error: loansError } = await supabaseAdmin
      .from("loan_contract")
      .select("id", { count: "exact", head: true })
      .eq("financier_id", user.id)
      .eq("status", "active")

    // If error is not related to no rows, throw it
    if (loansError && loansError.code !== "PGRST116") {
      throw new Error(`Error fetching active loans: ${loansError.message}`)
    }

    // Get total interest earned - handle case when no repayments exist
    const { data: repaymentsData, error: repaymentsError } = await supabaseAdmin
      .from("loan_repayments")
      .select(`
        amount,
        principal_component,
        loan_contract_id,
        loan_contract:loan_contract_id (financier_id)
      `)
      .eq("date_paid", "is", "not.null")
      .eq("loan_contract.financier_id", user.id)

    // If error is not related to no rows, throw it
    if (repaymentsError && repaymentsError.code !== "PGRST116") {
      throw new Error(`Error fetching repayments: ${repaymentsError.message}`)
    }

    const totalInterestEarned = repaymentsData
      ? repaymentsData.reduce((sum, item) => sum + (Number(item.amount) - Number(item.principal_component)), 0)
      : 0

    // Get repayments received
    const totalRepaymentsReceived = repaymentsData
      ? repaymentsData.reduce((sum, item) => sum + Number(item.amount), 0)
      : 0

    return {
      success: true,
      data: {
        totalFunded,
        activeLoansCount: activeLoansCount || 0,
        totalInterestEarned,
        totalRepaymentsReceived,
      },
    }
  } catch (error) {
    console.error("Get lender analytics error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: {
        totalFunded: 0,
        activeLoansCount: 0,
        totalInterestEarned: 0,
        totalRepaymentsReceived: 0,
      },
    }
  }
}

// Get monthly funding data for charts - UPDATED to use real transaction data
export async function getMonthlyFundingData() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("lender_id", user.id)
      .single()

    if (walletError || !wallet) {
      throw new Error(`Error fetching lender wallet: ${walletError?.message || "Wallet not found"}`)
    }

    // Get funding transactions for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("amount, created_at")
      .eq("type", "loan_funding")
      .eq("wallet_id", wallet.id)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      throw new Error(`Error fetching funding transactions: ${error.message}`)
    }

    // Group transactions by month
    const monthlyData: Record<string, number> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    transactions.forEach((transaction) => {
      const date = new Date(transaction.created_at)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }

      monthlyData[monthKey] += Number(transaction.amount)
    })

    // Convert to array format for chart
    const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }))

    // Sort by date
    chartData.sort((a, b) => {
      const [aMonth, aYear] = a.month.split(" ")
      const [bMonth, bYear] = b.month.split(" ")

      if (aYear !== bYear) {
        return Number(aYear) - Number(bYear)
      }

      return months.indexOf(aMonth) - months.indexOf(bMonth)
    })

    // If less than 6 months of data, fill in missing months
    if (chartData.length < 6) {
      const now = new Date()
      for (let i = 0; i < 6; i++) {
        const date = new Date(now)
        date.setMonth(now.getMonth() - i)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`

        if (!monthlyData[monthKey]) {
          chartData.push({
            month: monthKey,
            amount: 0,
          })
        }
      }

      // Sort again
      chartData.sort((a, b) => {
        const [aMonth, aYear] = a.month.split(" ")
        const [bMonth, bYear] = b.month.split(" ")

        if (aYear !== bYear) {
          return Number(aYear) - Number(bYear)
        }

        return months.indexOf(aMonth) - months.indexOf(bMonth)
      })
    }

    return { success: true, data: chartData }
  } catch (error) {
    console.error("Get monthly funding data error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get repayment trends data for charts
export async function getRepaymentTrends() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Get all loan contracts for this lender
    const { data: contracts, error: contractsError } = await supabaseAdmin
      .from("loan_contract")
      .select("id")
      .eq("financier_id", user.id)

    if (contractsError) {
      throw new Error(`Error fetching loan contracts: ${contractsError.message}`)
    }

    if (!contracts || contracts.length === 0) {
      return { success: true, data: [] }
    }

    const contractIds = contracts.map((contract) => contract.id)

    // Get all repayments for these contracts
    const { data: repayments, error: repaymentsError } = await supabaseAdmin
      .from("loan_repayments")
      .select("amount, due_date, date_paid")
      .in("loan_contract_id", contractIds)
      .order("due_date", { ascending: true })

    if (repaymentsError) {
      throw new Error(`Error fetching repayments: ${repaymentsError.message}`)
    }

    // Group repayments by month
    const monthlyData: Record<string, { expected: number; received: number }> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    repayments.forEach((repayment) => {
      const dueDate = new Date(repayment.due_date)
      const monthKey = `${months[dueDate.getMonth()]} ${dueDate.getFullYear()}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { expected: 0, received: 0 }
      }

      monthlyData[monthKey].expected += Number(repayment.amount)

      if (repayment.date_paid) {
        monthlyData[monthKey].received += Number(repayment.amount)
      }
    })

    // Convert to array format for chart
    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      expected: data.expected,
      received: data.received,
    }))

    // Sort by date
    chartData.sort((a, b) => {
      const [aMonth, aYear] = a.month.split(" ")
      const [bMonth, bYear] = b.month.split(" ")

      if (aYear !== bYear) {
        return Number(aYear) - Number(bYear)
      }

      return months.indexOf(aMonth) - months.indexOf(bMonth)
    })

    // Calculate on-time payment rate
    const onTimeRateData = chartData.map((item) => {
      const rate = item.expected > 0 ? (item.received / item.expected) * 100 : 0
      return {
        month: item.month,
        rate: Math.min(100, Math.round(rate)),
      }
    })

    // Generate sample data for days late (in a real app, this would come from actual data)
    const daysLateData = chartData.map((item) => ({
      month: item.month,
      days: Math.round(Math.random() * 10), // Random value between 0 and 10
    }))

    // Generate sample data for repayment schedule
    const scheduleData = chartData.map((item) => {
      const upcoming = Math.max(0, item.expected - item.received)
      const overdue = Math.round(upcoming * Math.random() * 0.3) // Random portion of upcoming is overdue

      return {
        month: item.month,
        upcoming: upcoming - overdue,
        received: item.received,
        overdue,
      }
    })

    return {
      success: true,
      data: chartData,
      onTimeRate: onTimeRateData,
      daysLate: daysLateData,
      schedule: scheduleData,
    }
  } catch (error) {
    console.error("Get repayment trends error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}

// Get loan performance data for charts
export async function getLoanPerformanceData() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: null }
    }

    // Get all loan contracts for this lender
    const { data: contracts, error: contractsError } = await supabaseAdmin
      .from("loan_contract")
      .select(`
        id,
        status,
        created_at,
        loan_application:loan_application_id (
          purpose_category
        )
      `)
      .eq("financier_id", user.id)

    if (contractsError) {
      throw new Error(`Error fetching loan contracts: ${contractsError.message}`)
    }

    if (!contracts || contracts.length === 0) {
      return {
        success: true,
        data: {
          activeLoans: 0,
          completedLoans: 0,
          defaultedLoans: 0,
          cropProductionLoans: 0,
          livestockLoans: 0,
          equipmentLoans: 0,
          otherLoans: 0,
          monthlyPerformance: [],
        },
      }
    }

    // Count loans by status
    const activeLoans = contracts.filter((contract) => contract.status === "active").length
    const completedLoans = contracts.filter((contract) => contract.status === "completed").length
    const defaultedLoans = contracts.filter((contract) => contract.status === "defaulted").length

    // Count loans by category
    const cropProductionLoans = contracts.filter((contract) =>
      contract.loan_application?.purpose_category?.toLowerCase().includes("crop"),
    ).length

    const livestockLoans = contracts.filter((contract) =>
      contract.loan_application?.purpose_category?.toLowerCase().includes("livestock"),
    ).length

    const equipmentLoans = contracts.filter((contract) =>
      contract.loan_application?.purpose_category?.toLowerCase().includes("equipment"),
    ).length

    const otherLoans = contracts.length - cropProductionLoans - livestockLoans - equipmentLoans

    // Group contracts by month
    const monthlyData: Record<string, { active: number; completed: number; defaulted: number }> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    contracts.forEach((contract) => {
      const date = new Date(contract.created_at)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { active: 0, completed: 0, defaulted: 0 }
      }

      if (contract.status === "active") {
        monthlyData[monthKey].active += 1
      } else if (contract.status === "completed") {
        monthlyData[monthKey].completed += 1
      } else if (contract.status === "defaulted") {
        monthlyData[monthKey].defaulted += 1
      }
    })

    // Convert to array format for chart
    const monthlyPerformance = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      active: data.active,
      completed: data.completed,
      defaulted: data.defaulted,
    }))

    // Sort by date
    monthlyPerformance.sort((a, b) => {
      const [aMonth, aYear] = a.month.split(" ")
      const [bMonth, bYear] = b.month.split(" ")

      if (aYear !== bYear) {
        return Number(aYear) - Number(bYear)
      }

      return months.indexOf(aMonth) - months.indexOf(bMonth)
    })

    return {
      success: true,
      data: {
        activeLoans,
        completedLoans,
        defaultedLoans,
        cropProductionLoans,
        livestockLoans,
        equipmentLoans,
        otherLoans,
        monthlyPerformance,
      },
    }
  } catch (error) {
    console.error("Get loan performance data error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: null,
    }
  }
}

// Add this new function at the end of the file
export async function simulateWithdrawalProcess(withdrawalId: string) {
  try {
    // First, update to processing status
    const processingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/lender/simulate-withdrawal-process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ withdrawalId }),
      },
    )

    if (!processingResponse.ok) {
      console.error("Failed to start withdrawal simulation")
      return { success: false, error: "Failed to start withdrawal simulation" }
    }

    // Set a timeout to update to successful after a delay (1 minute)
    setTimeout(async () => {
      try {
        // Update to successful status
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/lender/complete-withdrawal-simulation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ withdrawalId }),
        })

        if (!response.ok) {
          console.error("Failed to complete withdrawal simulation")
        }
      } catch (error) {
        console.error("Error in withdrawal simulation timeout:", error)
      }
    }, 60000) // 60000 ms = 1 minute

    return { success: true }
  } catch (error) {
    console.error("Simulate withdrawal process error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Helper function to send contract email
async function sendContractEmail(
  lenderEmail: string,
  lenderName: string,
  farmerEmail: string,
  farmerName: string,
  contractId: string,
  loanAmount: number,
  loanPurpose: string,
  pdfBuffer: Buffer,
) {
  try {
    const filename = `loan_contract_${contractId.substring(0, 8).toUpperCase()}.pdf`
    const pdfBase64 = pdfBuffer.toString("base64")

    // Send email to lender
    const { data: lenderEmailData, error: lenderEmailError } = await resend.emails.send({
      from: process.env.MAIL_DEFAULT_SENDER || "noreply@farmcredit.com",
      to: lenderEmail,
      subject: `Loan Contract for ${farmerName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Loan Contract</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #27ae60;
              padding: 20px;
              text-align: center;
              color: white;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #e0e0e0;
              border-top: none;
              border-radius: 0 0 5px 5px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #888;
            }
            .button {
              display: inline-block;
              background-color: #27ae60;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FarmCredit</div>
              <div>Loan Contract</div>
            </div>
            <div class="content">
              <h2>Dear ${lenderName},</h2>
              <p>A loan contract has been generated for <strong>${farmerName}</strong> with the following details:</p>
              <ul>
                <li><strong>Contract ID:</strong> ${contractId.substring(0, 8).toUpperCase()}</li>
                <li><strong>Loan Amount:</strong> ${formatCurrency(loanAmount)}</li>
                <li><strong>Purpose:</strong> ${loanPurpose}</li>
              </ul>
              <p>The contract is attached to this email for your records.</p>
              <p>You can view the loan details anytime by logging into your FarmCredit dashboard.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://farmcredit.com"}/dashboard/lender/loans" class="button">View Loans</a>
              <p>Thank you for your continued partnership with FarmCredit.</p>
              <p>Best regards,<br>The FarmCredit Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} FarmCredit. All rights reserved.</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename,
          content: pdfBase64,
        },
      ],
    })

    if (lenderEmailError) {
      console.error("Error sending email to lender:", lenderEmailError)
      throw new Error(`Error sending email to lender: ${lenderEmailError.message}`)
    }

    // Send email to farmer
    const { data: farmerEmailData, error: farmerEmailError } = await resend.emails.send({
      from: process.env.MAIL_DEFAULT_SENDER || "noreply@farmcredit.com",
      to: farmerEmail,
      subject: `Your Loan Contract with FarmCredit`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Loan Contract</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #27ae60;
              padding: 20px;
              text-align: center;
              color: white;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #e0e0e0;
              border-top: none;
              border-radius: 0 0 5px 5px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #888;
            }
            .button {
              display: inline-block;
              background-color: #27ae60;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FarmCredit</div>
              <div>Loan Contract</div>
            </div>
            <div class="content">
              <h2>Dear ${farmerName},</h2>
              <p>Your loan contract with FarmCredit has been generated with the following details:</p>
              <ul>
                <li><strong>Contract ID:</strong> ${contractId.substring(0, 8).toUpperCase()}</li>
                <li><strong>Loan Amount:</strong> ${formatCurrency(loanAmount)}</li>
                <li><strong>Purpose:</strong> ${loanPurpose}</li>
              </ul>
              <p>The contract is attached to this email for your records.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p>Thank you for choosing FarmCredit.</p>
              <p>Best regards,<br>The FarmCredit Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} FarmCredit. All rights reserved.</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename,
          content: pdfBase64,
        },
      ],
    })

    if (farmerEmailError) {
      console.error("Error sending email to farmer:", farmerEmailError)
      throw new Error(`Error sending email to farmer: ${farmerEmailError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending contract emails:", error)
    throw new Error(`Error sending contract emails: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
