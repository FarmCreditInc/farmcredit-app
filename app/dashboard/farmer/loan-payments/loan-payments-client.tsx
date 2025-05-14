"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, CheckCircle, Clock, CreditCard, Info, Percent, Timer, Wallet } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "react-hot-toast"
import { getActiveLoansWithRepayments } from "@/actions/repayment-actions"

// Add this helper function at the top of the component
const formatNaira = (amount: number) => {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function LoanPaymentsClient() {
  const [activeLoans, setActiveLoans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchLoans() {
      try {
        setIsLoading(true)
        const response = await getActiveLoansWithRepayments()

        if (response.success && response.data) {
          setActiveLoans(response.data)
        } else {
          toast.error("Failed to load loan data")
        }
      } catch (error) {
        console.error("Error fetching loans:", error)
        toast.error("An error occurred while loading your loans")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoans()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <CreditCard className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-lg font-medium">Loading your active loans...</p>
      </div>
    )
  }

  if (activeLoans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Loans</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You don't have any active loans that require repayment at this time.
          </p>
          <Button onClick={() => router.push("/dashboard/farmer/loan-application")}>Apply for a Loan</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Alert variant="default" className="bg-primary/10 border-primary/20 text-foreground">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Timely loan repayments help build your credit score and improve your chances for future financing.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeLoans.map((loan) => (
              <LoanCard key={loan.contract.id} loan={loan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <PaymentHistoryTable loans={activeLoans} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LoanCard({ loan }: { loan: any }) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isExpired, setIsExpired] = useState(false)

  // Calculate deadline based on loan creation date + loan_duration_days
  const calculateDeadline = () => {
    const createdAt = new Date(loan.contract.created_at)
    const durationDays = loan.contract.loan_application.loan_duration_days || 30
    const deadline = new Date(createdAt)
    deadline.setDate(deadline.getDate() + durationDays)
    return deadline
  }

  const deadline = calculateDeadline()

  // Get total amount including interest from estimated_total_repayment
  const totalAmountWithInterest = loan.contract.loan_application.estimated_total_repayment || 0

  // Calculate principal amount
  const principalAmount = loan.contract.amount_disbursed || 0

  // Calculate interest amount
  const interestAmount = totalAmountWithInterest - principalAmount

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const timeDiff = deadline.getTime() - now.getTime()

      if (timeDiff <= 0) {
        setTimeLeft("Expired")
        setIsExpired(true)
        return
      }

      // Calculate days, hours, minutes
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      setIsExpired(false)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [deadline])

  // Recalculate progress based on total amount with interest
  const progressPercentage = totalAmountWithInterest > 0 ? (loan.totalPaid / totalAmountWithInterest) * 100 : 0

  // Calculate remaining amount including interest
  const remainingAmount = totalAmountWithInterest - loan.totalPaid

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{loan.contract.loan_application.purpose_category || "Farm Loan"}</CardTitle>
            <CardDescription className="mt-1">From: {loan.contract.lender.organization_name}</CardDescription>
          </div>
          <Badge variant={isExpired ? "destructive" : "outline"} className="ml-2">
            {isExpired ? "Overdue" : "Active"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-4 flex-grow">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Principal Amount</span>
            <span className="font-semibold">{formatNaira(principalAmount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Interest</span>
            <span className="font-semibold flex items-center">
              <Percent className="h-3 w-3 mr-1" />
              {loan.contract.interest_rate}% ({formatNaira(interestAmount)})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Amount Due</span>
            <span className="font-semibold">{formatNaira(totalAmountWithInterest)}</span>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Repayment Progress</span>
              <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Paid: {formatNaira(loan.totalPaid)}</span>
              <span>Total: {formatNaira(totalAmountWithInterest)}</span>
            </div>
          </div>

          <div className="mt-2 p-3 rounded-lg border bg-card">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Payment Deadline</span>
            </div>

            <div className="font-semibold">{formatDate(deadline)}</div>

            <div className="flex items-center mt-1 text-sm">
              <Timer className="h-3.5 w-3.5 mr-1.5" />
              <span className={isExpired ? "text-destructive" : "text-muted-foreground"}>
                {isExpired ? "Overdue - Penalties apply" : timeLeft + " remaining"}
              </span>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm font-medium">Amount Due</span>
              <span className="font-semibold">{formatNaira(remainingAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 border-t">
        <Link href={`/dashboard/farmer/loan-payments/${loan.contract.id}`} className="w-full">
          <Button className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Make Payment
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function PaymentHistoryTable({ loans }: { loans: any[] }) {
  // Flatten all repayments from all loans and filter for paid ones
  const paidRepayments = loans
    .flatMap((loan) =>
      loan.repayments
        .filter((repayment: any) => repayment.date_paid)
        .map((repayment: any) => ({
          ...repayment,
          loanPurpose: loan.contract.loan_application.purpose_category || "Farm Loan",
          lenderName: loan.contract.lender.organization_name,
          contractId: loan.contract.id,
        })),
    )
    .sort((a, b) => new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime())

  if (paidRepayments.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Payment History</h3>
        <p className="text-muted-foreground">Your payment history will appear here once you've made repayments.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="grid grid-cols-4 bg-muted px-4 py-3 text-sm font-medium">
        <div>Date</div>
        <div>Loan</div>
        <div>Lender</div>
        <div className="text-right">Amount</div>
      </div>
      <div className="divide-y">
        {paidRepayments.map((repayment) => (
          <div
            key={repayment.id}
            className="grid grid-cols-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
          >
            <div className="text-sm flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
              {formatDate(repayment.date_paid)}
            </div>
            <div className="text-sm font-medium">{repayment.loanPurpose}</div>
            <div className="text-sm">{repayment.lenderName}</div>
            <div className="text-right font-medium">{formatNaira(repayment.periodic_repayment_amount || 0)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
