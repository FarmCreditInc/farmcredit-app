"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Lock, Shield, Loader2, Info } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"

const formatNaira = (amount: number) => {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Calculate platform fee based on the tiered structure
function calculatePlatformFee(amount: number): number {
  if (amount <= 20000) return 100
  if (amount <= 50000) return 200
  if (amount <= 100000) return 500
  if (amount <= 200000) return 1000
  return 1500
}

export function PaymentFormClient({ loan, initialAmount }: { loan: any; initialAmount?: number }) {
  const router = useRouter()
  const [amount, setAmount] = useState(initialAmount?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [platformFee, setPlatformFee] = useState(0)

  useEffect(() => {
    if (loan.contract.loan_application.farmer_email) {
      setEmail(loan.contract.loan_application.farmer_email)
    }
  }, [loan])

  // Update platform fee when amount changes
  useEffect(() => {
    const numAmount = Number.parseFloat(amount) || 0
    const penalty = calculatePenalty()
    const totalAmount = numAmount + penalty
    setPlatformFee(calculatePlatformFee(totalAmount))
  }, [amount])

  // Calculate deadline based on loan creation date + loan_duration_days
  const calculateDeadline = () => {
    const createdAt = new Date(loan.contract.created_at)
    const durationDays = loan.contract.loan_application.loan_duration_days || 30
    const deadline = new Date(createdAt)
    deadline.setDate(deadline.getDate() + durationDays)
    return deadline
  }

  // Add a function to get the total amount due
  const getTotalDue = () => {
    return loan.contract.loan_application.estimated_total_repayment || loan.remainingAmount
  }

  const deadline = calculateDeadline()
  const isExpired = new Date() > deadline

  // Calculate penalty if past deadline
  const calculatePenalty = () => {
    if (!isExpired) return 0

    const now = new Date()
    const daysLate = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))
    const penaltyRate = 0.001 // 0.1% per day
    return loan.remainingAmount * penaltyRate * daysLate
  }

  const penalty = calculatePenalty()
  const totalDue = getTotalDue()

  // Validate amount
  const validateAmount = () => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return "Please enter a valid amount"
    }

    if (numAmount < 1000) {
      return "Minimum payment amount is ₦1,000"
    }

    if (numAmount > loan.remainingAmount + penalty) {
      return "Amount cannot exceed the total due"
    }

    return null
  }

  const amountError = validateAmount()
  const numAmount = Number.parseFloat(amount) || 0
  const totalPaymentAmount = numAmount + penalty + platformFee

  // Handle payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (amountError) {
      toast.error(amountError)
      return
    }

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    try {
      setIsLoading(true)

      // Create form data
      const formData = new FormData()
      formData.append("contractId", loan.contract.id)
      formData.append("amount", amount)
      formData.append("penalty", penalty.toString())
      formData.append("email", email)

      // Get the current origin for callback URL
      const origin = window.location.origin
      formData.append("callbackUrl", `${origin}/dashboard/farmer/loan-payments/callback`)

      // Initialize payment
      const response = await fetch("/api/loan/initialize-repayment", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Redirect to Paystack checkout
      if (data.data?.authorizationUrl) {
        window.location.href = data.data.authorizationUrl
      } else {
        throw new Error("No authorization URL returned")
      }
    } catch (error) {
      console.error("Payment initialization error:", error)
      toast.error(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter your payment information</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      ₦
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      className="pl-9"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  {amountError && <p className="text-sm text-destructive mt-1">{amountError}</p>}
                  <p className="text-xs text-muted-foreground">
                    You can pay any amount up to the total due. Minimum payment: ₦1,000
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} readOnly className="bg-muted/30" />
                  <p className="text-xs text-muted-foreground">Your payment receipt will be sent to this email</p>
                </div>
              </div>

              <Alert variant="default" className="bg-primary/10 border-primary/20 text-foreground">
                <Info className="h-4 w-4" />
                <AlertTitle>Secure Payment</AlertTitle>
                <AlertDescription>
                  Your payment information is securely processed by Paystack. We do not store your card details.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !!amountError}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Proceed to Pay {totalPaymentAmount > 0 ? formatNaira(totalPaymentAmount) : ""}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Loan Purpose</span>
                <span className="font-medium">{loan.contract.loan_application.purpose_category || "Farm Loan"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lender</span>
                <span className="font-medium">{loan.contract.lender.organization_name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Deadline</span>
                <span className={`font-medium ${isExpired ? "text-destructive" : ""}`}>{formatDate(deadline)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remaining Balance</span>
                <span className="font-medium">{formatNaira(loan.remainingAmount)}</span>
              </div>

              {isExpired && penalty > 0 && (
                <div className="flex justify-between items-center text-destructive">
                  <span className="text-sm flex items-center">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    Late Payment Penalty
                  </span>
                  <span className="font-medium">{formatNaira(penalty)}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-bold pt-2">
                <span>Total Due</span>
                <span>{formatNaira(loan.remainingAmount + penalty)}</span>
              </div>

              {amount && !amountError && (
                <>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-medium">Amount to Pay</span>
                    <span className="font-medium">{formatNaira(Number.parseFloat(amount))}</span>
                  </div>

                  {penalty > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Penalty</span>
                      <span className="font-medium">{formatNaira(penalty)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Platform Fee</span>
                    <span className="font-medium">{formatNaira(platformFee)}</span>
                  </div>

                  <div className="flex justify-between items-center text-primary pt-1">
                    <span className="font-bold">Total Payment</span>
                    <span className="font-bold">{formatNaira(totalPaymentAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-muted/20 border-t flex justify-center items-center py-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-1 text-primary" />
              <span>Secured by Paystack</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
