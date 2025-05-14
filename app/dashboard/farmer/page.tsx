import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, TrendingUp, Bell, InfoIcon, DollarSign } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-server"
import { getSession } from "@/lib/auth-utils"
import { LineChart } from "@/components/ui/charts"
import { ErrorBoundary } from "@/components/error-boundary"
import { GuidedTour } from "@/components/dashboard/guided-tour"
import { UpcomingTasksPanel } from "@/components/dashboard/upcoming-tasks-panel"
import { LoadingPane } from "@/components/loading-pane"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalculateCreditScoreButton } from "@/components/dashboard/calculate-credit-score-button"

export const dynamic = "force-dynamic" // Add this line to ensure fresh data on each request
export const revalidate = 0 // Disable caching to always fetch fresh data

export default async function FarmerDashboardPage() {
  const session = await getSession()

  if (!session || !session.id) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Error</h2>
        <p>Unable to retrieve your session. Please try signing in again.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/login/farmer">Sign In</Link>
        </Button>
      </div>
    )
  }

  const supabase = createClient()

  console.log("Session details for debugging:", {
    id: session.id,
    email: session.email,
    role: session.role,
    name: session.name,
  })

  // Direct SQL query to ensure we get the latest data
  const { data: farmerData, error: farmerError } = await supabase
    .from("farmers")
    .select("*")
    .eq("id", session.id)
    .limit(1)
    .maybeSingle()

  if (farmerError) {
    console.error("Error fetching farmer data by ID:", farmerError.message)
  }

  // If no data found by ID, try by email
  let farmer = farmerData
  if (!farmer && session.email) {
    console.log("No farmer data found by ID, trying by email:", session.email)

    // Normalize the email to avoid case sensitivity issues
    const normalizedEmail = session.email.trim().toLowerCase()

    const { data: farmerByEmail, error: emailError } = await supabase
      .from("farmers")
      .select("*")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle()

    if (emailError) {
      console.error("Error fetching farmer data by email:", emailError.message)
    } else if (farmerByEmail) {
      console.log("Farmer data found by email:", farmerByEmail)
      farmer = farmerByEmail
    } else {
      console.log("No farmer data found by email either")
    }
  }

  // Final fallback: create a minimal farmer object from session data
  if (!farmer && session) {
    console.log("Creating minimal farmer object from session data")
    farmer = {
      id: session.id,
      full_name: session.name,
      email: session.email,
    }
  }

  console.log("Final farmer data:", farmer)

  return (
    <div className="space-y-6">
      {/* Add the GuidedTour component */}
      <GuidedTour userId={farmer?.id || session.id} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your FarmCredit dashboard, {farmer?.full_name || session.name || "Farmer"}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <ErrorBoundary fallback={<LoadingPane className="h-[120px]" />}>
          <Suspense fallback={<LoadingPane className="h-[120px]" />}>
            <CreditScoreCard userId={farmer?.id || session.id} userEmail={session.email} />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<LoadingPane className="h-[120px]" />}>
          <Suspense fallback={<LoadingPane className="h-[120px]" />}>
            <ApprovedLoansCard userId={farmer?.id || session.id} userEmail={session.email} />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<LoadingPane className="h-[120px]" />}>
          <Suspense fallback={<LoadingPane className="h-[120px]" />}>
            <TotalRepaidCard userId={farmer?.id || session.id} />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<LoadingPane className="h-[120px]" />}>
          <Suspense fallback={<LoadingPane className="h-[120px]" />}>
            <OutstandingAmountCard userId={farmer?.id || session.id} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <ErrorBoundary fallback={<LoadingPane className="h-[300px]" />}>
          <Suspense fallback={<LoadingPane className="h-[300px]" />}>
            <LoanActivityChart userId={farmer?.id || session.id} />
          </Suspense>
        </ErrorBoundary>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Farm Performance</CardTitle>
            <CardDescription>Expected vs actual yield for your crops</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary fallback={<LoadingPane className="h-[300px]" />}>
              <Suspense fallback={<LoadingPane className="h-[300px]" />}>
                <FarmPerformanceChart userId={farmer?.id || session.id} />
              </Suspense>
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="quick-actions">
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link
              href="/dashboard/farmer/loan-application"
              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-100 p-2">
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </div>
                <span>Apply for a Loan</span>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/farmer/loan-calculator"
              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-100 p-2">
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </div>
                <span>Calculate Loan Eligibility</span>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/farmer/weather"
              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-100 p-2">
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </div>
                <span>Check Weather Forecast</span>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/farmer/notifications"
              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Bell className="h-4 w-4 text-green-600" />
                </div>
                <span>View Notifications</span>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </CardContent>
        </Card>

        <ErrorBoundary fallback={<LoadingPane />}>
          <Suspense fallback={<LoadingPane />}>
            <NotificationsPanel userId={farmer?.id || session.id} />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<LoadingPane />}>
          <Suspense fallback={<LoadingPane />}>
            <UpcomingTasksPanel userId={farmer?.id || session.id} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}

function CardSkeleton({ title = "Loading..." }: { title?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <LoadingPane className="h-[80px]" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton({ title = "Loading..." }: { title?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Loading data...</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingPane className="h-[300px]" />
      </CardContent>
    </Card>
  )
}

async function CreditScoreCard({ userId, userEmail }: { userId?: string; userEmail?: string }) {
  if (!userId && !userEmail) {
    return <CardSkeleton title="Credit Score" />
  }

  const supabase = createClient()

  // Get the most recent credit score from the credit_scores table
  const { data: creditScoreData, error: creditScoreError } = await supabase
    .from("credit_scores")
    .select("credit_score, created_at")
    .eq("farmer_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // If no data found by ID and email is available, try by email
  let creditScore = creditScoreData?.credit_score
  let error = creditScoreError

  if (!creditScore && userEmail) {
    console.log("CreditScoreCard: No credit score found by ID, trying to find farmer by email:", userEmail)

    // First get the farmer ID from the email
    const { data: farmerData, error: farmerError } = await supabase
      .from("farmers")
      .select("id")
      .eq("email", userEmail)
      .single()

    if (!farmerError && farmerData) {
      // Then get the credit score using the farmer ID
      const { data: emailCreditScoreData, error: emailCreditScoreError } = await supabase
        .from("credit_scores")
        .select("credit_score, created_at")
        .eq("farmer_id", farmerData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      creditScore = emailCreditScoreData?.credit_score
      error = emailCreditScoreError
    }
  }

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching credit score:", error.message)
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <Progress value={0} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">Error loading credit score</p>
        </CardContent>
      </Card>
    )
  }

  // If no credit score found, return a default card
  if (!creditScore) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <Progress value={0} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">No credit score available</p>
        </CardContent>
      </Card>
    )
  }

  // Credit score range is 350-850
  const minScore = 350
  const maxScore = 850
  const range = maxScore - minScore

  // Calculate progress percentage
  const progressPercentage = Math.max(0, Math.min(100, ((creditScore - minScore) / range) * 100))

  // Determine credit score rating
  let rating = ""
  let ratingColor = ""

  if (creditScore >= 750) {
    rating = "Excellent"
    ratingColor = "text-green-600"
  } else if (creditScore >= 650) {
    rating = "Good"
    ratingColor = "text-blue-600"
  } else if (creditScore >= 550) {
    rating = "Fair"
    ratingColor = "text-yellow-600"
  } else if (creditScore >= 450) {
    rating = "Poor"
    ratingColor = "text-orange-600"
  } else {
    rating = "Very Poor"
    ratingColor = "text-red-600"
  }

  return (
    <Card className="credit-score-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Your credit score ranges from 350 to 850. A higher score indicates better creditworthiness and may
                  qualify you for better loan terms.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{creditScore}</div>
        <Progress value={progressPercentage} className="h-2 mt-2" />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">350</p>
          <p className={`text-xs font-medium ${ratingColor}`}>{rating}</p>
          <p className="text-xs text-muted-foreground">850</p>
        </div>
        <div className="mt-4">
          <CalculateCreditScoreButton farmerId={userId} />
        </div>
      </CardContent>
    </Card>
  )
}

async function ApprovedLoansCard({ userId, userEmail }: { userId?: string; userEmail?: string }) {
  if (!userId && !userEmail) {
    return <CardSkeleton title="Approved Loans" />
  }

  const supabase = createClient()

  // If we have an email, first try to get the farmer ID from the email
  let farmerId = userId
  if (!farmerId && userEmail) {
    const { data: farmer } = await supabase.from("farmers").select("id").eq("email", userEmail).maybeSingle()

    if (farmer) {
      farmerId = farmer.id
    }
  }

  if (!farmerId) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Approved Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <p className="text-xs text-muted-foreground mt-2">Unable to determine farmer ID</p>
        </CardContent>
      </Card>
    )
  }

  // Fetch approved loans count using the provided SQL logic
  const { count, error } = await supabase
    .from("loan_application")
    .select("*", { count: "exact", head: true })
    .eq("farmer_id", farmerId)
    .eq("status", "approved")

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Approved Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <p className="text-xs text-muted-foreground mt-2">Error loading loan data</p>
        </CardContent>
      </Card>
    )
  }

  const approvedLoans = count || 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Approved Loans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{approvedLoans}</div>
        <p className="text-xs text-muted-foreground mt-2">
          {approvedLoans > 0 ? `${approvedLoans} loans approved` : "No loans approved yet"}
        </p>
      </CardContent>
    </Card>
  )
}

async function TotalRepaidCard({ userId }: { userId?: string }) {
  if (!userId) {
    return <CardSkeleton title="Total Repaid" />
  }

  const supabase = createClient()

  // Use the SQL query provided with proper joins
  const { data, error } = await supabase.rpc("get_total_repaid_amount", { farmer_id: userId })

  // Fallback to a direct query if RPC is not available
  if (error) {
    console.error("Error using RPC for total repaid:", error.message)

    // Fallback query using joins
    const { data: repayments, error: fallbackError } = await supabase
      .from("loan_repayments")
      .select(`
        periodic_repayment_amount,
        loan_contract!inner (
          id,
          loan_application!inner (
            id,
            farmer_id
          )
        )
      `)
      .not("date_paid", "is", null)
      .eq("loan_contract.loan_application.farmer_id", userId)

    if (fallbackError) {
      console.error("Error with fallback query for total repaid:", fallbackError.message)
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦--</div>
            <p className="text-xs text-muted-foreground mt-2">Error loading repayment data</p>
          </CardContent>
        </Card>
      )
    }

    // Calculate total from the fallback query
    const totalRepaid = repayments?.reduce((sum, repayment) => sum + (repayment.periodic_repayment_amount || 0), 0) || 0

    return renderTotalRepaidCard(totalRepaid)
  }

  // If RPC was successful
  const totalRepaid = data || 0
  return renderTotalRepaidCard(totalRepaid)
}

function renderTotalRepaidCard(totalRepaid: number) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₦{totalRepaid.toLocaleString()}</div>
        <div className="flex items-center mt-2">
          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
          <p className="text-xs text-green-600">Good repayment history</p>
        </div>
      </CardContent>
    </Card>
  )
}

async function OutstandingAmountCard({ userId }: { userId?: string }) {
  if (!userId) {
    return <CardSkeleton title="Outstanding Amount" />
  }

  const supabase = createClient()

  try {
    // First, get all loan applications for this farmer
    const { data: loanApplications, error: loanAppError } = await supabase
      .from("loan_application")
      .select("id")
      .eq("farmer_id", userId)

    if (loanAppError) {
      console.error("Error fetching loan applications:", loanAppError.message)
      return renderOutstandingAmountCard(0, false)
    }

    if (!loanApplications || loanApplications.length === 0) {
      return renderOutstandingAmountCard(0, false)
    }

    // Get all loan application IDs
    const loanAppIds = loanApplications.map((app) => app.id)

    // Get active loan contracts
    const { data: activeContracts, error: contractsError } = await supabase
      .from("loan_contract")
      .select(`
        id,
        amount_disbursed,
        loan_application_id,
        interest_rate
      `)
      .in("loan_application_id", loanAppIds)
      .eq("status", "active")

    if (contractsError) {
      console.error("Error fetching active contracts:", contractsError.message)
      return renderOutstandingAmountCard(0, false)
    }

    if (!activeContracts || activeContracts.length === 0) {
      return renderOutstandingAmountCard(0, false)
    }

    // For each contract, get the total amount paid and calculate outstanding amount
    let totalOutstanding = 0
    let hasActiveLoans = false

    for (const contract of activeContracts) {
      // Get total amount disbursed
      const amountDisbursed = contract.amount_disbursed || 0
      const interestRate = contract.interest_rate || 0

      // Calculate interest amount based on interest rate
      const interestAmount = amountDisbursed * (interestRate / 100)
      const totalAmountWithInterest = amountDisbursed + interestAmount

      // Get total amount paid for this contract
      const { data: repayments, error: repaymentsError } = await supabase
        .from("loan_repayments")
        .select("periodic_repayment_amount")
        .eq("loan_contract_id", contract.id)
        .not("date_paid", "is", null)

      if (repaymentsError) {
        console.error(`Error fetching repayments for contract ${contract.id}:`, repaymentsError.message)
        continue
      }

      // Calculate total paid for this contract
      const totalPaid = repayments?.reduce((sum, repayment) => sum + (repayment.periodic_repayment_amount || 0), 0) || 0

      // Calculate outstanding amount for this contract (including interest)
      const outstanding = Math.max(0, totalAmountWithInterest - totalPaid)
      totalOutstanding += outstanding

      if (outstanding > 0) {
        hasActiveLoans = true
      }
    }

    return renderOutstandingAmountCard(totalOutstanding, hasActiveLoans)
  } catch (error) {
    console.error("Error calculating outstanding amount:", error)
    return renderOutstandingAmountCard(0, false)
  }
}

function renderOutstandingAmountCard(outstandingAmount: number, hasActiveLoans: boolean) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₦{outstandingAmount.toLocaleString()}</div>
        <div className="flex items-center mt-2">
          <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
          <p className="text-xs text-muted-foreground">
            {hasActiveLoans ? "Total remaining loan balance" : "No outstanding loans"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

async function LoanActivityChart({ userId }: { userId?: string }) {
  if (!userId) {
    return <ChartSkeleton title="Loan Activity" />
  }

  const supabase = createClient()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const currentYear = new Date().getFullYear()

  // Get repayments data with proper joins
  const { data: repayments, error: repaymentError } = await supabase
    .from("loan_repayments")
    .select(`
      periodic_repayment_amount,
      date_paid,
      loan_contract!inner (
        id,
        loan_application!inner (
          id,
          farmer_id
        )
      )
    `)
    .not("date_paid", "is", null)
    .eq("loan_contract.loan_application.farmer_id", userId)

  // Get disbursements data with proper joins
  const { data: disbursements, error: disbursementError } = await supabase
    .from("loan_contract")
    .select(`
      amount_disbursed,
      created_at,
      loan_application!inner (
        id,
        farmer_id
      )
    `)
    .eq("loan_application.farmer_id", userId)

  if (disbursementError || repaymentError) {
    console.error("Error fetching loan activity data:", disbursementError || repaymentError)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Activity</CardTitle>
          <CardDescription>Monthly loan repayments and disbursements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Error loading loan activity data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for chart
  const monthlyData = months.map((month, index) => {
    const monthDisbursements =
      disbursements
        ?.filter((d) => {
          const date = new Date(d.created_at)
          return date.getMonth() === index && date.getFullYear() === currentYear
        })
        .reduce((sum, d) => sum + (d.amount_disbursed || 0), 0) || 0

    const monthRepayments =
      repayments
        ?.filter((r) => {
          const date = new Date(r.date_paid)
          return date.getMonth() === index && date.getFullYear() === currentYear
        })
        .reduce((sum, r) => sum + (r.periodic_repayment_amount || 0), 0) || 0

    return {
      month,
      disbursements: monthDisbursements,
      repayments: monthRepayments,
    }
  })

  return (
    <Card className="loan-activity-chart">
      <CardHeader>
        <CardTitle>Loan Activity</CardTitle>
        <CardDescription>Monthly loan repayments and disbursements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <LineChart
            data={monthlyData}
            lines={[
              { key: "disbursements", label: "Disbursements", color: "#10b981" },
              { key: "repayments", label: "Repayments", color: "#3b82f6" },
            ]}
            xAxis="month"
          />
        </div>
      </CardContent>
    </Card>
  )
}

async function FarmPerformanceChart({ userId }: { userId?: string }) {
  if (!userId) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-muted-foreground">Unable to load farm performance data</p>
      </div>
    )
  }

  const supabase = createClient()

  // Direct query with no caching
  const { data: farms, error: farmsError } = await supabase.from("farms").select("id").eq("farmer_id", userId)

  if (farmsError) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-muted-foreground">Error loading farm data</p>
      </div>
    )
  }

  if (!farms || farms.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-muted-foreground">No farm data available</p>
      </div>
    )
  }

  // Direct query with no caching
  const { data: productions, error: productionsError } = await supabase
    .from("farm_production")
    .select("*")
    .in(
      "farm_id",
      farms.map((f) => f.id),
    )
    .order("expected_harvest_date", { ascending: true })

  if (productionsError) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-muted-foreground">Error loading production data</p>
      </div>
    )
  }

  if (!productions || productions.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-muted-foreground">No production data available</p>
      </div>
    )
  }

  // Prepare data for chart
  const chartData = productions.map((p) => {
    const harvestDate = new Date(p.expected_harvest_date)
    return {
      date: `${harvestDate.toLocaleString("default", { month: "short" })} ${harvestDate.getFullYear()}`,
      expected: p.expected_yield || 0,
      actual: p.actual_yield || 0,
      crop: p.type,
    }
  })

  return (
    <div className="h-80">
      <LineChart
        data={chartData}
        lines={[
          { key: "expected", label: "Expected Yield", color: "#10b981" },
          { key: "actual", label: "Actual Yield", color: "#f59e0b" },
        ]}
        xAxis="date"
      />
    </div>
  )
}

// In the NotificationsPanel function, update it to use the new schema

async function NotificationsPanel({ userId }: { userId?: string }) {
  if (!userId) {
    return <CardSkeleton title="Recent Notifications" />
  }

  const supabase = createClient()

  // Get all notifications for farmers or both
  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("id, title, message, type, created_at")
    .in("recipient_type", ["farmers", "both"])
    .order("created_at", { ascending: false })
    .limit(5)

  if (notificationsError) {
    console.error("Error fetching notifications:", notificationsError)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Stay updated with important information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground">Error loading notifications</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card className="notifications-panel">
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Stay updated with important information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/farmer/notifications">View All Notifications</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Get notification views for this farmer
  const { data: views, error: viewsError } = await supabase
    .from("notification_views")
    .select("notification_id, read")
    .eq("farmer_id", userId)

  if (viewsError) {
    console.error("Error fetching notification views:", viewsError)
  }

  // Create a map of notification_id to read status
  const viewsMap = new Map()
  views?.forEach((view) => {
    viewsMap.set(view.notification_id, view.read)
  })

  // Filter for unread notifications first
  const unreadNotifications = notifications.filter((notification) => {
    // If there's no view for this notification, it's unread
    if (!viewsMap.has(notification.id)) return true
    // If there's a view but read is false, it's unread
    return viewsMap.get(notification.id) === false
  })

  // If we have less than 3 unread notifications, add some read ones to make up the numbers
  let displayNotifications = [...unreadNotifications]
  if (displayNotifications.length < 3) {
    const readNotifications = notifications.filter(
      (notification) => viewsMap.has(notification.id) && viewsMap.get(notification.id) === true,
    )
    displayNotifications = [...displayNotifications, ...readNotifications].slice(0, 3)
  } else {
    displayNotifications = displayNotifications.slice(0, 3)
  }

  return (
    <Card className="notifications-panel">
      <CardHeader>
        <CardTitle>Recent Notifications</CardTitle>
        <CardDescription>Stay updated with important information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayNotifications.map((notification) => (
          <div key={notification.id} className="flex items-start space-x-4">
            <div className="rounded-full bg-green-100 p-2">
              <Bell className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
              <p className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
              {!viewsMap.has(notification.id) || !viewsMap.get(notification.id) ? (
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 mt-1">
                  Unread
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/farmer/notifications">View All Notifications</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
