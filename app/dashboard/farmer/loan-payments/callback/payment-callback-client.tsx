"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyPaystackRepayment } from "@/actions/repayment-actions"

export function PaymentCallbackClient({ paystackReference }: { paystackReference: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "retrying">("loading")
  const [message, setMessage] = useState("")
  const [isRetryable, setIsRetryable] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  const verifyPayment = async () => {
    if (!paystackReference) {
      setStatus("error")
      setMessage("No payment reference provided")
      return
    }

    try {
      setStatus("loading")
      console.log("Verifying payment with Paystack reference:", paystackReference)
      const result = await verifyPaystackRepayment(paystackReference)
      console.log("Verification result:", result)

      if (result.success) {
        setStatus("success")
        setMessage("Your payment has been processed successfully")
        setIsRetryable(false)
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to verify payment")
        setIsRetryable(result.isRetryable || false)
        console.error("Payment verification error details:", result.details)
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "An error occurred during payment verification")
      setIsRetryable(true)
    }
  }

  useEffect(() => {
    verifyPayment()
  }, [paystackReference])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setStatus("retrying")
    setTimeout(() => {
      verifyPayment()
    }, 2000) // Wait 2 seconds before retrying
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            {(status === "loading" || status === "retrying") && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === "error" && <XCircle className="h-16 w-16 text-destructive" />}
          </div>
          <CardTitle className="text-center text-2xl">
            {status === "loading" && "Processing Payment"}
            {status === "retrying" && "Retrying Verification"}
            {status === "success" && "Payment Successful"}
            {status === "error" && "Payment Verification Issue"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Please wait while we verify your payment..."}
            {status === "retrying" && "Attempting to verify your payment again..."}
            {status === "success" && "Thank you for your payment"}
            {status === "error" &&
              (isRetryable ? "We're having trouble confirming your payment" : "We couldn't process your payment")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status !== "loading" && <p className="text-center text-muted-foreground">{message}</p>}
          {status === "success" && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Reference: {paystackReference}</p>
              <p className="mt-2">A receipt has been sent to your email</p>
            </div>
          )}
          {status === "error" && isRetryable && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Reference: {paystackReference}</p>
              <p className="mt-2">Your payment might still be processing. You can try verifying again.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {status === "error" && isRetryable && retryCount < 3 && (
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Verify Again
            </Button>
          )}
          {(status === "success" || status === "error" || (isRetryable && retryCount >= 3)) && (
            <Button onClick={() => router.push("/dashboard/farmer/loan-payments")}>
              Return to Loans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
