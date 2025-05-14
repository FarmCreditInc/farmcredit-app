"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LoadingPane } from "@/components/loading-pane"

interface PaystackPaymentButtonProps {
  amount: number
  email: string
  onSuccess?: () => void
  onError?: (error: string) => void
  disabled?: boolean
}

export function PaystackPaymentButton({
  amount,
  email,
  onSuccess,
  onError,
  disabled = false,
}: PaystackPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // Validate amount
      if (!amount || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount greater than zero.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      console.log("Initializing payment for amount:", amount, "NGN")

      // Initialize payment with Paystack
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount, // Amount in Naira
          email,
          callbackUrl: `${window.location.origin}/dashboard/lender/wallet/callback`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Payment initialization failed:", errorData)
        toast({
          title: "Payment initialization failed",
          description: errorData.error || "Could not initialize payment. Please try again.",
          variant: "destructive",
        })
        if (onError) onError(errorData.error || "Payment initialization failed")
        setIsLoading(false)
        return
      }

      const data = await response.json()
      console.log("Payment initialized successfully:", data)

      // Redirect to Paystack checkout
      if (data.authorization_url) {
        console.log("Redirecting to Paystack checkout:", data.authorization_url)
        window.location.href = data.authorization_url
      } else {
        console.error("No authorization URL returned from Paystack")
        toast({
          title: "Payment initialization failed",
          description: "Could not get payment authorization URL. Please try again.",
          variant: "destructive",
        })
        if (onError) onError("No authorization URL returned")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      if (onError) onError(error instanceof Error ? error.message : "An unknown error occurred")
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingPane message="Initializing payment..." />
  }

  return (
    <Button onClick={handlePayment} className="w-full" disabled={disabled || amount <= 0}>
      Pay ₦{amount.toLocaleString()}
    </Button>
  )
}

export default PaystackPaymentButton
