"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { calculateCreditScore } from "@/actions/credit-score-actions"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface CalculateCreditScoreButtonProps {
  farmerId: string
}

export function CalculateCreditScoreButton({ farmerId }: CalculateCreditScoreButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    creditScore?: number
    creditRating?: string
  }>({})

  const handleCalculate = async () => {
    setIsOpen(true)
    setIsCalculating(true)
    setResult({})

    try {
      const response = await calculateCreditScore(farmerId)
      setResult(response)
    } catch (error) {
      console.error("Error calculating credit score:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <>
      <Button onClick={handleCalculate} variant="outline" className="flex items-center gap-2">
        <span>Calculate Credit Score</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Credit Score Calculation</DialogTitle>
            <DialogDescription>
              {isCalculating
                ? "Calculating your credit score..."
                : result.success
                  ? "Credit score calculated successfully!"
                  : "There was an issue calculating your credit score."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4">
            {isCalculating ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Calculating credit score, please wait...</p>
              </div>
            ) : result.success ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-lg font-semibold">Your credit score: {result.creditScore}</p>
                  <p className="text-sm text-muted-foreground">Rating: {result.creditRating}</p>
                </div>
                <p className="text-sm">{result.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Your dashboard will update to reflect the new score.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p>{result.message || "Failed to calculate credit score"}</p>
                <Button onClick={handleCalculate} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
