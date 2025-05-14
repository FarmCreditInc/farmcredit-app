"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/ui/charts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

export function AnalyticsSummary() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analytics & Insights</CardTitle>
            <CardDescription>Track your farming and financial performance</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>
                  This dashboard provides an overview of your farming performance across different metrics. Switch
                  between tabs to view different aspects of your farm's performance.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="loans">
          <TabsList className="mb-4">
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="yields">Crop Yields</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
          </TabsList>
          <TabsContent value="loans" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Requested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦250,000</div>
                  <p className="text-xs text-muted-foreground">Across 2 applications</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦150,000</div>
                  <p className="text-xs text-green-600">60% approval rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Repaid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦75,000</div>
                  <p className="text-xs text-muted-foreground">50% of approved amount</p>
                </CardContent>
              </Card>
            </div>
            <div className="relative h-[200px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="absolute top-0 right-0 z-10">
                    <InfoIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      This chart shows the distribution of your loan applications by status: Approved, Pending, and
                      Rejected.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PieChart
                data={[
                  { name: "Approved", value: 60, color: "#22c55e" },
                  { name: "Pending", value: 20, color: "#f59e0b" },
                  { name: "Rejected", value: 20, color: "#ef4444" },
                ]}
              />
            </div>
          </TabsContent>
          <TabsContent value="yields" className="space-y-4">
            <div className="relative h-[300px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="absolute top-0 right-0 z-10">
                    <InfoIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      This chart displays your monthly crop yield in kilograms throughout the year, helping you track
                      seasonal productivity patterns.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <BarChart
                data={[
                  { name: "Jan", value: 40 },
                  { name: "Feb", value: 30 },
                  { name: "Mar", value: 45 },
                  { name: "Apr", value: 50 },
                  { name: "May", value: 60 },
                  { name: "Jun", value: 65 },
                  { name: "Jul", value: 70 },
                  { name: "Aug", value: 75 },
                  { name: "Sep", value: 80 },
                  { name: "Oct", value: 85 },
                  { name: "Nov", value: 90 },
                  { name: "Dec", value: 95 },
                ]}
                xAxis="name"
                yAxis="value"
                color="#22c55e"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">Monthly crop yield in kg (sample data)</p>
          </TabsContent>
          <TabsContent value="finances" className="space-y-4">
            <div className="relative h-[300px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="absolute top-0 right-0 z-10">
                    <InfoIcon className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      This chart compares your monthly income and expenses in Naira, helping you track your farm's
                      financial health and identify trends.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <LineChart
                data={[
                  { name: "Jan", income: 40000, expenses: 30000 },
                  { name: "Feb", income: 35000, expenses: 28000 },
                  { name: "Mar", income: 45000, expenses: 32000 },
                  { name: "Apr", income: 50000, expenses: 35000 },
                  { name: "May", income: 60000, expenses: 40000 },
                  { name: "Jun", income: 65000, expenses: 42000 },
                ]}
                lines={[
                  { key: "income", label: "Income", color: "#22c55e" },
                  { key: "expenses", label: "Expenses", color: "#ef4444" },
                ]}
                xAxis="name"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Monthly income vs expenses in Naira (sample data)
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
