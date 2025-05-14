"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyAndProcessPayment } from "@/actions/payment-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function LenderWalletCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [result, setResult] = useState<any>(null)

  const reference = searchParams.get("reference") || searchParams.get("trxref")
  const status = searchParams.get("status")

  useEffect(() => {
    async function processPayment() {
      if (!reference) {
        setResult({
          success: false,
          error: "No payment reference provided",
        })
        setIsProcessing(false)
        return
      }

      try {
        const paymentResult = await verifyAndProcessPayment(reference)
        setResult(paymentResult)
      } catch (error) {
        console.error("Error processing payment:", error)
        setResult({
          success: false,
          error: "Failed to process payment",
        })
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [reference])

  const handleReturn = () => {
    router.push("/dashboard/lender/wallet")
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{result?.success ? "Payment Successful" : "Payment Failed"}</CardTitle>
        <CardDescription>
          {result?.success ? "Your wallet has been topped up successfully" : "There was an issue with your payment"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert
          variant={result?.success ? "default" : "destructive"}
          className={result?.success ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : ""}
        >
          {result?.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result?.success ? "Transaction Completed" : "Transaction Failed"}</AlertTitle>
          <AlertDescription>
            {result?.success ? (
              result?.alreadyProcessed ? (
                "This payment has already been processed and added to your wallet."
              ) : (
                <>
                  Your wallet has been credited with {result?.data?.amount && formatCurrency(result.data.amount)}.
                  <div className="mt-2">
                    <strong>New Balance:</strong> {result?.data?.newBalance && formatCurrency(result.data.newBalance)}
                  </div>
                  <div className="mt-1">
                    <strong>Transaction ID:</strong> {result?.data?.transactionId}
                  </div>
                </>
              )
            ) : (
              <>
                {result?.error}
                {result?.details && (
                  <div className="mt-2 text-xs">
                    <strong>Details:</strong>{" "}
                    {typeof result.details === "string" ? result.details : JSON.stringify(result.details)}
                  </div>
                )}
              </>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={handleReturn} className="w-full">
          Return to Wallet
        </Button>
      </CardFooter>
    </Card>
  )
}
