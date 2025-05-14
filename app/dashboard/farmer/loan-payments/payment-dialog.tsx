"use client"

import { useState } from "react"
import { AlertCircle, Calendar, CreditCard, Loader2, LockIcon, Shield } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "react-hot-toast"

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  loan: any
  repayment: any
}

export function PaymentDialog({ isOpen, onClose, loan, repayment }: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "success">("details")

  const isOverdue = new Date(repayment.due_date) < new Date()
  const totalAmount = (repayment.periodic_repayment_amount || 0) + (repayment.penalty || 0)

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      setPaymentStep("processing")

      // Create form data for the payment
      const formData = new FormData()
      formData.append("contractId", loan.contract.id)
      formData.append("repaymentId", repayment.id)
      formData.append("amount", repayment.periodic_repayment_amount?.toString() || "0")
      formData.append("penalty", repayment.penalty?.toString() || "0")
      formData.append("email", loan.contract.lender.email)

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
      setPaymentStep("details")
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {paymentStep === "details" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Loan Repayment
              </DialogTitle>
              <DialogDescription>Make a payment towards your loan</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Loan Purpose</span>
                  <span className="font-medium">{loan.contract.loan_application.purpose_category || "Farm Loan"}</span>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Lender</span>
                  <span className="font-medium">{loan.contract.lender.organization_name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span className="font-medium">{formatDate(repayment.due_date)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Repayment Amount</span>
                  <span className="font-semibold">{formatCurrency(repayment.periodic_repayment_amount || 0)}</span>
                </div>

                {isOverdue && repayment.penalty > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      Late Payment Penalty
                    </span>
                    <span className="font-semibold">{formatCurrency(repayment.penalty)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Payment</span>
                  <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {isOverdue && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This payment is overdue. A penalty of {formatCurrency(repayment.penalty || 0)} has been added.
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center text-green-700 text-sm">
                <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Your payment will be securely processed via Paystack</span>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing} className="sm:flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <LockIcon className="mr-2 h-4 w-4" />
                    Pay {formatCurrency(totalAmount)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {paymentStep === "processing" && (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Your Payment</h3>
            <p className="text-center text-muted-foreground mb-4">
              Please wait while we redirect you to our secure payment gateway.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <LockIcon className="h-3.5 w-3.5" />
              <span>Secure transaction</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
