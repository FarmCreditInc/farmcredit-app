"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AnalyticsClientProps {
  initialFarmData: any[]
  initialFinancialData: {
    disbursed: number
    repaid: number
    outstanding: number
  }
  initialSeasonalData: any[]
  initialTotalFarms: number
  userId: string
}

export default function AnalyticsClient({
  initialFarmData,
  initialFinancialData,
  initialSeasonalData,
  initialTotalFarms,
  userId,
}: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState("farm")
  const [farmData] = useState(initialFarmData)
  const [financialData] = useState(initialFinancialData)
  const [seasonalData] = useState(initialSeasonalData)
  const [totalFarms] = useState(initialTotalFarms)
  const [loading] = useState(false)
  const [error] = useState(null)

  // Prepare financial data for pie chart
  const pieData = [
    { name: "Repaid", value: financialData.repaid },
    { name: "Outstanding", value: financialData.outstanding },
  ].filter((item) => item.value > 0)

  const COLORS = ["#4CAF50", "#FFC107", "#F44336"]

  // If there's an error, show it
  if (error && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="farm" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="flex flex-wrap w-full h-auto">
        <TabsTrigger value="farm" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
          Farm Performance
        </TabsTrigger>
        <TabsTrigger value="financial" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
          Financial Health
        </TabsTrigger>
        <TabsTrigger value="seasonal" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
          Seasonal Forecast
        </TabsTrigger>
        <TabsTrigger value="summary" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
          Summary
        </TabsTrigger>
      </TabsList>

      <TabsContent value="farm" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Crop Yield Trends</CardTitle>
                <CardDescription>Expected yield per farm</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      This chart shows the expected yield for each crop type across your farms. Higher bars indicate
                      higher expected yields. Hover over each bar to see detailed information about the farm and
                      expected harvest date.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading farm data...</p>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-500">
                <p>Error loading data: {error}</p>
              </div>
            ) : farmData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No farm production data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={farmData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                  <YAxis label={{ value: "Expected Yield", angle: -90, position: "insideLeft" }} />
                  <RechartsTooltip
                    formatter={(value, name, props) => [value, "Expected Yield"]}
                    labelFormatter={(value) => `Crop: ${value}`}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="font-bold">{label}</p>
                            <p>Farm: {payload[0].payload.farm}</p>
                            <p>Expected Yield: {payload[0].value}</p>
                            <p>Harvest Date: {payload[0].payload.harvestDate}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="yield" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Total Farms</CardTitle>
                  <CardDescription>Number of registered farms</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>
                        This shows the total number of farms you have registered in the system. Each farm can have
                        multiple crop types and production records.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="h-60 flex flex-col items-center justify-center">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div className="text-6xl font-bold">{totalFarms}</div>
                  <p className="text-muted-foreground mt-2">Registered Farms</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Farm Distribution</CardTitle>
                  <CardDescription>Distribution by crop type</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>
                        This pie chart shows the distribution of your farms by crop type. Each segment represents the
                        percentage of farms dedicated to a specific crop. A diverse distribution indicates good crop
                        diversification.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {loading ? (
                <p>Loading...</p>
              ) : farmData.length === 0 ? (
                <p className="text-muted-foreground">No farm data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={farmData.reduce((acc, curr) => {
                        const existing = acc.find((item) => item.name === curr.name)
                        if (existing) {
                          existing.value += 1
                        } else {
                          acc.push({ name: curr.name, value: 1 })
                        }
                        return acc
                      }, [])}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {farmData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Loan Status</CardTitle>
                <CardDescription>Disbursed vs Repaid</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      This chart shows the breakdown of your loan status. The green segment represents the amount you've
                      already repaid, while the yellow segment shows your outstanding balance. A larger green segment
                      indicates good repayment progress.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading financial data...</p>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-500">
                <p>Error loading data: {error}</p>
              </div>
            ) : financialData.disbursed === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No loan data available</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value, percent }) =>
                        `${name}: ₦${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={true}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 w-full mt-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">Total Disbursed</p>
                    <p className="text-lg font-bold">₦{financialData.disbursed.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Total Repaid</p>
                    <p className="text-lg font-bold">₦{financialData.repaid.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Outstanding</p>
                    <p className="text-lg font-bold">₦{financialData.outstanding.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Repayment Progress</CardTitle>
                  <CardDescription>Percentage of loan repaid</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>
                        This circular progress indicator shows what percentage of your total loan amount you have
                        repaid. A higher percentage indicates better progress toward full repayment of your loans.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="h-60 flex flex-col items-center justify-center">
              {loading ? (
                <p>Loading...</p>
              ) : financialData.disbursed === 0 ? (
                <p className="text-muted-foreground">No loan data available</p>
              ) : (
                <>
                  <div className="relative h-32 w-32">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-green-500"
                        strokeWidth="10"
                        strokeDasharray={`${(financialData.repaid / financialData.disbursed) * 251.2} 251.2`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {Math.round((financialData.repaid / financialData.disbursed) * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-4">Loan Repayment Progress</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Loan Utilization</CardTitle>
                  <CardDescription>How your loans are being used</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>
                        This section will show how you've utilized your loans across different farming activities.
                        Proper loan utilization is important for maximizing returns and ensuring timely repayment.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">Loan utilization data will be available soon</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="seasonal" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Seasonal Yield Forecast</CardTitle>
                <CardDescription>Expected yield over time by crop type</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      This line chart shows your expected crop yields over time, broken down by crop type. Each line
                      represents a different crop, allowing you to see seasonal patterns and plan harvests accordingly.
                      Higher points indicate higher expected yields.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading seasonal data...</p>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-500">
                <p>Error loading data: {error}</p>
              </div>
            ) : seasonalData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No seasonal forecast data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} interval={0} />
                  <YAxis label={{ value: "Expected Yield", angle: -90, position: "insideLeft" }} />
                  <RechartsTooltip />
                  <Legend />
                  {seasonalData.length > 0 &&
                    Object.keys(seasonalData[0])
                      .filter((key) => key !== "month")
                      .map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={`hsl(${index * 45}, 70%, 50%)`}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Planting Calendar</CardTitle>
                  <CardDescription>Optimal planting times for your crops</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>
                        This calendar will show the optimal planting times for different crops based on your location
                        and climate conditions. Following this calendar can help maximize yields and reduce crop
                        failures.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">Planting calendar will be available soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Market Price Forecast</CardTitle>
                  <CardDescription>Projected market prices for your crops</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>
                        This forecast will show projected market prices for your crops over the coming months. This
                        information can help you plan when to sell your harvest to maximize profits.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">Market price forecast will be available soon</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="summary" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Overall performance metrics</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      This summary provides an overview of your farming operation's key metrics, including farm
                      statistics, financial overview, upcoming harvests, and personalized recommendations to improve
                      your farming business.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading summary data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Farm Statistics</h3>
                    <p>Total Farms: {totalFarms}</p>
                    <p>Total Crop Types: {[...new Set(farmData.map((item) => item.name))].length}</p>
                    <p>Total Expected Yield: {farmData.reduce((sum, item) => sum + item.yield, 0).toLocaleString()}</p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Financial Overview</h3>
                    <p>Total Loan Amount: ₦{financialData.disbursed.toLocaleString()}</p>
                    <p>Total Repaid: ₦{financialData.repaid.toLocaleString()}</p>
                    <p>Outstanding Balance: ₦{financialData.outstanding.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Upcoming Harvests</h3>
                    {farmData.length > 0 ? (
                      <ul className="space-y-2">
                        {farmData
                          .sort((a, b) => new Date(a.harvestDate) - new Date(b.harvestDate))
                          .slice(0, 3)
                          .map((item, index) => (
                            <li key={index}>
                              {item.name} - {item.harvestDate} ({item.yield} expected)
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p>No upcoming harvests</p>
                    )}
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2">
                      <li>Consider diversifying your crop types</li>
                      <li>Track your farm expenses for better financial analysis</li>
                      <li>Update your harvest forecasts regularly</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
