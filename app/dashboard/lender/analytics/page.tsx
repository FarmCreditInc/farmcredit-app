import { requireRole } from "@/lib/auth-utils"
import {
  getLenderAnalytics,
  getLoanPerformanceData,
  getMonthlyFundingData,
  getRepaymentTrends,
  getTransactionTypeData,
} from "@/actions/lender-analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, LineChart, PieChart } from "@/components/ui/charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default async function LenderAnalyticsPage() {
  await requireRole(["lender"])

  const { data: analytics, success: analyticsSuccess } = await getLenderAnalytics()
  const { data: monthlyFunding } = await getMonthlyFundingData()
  const { data: repaymentTrends } = await getRepaymentTrends()
  const { data: loanPerformance } = await getLoanPerformanceData()
  const { data: transactionTypes } = await getTransactionTypeData()

  // Calculate repayment rate
  const repaymentRate =
    analyticsSuccess && analytics?.totalRepaymentsReceived && analytics?.totalFunded
      ? Math.min(100, Math.round((analytics.totalRepaymentsReceived / analytics.totalFunded) * 100))
      : 0

  // Calculate default rate (simplified)
  const defaultRate = 100 - repaymentRate

  // Loan status distribution for pie chart
  const loanStatusData = [
    { name: "Active", value: loanPerformance?.activeLoans || 0, color: "#10b981" },
    { name: "Completed", value: loanPerformance?.completedLoans || 0, color: "#6366f1" },
    { name: "Defaulted", value: loanPerformance?.defaultedLoans || 0, color: "#ef4444" },
  ]

  // Loan category distribution
  const loanCategoryData = [
    { name: "Crop Production", value: loanPerformance?.cropProductionLoans || 0, color: "#10b981" },
    { name: "Livestock", value: loanPerformance?.livestockLoans || 0, color: "#6366f1" },
    { name: "Equipment", value: loanPerformance?.equipmentLoans || 0, color: "#f59e0b" },
    { name: "Other", value: loanPerformance?.otherLoans || 0, color: "#8b5cf6" },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your lending performance and metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <DatePickerWithRange className="w-auto" />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Total amount funded in loans</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Total Funded</h3>
                          <p>
                            This metric shows the total amount you have funded across all loans, including active,
                            completed, and defaulted loans.
                          </p>
                          <p>
                            It represents your total investment in the platform and is calculated by summing all loan
                            funding transactions from your wallet.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics?.totalFunded || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {analytics?.activeLoansCount || 0} active loans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Interest earned from loans</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Interest Earned</h3>
                          <p>
                            This metric shows the total interest you have earned from loan repayments, calculated as the
                            difference between total repayments and principal.
                          </p>
                          <p>
                            The return rate percentage shows your average return on investment across all loans. Higher
                            percentages indicate better investment performance.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics?.totalInterestEarned || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(((analytics?.totalInterestEarned || 0) / (analytics?.totalFunded || 1)) * 100).toFixed(1)}% return
                    rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Repayments Received</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Total repayments received</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Repayments Received</h3>
                          <p>
                            This metric shows the total amount of loan repayments you have received, including both
                            principal and interest components.
                          </p>
                          <p>
                            The repayment rate percentage indicates what portion of your funded amount has been repaid.
                            A higher percentage indicates better loan performance.
                          </p>
                          <p>Formula: (Total Repayments Received / Total Funded) × 100%</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics?.totalRepaymentsReceived || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{repaymentRate}% repayment rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Default Rate</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Loan default rate</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Default Rate</h3>
                          <p>
                            This metric shows the percentage of loans that have defaulted or are at risk of default. A
                            lower rate indicates better loan performance.
                          </p>
                          <p>
                            The industry average of 8.5% provides a benchmark for comparison. If your default rate is
                            below this benchmark, your loan portfolio is performing better than average.
                          </p>
                          <p>Formula: 100% - Repayment Rate</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{defaultRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Industry average: 8.5%</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Monthly Funding</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">About monthly funding</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Monthly Funding Chart</h3>
                          <p>
                            This chart shows the total amount you have funded in loans each month over the past 6
                            months. It helps you track your lending activity over time.
                          </p>
                          <p>
                            Each bar represents the total amount funded in that month. Higher bars indicate months with
                            more funding activity.
                          </p>
                          <p>
                            Use this chart to identify patterns in your lending behavior, such as seasonal variations or
                            increasing/decreasing trends in your funding activity.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>Amount funded per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {monthlyFunding && monthlyFunding.length > 0 ? (
                      <BarChart data={monthlyFunding} xAxis="month" yAxis="amount" color="#10b981" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          No funding data available yet. <br />
                          Start funding loans to see your monthly activity.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Repayment Trends</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">About repayment trends</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Repayment Trends Chart</h3>
                          <p>
                            This chart compares expected repayments with actual received repayments over time. It helps
                            you track the performance of your loan portfolio.
                          </p>
                          <p>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">Blue line</span>:
                            Expected repayments based on loan terms.
                          </p>
                          <p>
                            <span className="font-medium text-green-600 dark:text-green-400">Green line</span>: Actual
                            repayments received from borrowers.
                          </p>
                          <p>
                            The closer the green line is to the blue line, the better your repayment performance. Gaps
                            indicate potential issues with loan repayments.
                          </p>
                          <p>
                            Use this chart to identify months with repayment issues and monitor the overall health of
                            your loan portfolio.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>Expected vs received repayments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {repaymentTrends && repaymentTrends.length > 0 ? (
                      <LineChart
                        data={repaymentTrends}
                        lines={[
                          { key: "expected", label: "Expected", color: "#6366f1" },
                          { key: "received", label: "Received", color: "#10b981" },
                        ]}
                        xAxis="month"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          No repayment data available yet. <br />
                          Active loans will show repayment trends here.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loans" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Loan Status Distribution</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">About loan status distribution</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Loan Status Distribution Chart</h3>
                          <p>
                            This pie chart shows the distribution of your loans by status: active, completed, and
                            defaulted. It helps you understand your overall portfolio health.
                          </p>
                          <p>
                            <span className="font-medium text-green-600 dark:text-green-400">Green</span>: Active loans
                            that are currently being repaid.
                          </p>
                          <p>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">Blue</span>: Completed
                            loans that have been fully repaid.
                          </p>
                          <p>
                            <span className="font-medium text-red-600 dark:text-red-400">Red</span>: Defaulted loans
                            where repayments have stopped.
                          </p>
                          <p>
                            A healthy portfolio should have a large proportion of active and completed loans, with
                            minimal defaulted loans.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>Breakdown of loan statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {loanStatusData.some((item) => item.value > 0) ? (
                      <PieChart data={loanStatusData} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          No loan data available yet. <br />
                          Approve loans to see status distribution.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Loan Category Distribution</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">About loan category distribution</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Loan Category Distribution Chart</h3>
                          <p>
                            This pie chart shows how your loans are distributed across different farming categories. It
                            helps you understand your sector exposure and diversification.
                          </p>
                          <p>
                            <span className="font-medium text-green-600 dark:text-green-400">Green</span>: Crop
                            production loans for growing various crops.
                          </p>
                          <p>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">Blue</span>: Livestock
                            loans for animal farming.
                          </p>
                          <p>
                            <span className="font-medium text-amber-600 dark:text-amber-400">Amber</span>: Equipment
                            loans for purchasing farming machinery.
                          </p>
                          <p>
                            <span className="font-medium text-purple-600 dark:text-purple-400">Purple</span>: Other
                            agricultural loans.
                          </p>
                          <p>
                            A well-diversified portfolio should have a balanced distribution across different categories
                            to minimize risk.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>Breakdown by loan purpose</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {loanCategoryData.some((item) => item.value > 0) ? (
                      <PieChart data={loanCategoryData} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          No loan category data available yet. <br />
                          Approve loans to see category distribution.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction Types</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">About transaction types</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent align="end" className="w-80 p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-base">Transaction Types Chart</h3>
                        <p>
                          This line chart shows your transaction activity by type over time. It helps you track your
                          cash flow patterns and wallet activity.
                        </p>
                        <p>
                          <span className="font-medium text-green-600 dark:text-green-400">Green line</span>: Credit
                          transactions (money added to your wallet).
                        </p>
                        <p>
                          <span className="font-medium text-red-600 dark:text-red-400">Red line</span>: Debit
                          transactions (money deducted from your wallet).
                        </p>
                        <p>
                          <span className="font-medium text-amber-600 dark:text-amber-400">Amber line</span>: Withdrawal
                          transactions (money transferred out of the platform).
                        </p>
                        <p>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">Blue line</span>: Loan
                          funding transactions (money used to fund loans).
                        </p>
                        <p>
                          Use this chart to understand your transaction patterns and identify months with high activity.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>Transaction activity by type over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {transactionTypes && transactionTypes.length > 0 ? (
                    <LineChart
                      data={transactionTypes}
                      lines={[
                        { key: "credit", label: "Credit", color: "#10b981" },
                        { key: "debit", label: "Debit", color: "#ef4444" },
                        { key: "withdrawal", label: "Withdrawal", color: "#f59e0b" },
                        { key: "loan_funding", label: "Loan Funding", color: "#6366f1" },
                      ]}
                      xAxis="month"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground text-center">
                        No transaction data available yet. <br />
                        Complete transactions to see activity over time.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Credits vs Debits</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">About credits vs debits</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Credits vs Debits Chart</h3>
                          <p>
                            This bar chart compares your credit and debit transactions over time. It helps you
                            understand your cash flow balance and financial activity on the platform.
                          </p>
                          <p>
                            <span className="font-medium text-green-600 dark:text-green-400">Green bars</span>: Credit
                            transactions (money added to your wallet).
                          </p>
                          <p>
                            <span className="font-medium text-red-600 dark:text-red-400">Red bars</span>: Debit
                            transactions (money deducted from your wallet).
                          </p>
                          <p>
                            Months where green bars are taller than red bars indicate net positive cash flow. Months
                            where red bars are taller indicate net negative cash flow.
                          </p>
                          <p>
                            Use this chart to monitor your financial activity and ensure you're maintaining a healthy
                            balance between incoming and outgoing funds.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>Comparison of credits and debits over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {transactionTypes && transactionTypes.length > 0 ? (
                      <BarChart
                        data={transactionTypes}
                        xAxis="month"
                        stacked={false}
                        bars={[
                          { key: "credit", label: "Credit", color: "#10b981" },
                          { key: "debit", label: "Debit", color: "#ef4444" },
                        ]}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          No transaction data available yet. <br />
                          Complete transactions to see comparison.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Withdrawals</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">About withdrawals</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end" className="w-80 p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">Withdrawals Chart</h3>
                          <p>
                            This bar chart shows your withdrawal activity over time. It helps you track how much money
                            you've taken out of the platform each month.
                          </p>
                          <p>
                            Each bar represents the total amount withdrawn in that month. Higher bars indicate months
                            with more withdrawal activity.
                          </p>
                          <p>
                            Use this chart to monitor your withdrawal patterns and ensure you're maintaining enough
                            funds on the platform for future loan opportunities.
                          </p>
                          <p>
                            Regular withdrawals may indicate that you're successfully generating returns from your
                            investments.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>Withdrawal activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {transactionTypes && transactionTypes.some((item) => item.withdrawal > 0) ? (
                      <BarChart data={transactionTypes} xAxis="month" yAxis="withdrawal" color="#f59e0b" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          No withdrawal data available yet. <br />
                          Complete withdrawals to see activity.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
