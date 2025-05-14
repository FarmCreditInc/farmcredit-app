"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoanRepaymentButtonProps {
  contractId: string
  repaymentId: string
  amount: number
  penalty: number
  email: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function LoanRepaymentButton({
  contractId,
  repaymentId,
  amount,
  penalty,
  email,
  onSuccess,
  onError,
}: LoanRepaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    try {
      setIsLoading(true)

      // Create form data
      const formData = new FormData()
      formData.append("contractId", contractId)
      formData.append("repaymentId", repaymentId)
      formData.append("amount", amount.toString())
      formData.append("penalty", penalty.toString())
      formData.append("email", email)

      // Get the current origin for callback URL
      const origin = window.location.origin
      formData.append("callbackUrl", `${origin}/dashboard/farmer/loan-history/callback`)

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
        onSuccess?.()
        window.location.href = data.data.authorizationUrl
      } else {
        throw new Error("No authorization URL returned")
      }
    } catch (error) {
      console.error("Payment initialization error:", error)
      onError?.(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} className="sm:flex-1 bg-primary hover:bg-primary/90">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay Now
        </>
      )}
    </Button>
  )
}
