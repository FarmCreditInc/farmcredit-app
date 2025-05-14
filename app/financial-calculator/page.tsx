"use client"

import { Separator } from "@/components/ui/separator"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Info, HelpCircle, ArrowLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function FinancialCalculator() {
  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(15)
  const [loanTerm, setLoanTerm] = useState(12)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [amortizationSchedule, setAmortizationSchedule] = useState<any[]>([])

  // Profit Calculator State
  const [cropType, setCropType] = useState("maize")
  const [landSize, setLandSize] = useState(1)
  const [seedCost, setSeedCost] = useState(15000)
  const [fertilizerCost, setFertilizerCost] = useState(25000)
  const [laborCost, setLaborCost] = useState(30000)
  const [otherCosts, setOtherCosts] = useState(10000)
  const [expectedYield, setExpectedYield] = useState(2000)
  const [marketPrice, setMarketPrice] = useState(150)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [grossProfit, setGrossProfit] = useState(0)
  const [roi, setRoi] = useState(0)

  // Crop data for quick selection
  const cropData = {
    maize: {
      seedCost: 15000,
      fertilizerCost: 25000,
      laborCost: 30000,
      otherCosts: 10000,
      expectedYield: 2000,
      marketPrice: 150,
    },
    rice: {
      seedCost: 20000,
      fertilizerCost: 30000,
      laborCost: 40000,
      otherCosts: 15000,
      expectedYield: 3000,
      marketPrice: 200,
    },
    cassava: {
      seedCost: 12000,
      fertilizerCost: 18000,
      laborCost: 25000,
      otherCosts: 8000,
      expectedYield: 15000,
      marketPrice: 50,
    },
    tomatoes: {
      seedCost: 25000,
      fertilizerCost: 35000,
      laborCost: 45000,
      otherCosts: 20000,
      expectedYield: 8000,
      marketPrice: 120,
    },
  }

  // Calculate loan details
  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && loanTerm > 0) {
      // Debounce calculations to improve performance
      const timer = setTimeout(() => {
        const monthlyRate = interestRate / 100 / 12
        const numPayments = loanTerm
        const x = Math.pow(1 + monthlyRate, numPayments)
        const monthly = (loanAmount * x * monthlyRate) / (x - 1)

        setMonthlyPayment(monthly)
        setTotalPayment(monthly * numPayments)
        setTotalInterest(monthly * numPayments - loanAmount)

        // Generate amortization schedule
        let balance = loanAmount
        const schedule = []

        for (let i = 1; i <= numPayments; i++) {
          const interestPayment = balance * monthlyRate
          const principalPayment = monthly - interestPayment
          balance -= principalPayment

          schedule.push({
            month: i,
            payment: monthly,
            principal: principalPayment,
            interest: interestPayment,
            balance: balance > 0 ? balance : 0,
          })
        }

        setAmortizationSchedule(schedule)
      }, 300) // 300ms debounce

      return () => clearTimeout(timer)
    }
  }, [loanAmount, interestRate, loanTerm])

  // Calculate profit details
  useEffect(() => {
    const timer = setTimeout(() => {
      const revenue = expectedYield * marketPrice * landSize
      const costs = (seedCost + fertilizerCost + laborCost + otherCosts) * landSize
      const profit = revenue - costs
      const returnOnInvestment = costs > 0 ? (profit / costs) * 100 : 0

      setTotalRevenue(revenue)
      setTotalCost(costs)
      setGrossProfit(profit)
      setRoi(returnOnInvestment)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [seedCost, fertilizerCost, laborCost, otherCosts, expectedYield, marketPrice, landSize])

  // Handle crop selection
  const handleCropChange = (crop: keyof typeof cropData) => {
    setCropType(crop)
    const data = cropData[crop]
    setSeedCost(data.seedCost)
    setFertilizerCost(data.fertilizerCost)
    setLaborCost(data.laborCost)
    setOtherCosts(data.otherCosts)
    setExpectedYield(data.expectedYield)
    setMarketPrice(data.marketPrice)
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container px-4 md:px-6 py-4">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => (window.location.href = "/financial-tips")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Financial Tips
        </Button>
      </div>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 dark:bg-green-950/10 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Calculator className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Financial Calculator</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Plan your farming finances with our easy-to-use calculators. Estimate loan payments and calculate
                potential profits.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="loan" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="loan">Loan Calculator</TabsTrigger>
                <TabsTrigger value="profit">Profit Calculator</TabsTrigger>
              </TabsList>

              {/* Loan Calculator */}
              <TabsContent value="loan" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Loan Details</CardTitle>
                      <CardDescription>
                        Enter your loan details to calculate monthly payments and total cost.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="loan-amount">Loan Amount (₦)</Label>
                          <Input
                            id="loan-amount-display"
                            value={loanAmount.toLocaleString()}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value.replace(/,/g, ""))
                              if (!isNaN(value)) setLoanAmount(value)
                            }}
                            className="w-24 text-right"
                          />
                        </div>
                        <Slider
                          id="loan-amount"
                          min={10000}
                          max={1000000}
                          step={10000}
                          value={[loanAmount]}
                          onValueChange={(value) => setLoanAmount(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>₦10,000</span>
                          <span>₦1,000,000</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                          <Input
                            id="interest-rate-display"
                            value={interestRate}
                            onChange={(e) => {
                              const value = Number.parseFloat(e.target.value)
                              if (!isNaN(value)) setInterestRate(value)
                            }}
                            className="w-24 text-right"
                          />
                        </div>
                        <Slider
                          id="interest-rate"
                          min={5}
                          max={30}
                          step={0.5}
                          value={[interestRate]}
                          onValueChange={(value) => setInterestRate(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>5%</span>
                          <span>30%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="loan-term">Loan Term (months)</Label>
                          <Input
                            id="loan-term-display"
                            value={loanTerm}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (!isNaN(value)) setLoanTerm(value)
                            }}
                            className="w-24 text-right"
                          />
                        </div>
                        <Slider
                          id="loan-term"
                          min={3}
                          max={36}
                          step={1}
                          value={[loanTerm]}
                          onValueChange={(value) => setLoanTerm(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>3 months</span>
                          <span>36 months</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Loan Summary</CardTitle>
                      <CardDescription>Your estimated loan payments and total cost.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Monthly Payment</p>
                          <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Payment</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalPayment)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Principal</p>
                          <p className="text-2xl font-bold">{formatCurrency(loanAmount)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Interest</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalInterest)}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Amortization Schedule</h3>
                        <div className="max-h-[300px] overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Principal</TableHead>
                                <TableHead>Interest</TableHead>
                                <TableHead>Balance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {amortizationSchedule.map((row) => (
                                <TableRow key={row.month}>
                                  <TableCell>{row.month}</TableCell>
                                  <TableCell>{formatCurrency(row.payment)}</TableCell>
                                  <TableCell>{formatCurrency(row.principal)}</TableCell>
                                  <TableCell>{formatCurrency(row.interest)}</TableCell>
                                  <TableCell>{formatCurrency(row.balance)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Profit Calculator */}
              <TabsContent value="profit" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Crop & Cost Details</CardTitle>
                      <CardDescription>Enter your farming details to calculate potential profits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="crop-type">Crop Type</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {Object.keys(cropData).map((crop) => (
                            <Button
                              key={crop}
                              type="button"
                              variant={cropType === crop ? "default" : "outline"}
                              className={cropType === crop ? "bg-green-600 hover:bg-green-700" : ""}
                              onClick={() => handleCropChange(crop as keyof typeof cropData)}
                            >
                              {crop.charAt(0).toUpperCase() + crop.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="land-size">Land Size (hectares)</Label>
                          <Input
                            id="land-size"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={landSize}
                            onChange={(e) => setLandSize(Number.parseFloat(e.target.value))}
                            className="w-24 text-right"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Costs (per hectare)</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="seed-cost">
                              <div className="flex items-center">
                                Seed Cost
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Cost of seeds per hectare</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </Label>
                            <Input
                              id="seed-cost"
                              type="number"
                              value={seedCost}
                              onChange={(e) => setSeedCost(Number.parseInt(e.target.value))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fertilizer-cost">
                              <div className="flex items-center">
                                Fertilizer Cost
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Cost of fertilizer per hectare</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </Label>
                            <Input
                              id="fertilizer-cost"
                              type="number"
                              value={fertilizerCost}
                              onChange={(e) => setFertilizerCost(Number.parseInt(e.target.value))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="labor-cost">
                              <div className="flex items-center">
                                Labor Cost
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Cost of labor per hectare</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </Label>
                            <Input
                              id="labor-cost"
                              type="number"
                              value={laborCost}
                              onChange={(e) => setLaborCost(Number.parseInt(e.target.value))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="other-costs">
                              <div className="flex items-center">
                                Other Costs
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Other costs like pesticides, irrigation, etc.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </Label>
                            <Input
                              id="other-costs"
                              type="number"
                              value={otherCosts}
                              onChange={(e) => setOtherCosts(Number.parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Revenue (per hectare)</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expected-yield">
                              <div className="flex items-center">
                                Expected Yield (kg)
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Expected yield in kilograms per hectare</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </Label>
                            <Input
                              id="expected-yield"
                              type="number"
                              value={expectedYield}
                              onChange={(e) => setExpectedYield(Number.parseInt(e.target.value))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="market-price">
                              <div className="flex items-center">
                                Market Price (₦/kg)
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Expected market price per kilogram</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </Label>
                            <Input
                              id="market-price"
                              type="number"
                              value={marketPrice}
                              onChange={(e) => setMarketPrice(Number.parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profit Summary</CardTitle>
                      <CardDescription>
                        Your estimated farming profits based on the provided information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Cost</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Gross Profit</p>
                          <p className={`text-2xl font-bold ${grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(grossProfit)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">ROI</p>
                          <p className={`text-2xl font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {roi.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Breakdown</h3>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Land Size:</span>
                            <span>{landSize} hectare(s)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected Yield:</span>
                            <span>{(expectedYield * landSize).toLocaleString()} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Market Price:</span>
                            <span>₦{marketPrice}/kg</span>
                          </div>

                          <Separator className="my-2" />

                          <div className="flex justify-between">
                            <span>Seed Cost:</span>
                            <span>{formatCurrency(seedCost * landSize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fertilizer Cost:</span>
                            <span>{formatCurrency(fertilizerCost * landSize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Labor Cost:</span>
                            <span>{formatCurrency(laborCost * landSize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Other Costs:</span>
                            <span>{formatCurrency(otherCosts * landSize)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/10 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Profit Potential</p>
                            <p className="text-sm text-muted-foreground">
                              {grossProfit > 0
                                ? `This crop has a positive profit potential with an ROI of ${roi.toFixed(2)}%.`
                                : `This crop currently shows a negative profit. Consider adjusting your costs or exploring other crops.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
