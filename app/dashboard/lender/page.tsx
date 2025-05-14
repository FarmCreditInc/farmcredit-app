import { getLenderWallet } from "@/actions/lender-actions"
import { getLenderAnalytics, getMonthlyFundingData } from "@/actions/lender-analytics"
import { getPendingLoanApplications } from "@/actions/lender-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { cookies } from "next/headers"
import * as jose from "jose"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowUpRight, Wallet, Users, BarChart3, CreditCard, Clock, CheckCircle, Info } from "lucide-react"
import { BarChart, LineChart } from "@/components/ui/charts"
import { TransactionHistory } from "@/components/dashboard/transaction-history"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TopUpWalletButton } from "@/components/dashboard/top-up-wallet-button"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export default async function LenderDashboardPage() {
  // Get user from session
  const sessionCookie = cookies().get("session")?.value
  let userEmail = ""
  let userName = ""
  let userId = ""

  if (sessionCookie) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
      userEmail = payload.email as string
      userName = (payload.organization_name as string) || "Lender"
      userId = payload.id as string
    } catch (error) {
      console.error("Error verifying JWT:", error)
    }
  }

  // Fetch data using the authenticated user's ID
  const { data: wallet } = await getLenderWallet()
  const { data: analytics } = await getLenderAnalytics()
  const { data: pendingApplications } = await getPendingLoanApplications()

  // Get monthly funding data for chart
  const { data: monthlyFundingData } = await getMonthlyFundingData()

  // Get repayment data for chart (using sample data for now)
  const repaymentData = [
    {
      month: "Jan",
      expected: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.2 : 0,
      received: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.18 : 0,
    },
    {
      month: "Feb",
      expected: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.15 : 0,
      received: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.14 : 0,
    },
    {
      month: "Mar",
      expected: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.18 : 0,
      received: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.16 : 0,
    },
    {
      month: "Apr",
      expected: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.22 : 0,
      received: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.21 : 0,
    },
    {
      month: "May",
      expected: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.15 : 0,
      received: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.14 : 0,
    },
    {
      month: "Jun",
      expected: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.1 : 0,
      received: analytics?.totalRepaymentsReceived ? analytics.totalRepaymentsReceived * 0.09 : 0,
    },
  ]

  return (
    <TooltipProvider>
      <div className="w-full px-2 sm:px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {userName}</h1>
            <p className="text-muted-foreground">Here's an overview of your lending activities</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/lender/applications">View Applications</Link>
            </Button>
            <TopUpWalletButton userEmail={userEmail} size="sm" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-900 wallet-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="max-w-[75%]">
                  {" "}
                  {/* Add max-width to ensure space for the icon */}
                  <p className="text-sm font-medium text-muted-foreground mb-1">Available Balance</p>
                  <h3
                    className="font-bold truncate"
                    style={{
                      fontSize:
                        wallet?.balance && wallet.balance >= 1000000000
                          ? "1.25rem"
                          : wallet?.balance && wallet.balance >= 10000000
                            ? "1.375rem"
                            : "1.5rem",
                    }}
                    title={formatCurrency(wallet?.balance || 0)}
                  >
                    {formatCurrency(wallet?.balance || 0)}
                  </h3>
                  <p
                    className="text-xs text-muted-foreground mt-1 truncate"
                    title={`Locked: ${formatCurrency(wallet?.locked_balance || 0)}`}
                  >
                    Locked: {formatCurrency(wallet?.locked_balance || 0)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full flex-shrink-0">
                  {" "}
                  {/* Add flex-shrink-0 to prevent icon from shrinking */}
                  <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="px-0 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-transparent"
                >
                  <Link href="/dashboard/lender/transactions">
                    View Transactions <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="pending-applications">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Applications</p>
                  <h3 className="text-2xl font-bold truncate">{pendingApplications?.length || 0}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Waiting for approval</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="px-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-transparent"
                >
                  <Link href="/dashboard/lender/applications">
                    View Applications <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="active-loans">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Loans</p>
                  <h3 className="text-2xl font-bold truncate">{analytics?.activeLoansCount || 0}</h3>
                  <p
                    className="text-xs text-muted-foreground mt-1 truncate"
                    title={`Total funded: ${formatCurrency(analytics?.totalFunded || 0)}`}
                  >
                    Total funded: {formatCurrency(analytics?.totalFunded || 0)}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="px-0 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-transparent"
                >
                  <Link href="/dashboard/lender/loans">
                    View Loans <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Interest Earned</p>
                  <h3
                    className="text-2xl font-bold truncate"
                    title={formatCurrency(analytics?.totalInterestEarned || 0)}
                  >
                    {formatCurrency(analytics?.totalInterestEarned || 0)}
                  </h3>
                  <p
                    className="text-xs text-muted-foreground mt-1 truncate"
                    title={`Repayments: ${formatCurrency(analytics?.totalRepaymentsReceived || 0)}`}
                  >
                    Repayments: {formatCurrency(analytics?.totalRepaymentsReceived || 0)}
                  </p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
                  <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="px-0 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-transparent"
                >
                  <Link href="/dashboard/lender/analytics">
                    View Analytics <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6 analytics-charts">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Monthly Funding</CardTitle>
                  <CardDescription>Amount funded per month</CardDescription>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">About monthly funding</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="end" className="max-w-[280px] sm:max-w-[320px] md:max-w-[350px] p-3 text-sm">
                    <p>
                      This chart displays your monthly loan funding amounts. Each bar represents the total amount you've
                      invested in farmer loans during that month. Track your investment patterns over time and identify
                      your most active funding periods. Higher bars indicate months with larger investments.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[240px] p-4">
                {monthlyFundingData && monthlyFundingData.length > 0 ? (
                  <BarChart data={monthlyFundingData} xAxis="month" yAxis="amount" color="#10b981" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-center">No funding data available yet</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Data will appear here after you fund your first loan
                    </p>
                  </div>
                )}
              </div>
              {monthlyFundingData && monthlyFundingData.length > 0 && (
                <div className="px-4 pb-3 pt-1">
                  <p className="text-xs text-muted-foreground">
                    <Info className="inline h-3 w-3 mr-1" />
                    Tracks your monthly investment amounts in farmer loans. Higher bars indicate months with larger
                    investments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Repayment Performance</CardTitle>
                  <CardDescription>Expected vs received repayments</CardDescription>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">About repayment performance</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="end" className="max-w-[280px] sm:max-w-[320px] md:max-w-[350px] p-3 text-sm">
                    <p>
                      This chart compares expected loan repayments (blue line) with actual received repayments (green
                      line). The closer the green line is to the blue line, the better your loan performance. Gaps
                      between the lines indicate delayed or missed payments. This helps you monitor the health of your
                      investment portfolio.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[240px] p-4">
                {analytics?.totalRepaymentsReceived ? (
                  <LineChart
                    data={repaymentData}
                    lines={[
                      { key: "expected", label: "Expected", color: "#6366f1" },
                      { key: "received", label: "Received", color: "#10b981" },
                    ]}
                    xAxis="month"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-center">No repayment data available yet</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Data will appear here after your loans start repayments
                    </p>
                  </div>
                )}
              </div>
              {analytics?.totalRepaymentsReceived && (
                <div className="px-4 pb-3 pt-1">
                  <p className="text-xs text-muted-foreground">
                    <Info className="inline h-3 w-3 mr-1" />
                    Compares expected repayments (blue) vs. actual received repayments (green). Closer lines indicate
                    better loan performance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions and Quick Actions */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="transaction-history">
            <TransactionHistory isRecent={true} limit={5} />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Recent Applications</CardTitle>
                  <CardDescription>Latest loan applications</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/lender/applications">
                    View All <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pendingApplications && pendingApplications.length > 0 ? (
                <div className="space-y-4">
                  {pendingApplications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{app.farmer?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{app.purpose_category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(app.amount_requested)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No pending applications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
