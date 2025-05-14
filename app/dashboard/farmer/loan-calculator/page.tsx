"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Info, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const dynamic = "force-dynamic"

export default function LoanCalculatorPage() {
  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(15)
  const [loanTerm, setLoanTerm] = useState(12)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [amortizationSchedule, setAmortizationSchedule] = useState<any[]>([])

  // Eligibility Calculator State
  const [farmSize, setFarmSize] = useState(1)
  const [farmingExperience, setFarmingExperience] = useState(2)
  const [cropType, setCropType] = useState("maize")
  const [annualRevenue, setAnnualRevenue] = useState(200000)
  const [existingLoans, setExistingLoans] = useState(0)
  const [maxEligibleAmount, setMaxEligibleAmount] = useState(0)
  const [eligibilityScore, setEligibilityScore] = useState(0)
  const [eligibilityStatus, setEligibilityStatus] = useState("")

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

  // Calculate eligibility
  useEffect(() => {
    const timer = setTimeout(() => {
      // This is a simplified eligibility calculation
      // In a real application, this would be more complex and likely server-side

      // Base score out of 100
      let score = 0

      // Farm size: 0-20 points
      score += Math.min(farmSize * 5, 20)

      // Farming experience: 0-25 points
      score += Math.min(farmingExperience * 5, 25)

      // Annual revenue: 0-30 points
      score += Math.min((annualRevenue / 100000) * 10, 30)

      // Existing loans: 0-25 points (inverse relationship)
      score += Math.max(25 - (existingLoans / 50000) * 5, 0)

      setEligibilityScore(score)

      // Determine eligibility status
      if (score >= 80) {
        setEligibilityStatus("Excellent")
        setMaxEligibleAmount(Math.min(annualRevenue * 1.5, 1000000))
      } else if (score >= 60) {
        setEligibilityStatus("Good")
        setMaxEligibleAmount(Math.min(annualRevenue * 1, 500000))
      } else if (score >= 40) {
        setEligibilityStatus("Fair")
        setMaxEligibleAmount(Math.min(annualRevenue * 0.5, 200000))
      } else {
        setEligibilityStatus("Poor")
        setMaxEligibleAmount(Math.min(annualRevenue * 0.25, 50000))
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [farmSize, farmingExperience, cropType, annualRevenue, existingLoans])

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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/farmer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Calculator</h1>
          <p className="text-muted-foreground">Calculate loan payments and check your eligibility</p>
        </div>
      </div>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment">Payment Calculator</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility Calculator</TabsTrigger>
        </TabsList>

        {/* Payment Calculator */}
        <TabsContent value="payment" className="mt-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>Enter your loan details to calculate monthly payments and total cost.</CardDescription>
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
              <CardFooter className="flex flex-col items-start space-y-2 border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">Ready to apply for a loan?</p>
                <Button className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/dashboard/farmer/loan-application">Apply Now</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Eligibility Calculator */}
        <TabsContent value="eligibility" className="mt-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Farm & Financial Details</CardTitle>
                <CardDescription>Enter your farm details to check your loan eligibility.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="farm-size">Farm Size (hectares)</Label>
                  <Input
                    id="farm-size"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={farmSize}
                    onChange={(e) => setFarmSize(Number.parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farming-experience">Farming Experience (years)</Label>
                  <Input
                    id="farming-experience"
                    type="number"
                    min="0"
                    step="1"
                    value={farmingExperience}
                    onChange={(e) => setFarmingExperience(Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crop-type">Main Crop Type</Label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger id="crop-type">
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maize">Maize</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="cassava">Cassava</SelectItem>
                      <SelectItem value="yam">Yam</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual-revenue">Annual Farm Revenue (₦)</Label>
                  <Input
                    id="annual-revenue"
                    type="number"
                    min="0"
                    step="10000"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existing-loans">Existing Loans (₦)</Label>
                  <Input
                    id="existing-loans"
                    type="number"
                    min="0"
                    step="10000"
                    value={existingLoans}
                    onChange={(e) => setExistingLoans(Number.parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eligibility Results</CardTitle>
                <CardDescription>Your estimated loan eligibility based on provided information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">Eligibility Score</h3>
                    <div className="text-lg font-bold">{eligibilityScore}/100</div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200">
                    <div className="h-2.5 rounded-full bg-green-600" style={{ width: `${eligibilityScore}%` }}></div>
                  </div>
                  <div className="mt-2 text-sm">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        eligibilityStatus === "Excellent"
                          ? "text-green-600"
                          : eligibilityStatus === "Good"
                            ? "text-blue-600"
                            : eligibilityStatus === "Fair"
                              ? "text-yellow-600"
                              : "text-red-600"
                      }`}
                    >
                      {eligibilityStatus}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Maximum Eligible Loan Amount</h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(maxEligibleAmount)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on your farm size, experience, and financial status
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Eligibility Factors</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        Farm Size
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Larger farms may qualify for higher loan amounts</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span>{farmSize} hectares</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        Farming Experience
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>More experience improves eligibility</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span>{farmingExperience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        Annual Revenue
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Higher revenue indicates better repayment capacity</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span>{formatCurrency(annualRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        Existing Loans
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lower existing debt improves eligibility</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span>{formatCurrency(existingLoans)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Next Steps</p>
                      <p className="text-sm text-muted-foreground">
                        {eligibilityStatus === "Excellent" || eligibilityStatus === "Good"
                          ? "You have a good chance of loan approval. Apply now to proceed with your application."
                          : "Consider improving your farm revenue and reducing existing debt to increase your eligibility."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline">Save Results</Button>
                <Button className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/dashboard/farmer/loan-application">Apply for a Loan</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
