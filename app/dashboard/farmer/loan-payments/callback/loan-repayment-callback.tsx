"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { processPaystackPayment } from "@/actions/repayment-actions"

export function LoanRepaymentCallback({ reference }: { reference: string }) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [paystackData, setPaystackData] = useState<any>(null)
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function verifyAndProcessPayment() {
      if (!reference) {
        setError("No payment reference provided")
        setIsProcessing(false)
        return
      }

      try {
        console.log("Verifying and processing payment with reference:", reference)

        // Call our server action to verify with Paystack and process the payment
        const result = await processPaystackPayment(reference)
        console.log("Payment processing result:", result)

        if (result.success) {
          setPaystackData(result.paystackData)
          setProcessingResult(result)
        } else {
          setError(result.error || "Payment processing failed")
          setPaystackData(result.paystackData || null)
        }
      } catch (error) {
        console.error("Error processing payment:", error)
        setError("Failed to process payment")
      } finally {
        setIsProcessing(false)
      }
    }

    verifyAndProcessPayment()
  }, [reference])

  const handleReturn = () => {
    router.push("/dashboard/farmer/loan-payments")
  }

  if (isProcessing) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Processing Payment</CardTitle>
          <CardDescription>Please wait while we verify your payment...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const isSuccess = processingResult?.success && !error

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSuccess ? "Payment Successful" : "Payment Failed"}</CardTitle>
        <CardDescription>
          {isSuccess ? "Your loan repayment has been processed successfully" : "There was an issue with your payment"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert
          variant={isSuccess ? "default" : "destructive"}
          className={isSuccess ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : ""}
        >
          {isSuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{isSuccess ? "Transaction Completed" : "Transaction Failed"}</AlertTitle>
          <AlertDescription>
            {isSuccess ? (
              <>
                Your loan repayment has been processed successfully.
                <div className="mt-2">
                  <strong>Reference:</strong> {reference}
                </div>
                {paystackData?.amount && (
                  <div className="mt-1">
                    <strong>Amount:</strong> ₦{(paystackData.amount / 100).toLocaleString()}
                  </div>
                )}
                {processingResult?.data && (
                  <div className="mt-1">
                    <strong>Loan Contract:</strong> {processingResult.data.contractId}
                  </div>
                )}
              </>
            ) : (
              <>
                {error || "An unknown error occurred"}
                {paystackData && (
                  <div className="mt-2 text-xs">
                    <strong>Paystack Status:</strong> {paystackData.status}
                    {paystackData.gateway_response && (
                      <div>
                        <strong>Gateway Response:</strong> {paystackData.gateway_response}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={handleReturn} className="w-full">
          Return to Loan Payments
        </Button>
      </CardFooter>
    </Card>
  )
}
