"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setStatus("error")
        setMessage("No payment reference provided")
        return
      }

      try {
        const response = await fetch(`/api/loan/verify-repayment?reference=${reference}`)
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage("Payment successful!")
          setDetails(data.data)
        } else {
          setStatus("error")
          setMessage(data.error || "Payment verification failed")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "An unknown error occurred")
      }
    }

    verifyPayment()
  }, [reference])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "loading" && "Verifying Payment..."}
            {status === "success" && "Payment Successful"}
            {status === "error" && "Payment Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Please wait while we verify your payment"}
            {status === "success" && "Your loan repayment has been processed"}
            {status === "error" && "There was a problem with your payment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {status === "loading" && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
          {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
          {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}

          <p className="text-center">{message}</p>

          {status === "success" && details && (
            <div className="w-full mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-medium">₦{Number(details.amount).toLocaleString()}</span>
              </div>
              {details.platformFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee:</span>
                  <span className="font-medium">₦{Number(details.platformFee).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lender Amount:</span>
                <span className="font-medium">₦{Number(details.lenderAmount).toLocaleString()}</span>
              </div>
              {details.loanClosed && (
                <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-md text-center">
                  Congratulations! This loan has been fully repaid.
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard/farmer/loan-history")} className="w-full">
            Return to Loan History
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
