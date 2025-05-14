"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { getSession } from "@/lib/auth-utils"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get the current user session
async function getCurrentUser() {
  try {
    const session = await getSession()
    return session
  } catch (error) {
    console.error("Error getting current user in lender-analytics:", error)
    return null
  }
}

// Get dashboard analytics with proper error handling
export async function getLenderAnalytics() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return {
        success: false,
        error: "Unauthorized",
        data: {
          totalFunded: 0,
          activeLoansCount: 0,
          totalInterestEarned: 0,
          totalRepaymentsReceived: 0,
        },
      }
    }

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("lender_id", user.id)
      .single()

    if (walletError) {
      console.error("Error fetching lender wallet:", walletError)
      return {
        success: true,
        data: {
          totalFunded: 0,
          activeLoansCount: 0,
          totalInterestEarned: 0,
          totalRepaymentsReceived: 0,
        },
      }
    }

    // Get total amount funded
    const { data: fundingData, error: fundingError } = await supabaseAdmin
      .from("transactions")
      .select("amount")
      .eq("type", "loan_funding")
      .eq("wallet_id", wallet.id)

    if (fundingError) {
      console.error("Error fetching funding data:", fundingError)
      return {
        success: true,
        data: {
          totalFunded: 0,
          activeLoansCount: 0,
          totalInterestEarned: 0,
          totalRepaymentsReceived: 0,
        },
      }
    }

    const totalFunded = fundingData.reduce((sum, item) => sum + Number(item.amount), 0)

    // Get active loans count - safely handle when no loans exist
    let activeLoansCount = 0
    try {
      // Based on your schema, loan_contract doesn't have a status column
      // We'll count all loans for now
      const { count, error: loansError } = await supabaseAdmin
        .from("loan_contract")
        .select("id", { count: "exact", head: true })
        .eq("financier_id", user.id)

      if (!loansError) {
        activeLoansCount = count || 0
      }
    } catch (error) {
      console.error("Error counting active loans:", error)
      // Continue with activeLoansCount = 0
    }

    // Get total interest earned - safely handle when no repayments exist
    let totalInterestEarned = 0
    let totalRepaymentsReceived = 0

    try {
      const { data: repaymentsData, error: repaymentsError } = await supabaseAdmin
        .from("loan_repayments")
        .select(`
          periodic_repayment_amount,
          interest_amount,
          loan_contract_id,
          loan_contract:loan_contract_id (financier_id)
        `)
        .eq("date_paid", "is", "not.null")
        .eq("loan_contract.financier_id", user.id)

      if (!repaymentsError && repaymentsData && repaymentsData.length > 0) {
        totalInterestEarned = repaymentsData.reduce((sum, item) => sum + Number(item.interest_amount || 0), 0)
        totalRepaymentsReceived = repaymentsData.reduce(
          (sum, item) => sum + Number(item.periodic_repayment_amount || 0),
          0,
        )
      }
    } catch (error) {
      console.error("Error calculating repayments:", error)
      // Continue with default values
    }

    return {
      success: true,
      data: {
        totalFunded,
        activeLoansCount,
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

// Get monthly funding data for charts using real transaction data
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

    if (walletError) {
      console.error("Error fetching lender wallet:", walletError)
      return { success: true, data: [] }
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
      console.error("Error fetching funding transactions:", error)
      return { success: true, data: [] }
    }

    // Group transactions by month
    const monthlyData: Record<string, number> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize all months with zero
    for (let i = 0; i < 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
      monthlyData[monthKey] = 0
    }

    // Add transaction amounts to the corresponding months
    if (transactions) {
      transactions.forEach((transaction) => {
        const date = new Date(transaction.created_at)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(transaction.amount)
      })
    }

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

// Get transaction type data for charts
export async function getTransactionTypeData() {
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

    if (walletError) {
      console.error("Error fetching lender wallet:", walletError)
      return { success: true, data: [] }
    }

    // Get transactions for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("amount, type, created_at")
      .eq("wallet_id", wallet.id)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching transactions:", error)
      return { success: true, data: [] }
    }

    // Group transactions by month and type
    const monthlyData: Record<string, Record<string, number>> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const transactionTypes = ["credit", "debit", "withdrawal", "loan_funding"]

    // Initialize all months with zero for all transaction types
    for (let i = 0; i < 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
      monthlyData[monthKey] = {}

      transactionTypes.forEach((type) => {
        monthlyData[monthKey][type] = 0
      })
    }

    // Add transaction amounts to the corresponding months and types
    transactions.forEach((transaction) => {
      const date = new Date(transaction.created_at)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
      const type = transaction.type

      if (transactionTypes.includes(type)) {
        monthlyData[monthKey][type] = (monthlyData[monthKey][type] || 0) + Number(transaction.amount)
      }
    })

    // Convert to array format for chart
    const chartData = Object.entries(monthlyData).map(([month, types]) => ({
      month,
      ...types,
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

    return { success: true, data: chartData }
  } catch (error) {
    console.error("Get transaction type data error:", error)
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

    // Default empty data structure
    const defaultData = {
      activeLoans: 0,
      completedLoans: 0,
      defaultedLoans: 0,
      cropProductionLoans: 0,
      livestockLoans: 0,
      equipmentLoans: 0,
      otherLoans: 0,
      monthlyPerformance: [],
    }

    try {
      // Get loan data - joining with loan_application to get purpose_category
      const { data: loanData, error: loanError } = await supabaseAdmin
        .from("loan_contract")
        .select(`
          id,
          loan_application:loan_application_id (
            purpose_category
          )
        `)
        .eq("financier_id", user.id)

      if (loanError) {
        console.error("Error fetching loan data:", loanError)
        return { success: true, data: defaultData }
      }

      // Since loan_contract doesn't have a status field in your schema,
      // we'll count all loans as active for now
      const activeLoans = loanData.length
      const completedLoans = 0
      const defaultedLoans = 0

      // Count loans by purpose using purpose_category from loan_application
      const cropProductionLoans = loanData.filter((loan) =>
        loan.loan_application?.purpose_category?.toLowerCase().includes("crop"),
      ).length

      const livestockLoans = loanData.filter((loan) =>
        loan.loan_application?.purpose_category?.toLowerCase().includes("livestock"),
      ).length

      const equipmentLoans = loanData.filter((loan) =>
        loan.loan_application?.purpose_category?.toLowerCase().includes("equipment"),
      ).length

      const otherLoans = loanData.length - cropProductionLoans - livestockLoans - equipmentLoans

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
          monthlyPerformance: [],
        },
      }
    } catch (error) {
      console.error("Error processing loan performance data:", error)
      return { success: true, data: defaultData }
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

// Get repayment trends data for charts
export async function getRepaymentTrends() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "lender") {
      return { success: false, error: "Unauthorized", data: [] }
    }

    // Generate sample data for now
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const sampleData = months.map((month) => ({
      month: `${month} 2023`,
      expected: Math.floor(Math.random() * 500000) + 100000,
      received: Math.floor(Math.random() * 450000) + 100000,
    }))

    return { success: true, data: sampleData }
  } catch (error) {
    console.error("Get repayment trends error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
    }
  }
}
