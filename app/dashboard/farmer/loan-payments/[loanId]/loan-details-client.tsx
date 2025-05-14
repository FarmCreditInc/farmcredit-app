"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, Info, Percent, Shield, Timer } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoanDetailsClient({ loan }: { loan: any }) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isExpired, setIsExpired] = useState(false)
  const [customAmount, setCustomAmount] = useState("")

  // Add this helper function at the top of the component
  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Calculate deadline based on loan creation date + loan_duration_days
  const calculateDeadline = () => {
    const createdAt = new Date(loan.contract.created_at)
    const durationDays = loan.contract.loan_application.loan_duration_days || 30
    const deadline = new Date(createdAt)
    deadline.setDate(deadline.getDate() + durationDays)
    return deadline
  }

  const deadline = calculateDeadline()

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

  const handlePayNow = () => {
    const amount = customAmount ? Number.parseFloat(customAmount) : loan.remainingAmount
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    router.push(`/dashboard/farmer/loan-payments/${loan.contract.id}/pay?amount=${amount}`)
  }

  // Calculate penalty if past deadline
  const calculatePenalty = () => {
    if (!isExpired) return 0

    const now = new Date()
    const daysLate = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))
    const penaltyRate = 0.001 // 0.1% per day
    const remainingAmount = (loan.contract.loan_application.estimated_total_repayment || loan.totalDue) - loan.totalPaid
    return remainingAmount * penaltyRate * daysLate
  }

  const penalty = calculatePenalty()
  const remainingAmount = (loan.contract.loan_application.estimated_total_repayment || loan.totalDue) - loan.totalPaid
  const totalDue = remainingAmount + penalty

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Loans
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Loan Summary</CardTitle>
            <CardDescription>Details about your loan and payment deadline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-2xl font-bold">{formatNaira(loan.contract.amount_disbursed || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-2xl font-bold flex items-center">
                  {loan.contract.interest_rate}
                  <Percent className="h-5 w-5 ml-1" />
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Lender</p>
                <p className="font-medium">{loan.contract.lender.organization_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loan Date</p>
                <p className="font-medium">{formatDate(loan.contract.created_at)}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Repayment Progress</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {formatNaira(loan.totalPaid)} of{" "}
                  {formatNaira(loan.contract.loan_application.estimated_total_repayment || loan.totalDue)}
                </span>
                <span className="text-sm font-medium">
                  {Math.round(
                    (loan.totalPaid / (loan.contract.loan_application.estimated_total_repayment || loan.totalDue)) *
                      100,
                  )}
                  % Complete
                </span>
              </div>
              <Progress
                value={
                  (loan.totalPaid / (loan.contract.loan_application.estimated_total_repayment || loan.totalDue)) * 100
                }
                className="h-2"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Payment Deadline</h3>

              <div className="rounded-md border overflow-hidden">
                <div className="bg-muted p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">Payment Due By</span>
                    </div>
                    <Badge variant={isExpired ? "destructive" : "outline"}>{isExpired ? "Overdue" : "Active"}</Badge>
                  </div>

                  <div className="mt-2 text-2xl font-bold">{formatDate(deadline)}</div>

                  <div className="mt-2 flex items-center">
                    <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className={`${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
                      {isExpired ? "Overdue - Late penalties apply" : `Time remaining: ${timeLeft}`}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-card">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Remaining Balance</span>
                      <span className="font-semibold">
                        {formatNaira(
                          (loan.contract.loan_application.estimated_total_repayment || loan.totalDue) - loan.totalPaid,
                        )}
                      </span>
                    </div>

                    {isExpired && (
                      <div className="flex justify-between items-center text-destructive">
                        <span className="text-sm flex items-center">
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Late Payment Penalty
                        </span>
                        <span className="font-medium">{formatNaira(penalty)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center font-bold">
                      <span>Total Due</span>
                      <span>{formatNaira(totalDue)}</span>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label htmlFor="custom-amount">Payment Amount</Label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex items-center justify-center">
                            <span className="text-sm font-medium">₦</span>
                          </div>
                          <Input
                            id="custom-amount"
                            type="number"
                            placeholder="Enter amount"
                            className="pl-9"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                          />
                        </div>
                        <Button onClick={handlePayNow}>Pay Now</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You can pay any amount up to the total due. Minimum payment: ₦1,000
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              <span>Loan ID: {loan.contract.id.substring(0, 8)}</span>
            </div>
            <div className="flex items-center text-sm text-primary">
              <Shield className="h-4 w-4 mr-1" />
              <span>Secure Payments</span>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {loan.repayments && loan.repayments.filter((r: any) => r.date_paid).length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {loan.repayments
                    .filter((r: any) => r.date_paid)
                    .sort((a: any, b: any) => new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime())
                    .map((repayment: any) => (
                      <div key={repayment.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-medium">{formatDate(repayment.date_paid)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Payment ID: {repayment.id.substring(0, 8)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatNaira(repayment.periodic_repayment_amount || 0)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">No payments yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your payment history will appear here once you've made payments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Purpose</span>
                  <span className="font-medium">{loan.contract.loan_application.purpose_category || "Farm Loan"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">
                    {loan.contract.status.charAt(0).toUpperCase() + loan.contract.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Loan Duration</span>
                  <span className="font-medium">{loan.contract.loan_application.loan_duration_days} days</span>
                </div>
                {loan.contract.loan_application.description && (
                  <div className="pt-2">
                    <span className="text-sm text-muted-foreground">Description</span>
                    <p className="text-sm mt-1">{loan.contract.loan_application.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Alert variant="default" className="bg-primary/10 border-primary/20 text-foreground">
            <Info className="h-4 w-4" />
            <AlertTitle>Payment Flexibility</AlertTitle>
            <AlertDescription>
              You can make payments of any amount at any time before the deadline. Pay in full or in parts - it's up to
              you!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
