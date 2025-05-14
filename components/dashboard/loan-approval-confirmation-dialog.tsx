"use client"

import { useState } from "react"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"

interface LoanApprovalConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (platformFee: number) => Promise<void>
  loanApplication: any
  walletBalance: number
}

export function LoanApprovalConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  loanApplication,
  walletBalance,
}: LoanApprovalConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate platform fee based on the tier
  const calculatePlatformFee = (amount: number): number => {
    if (amount <= 20000) return 100
    if (amount <= 50000) return 200
    if (amount <= 100000) return 500
    if (amount <= 200000) return 1000
    return 1500
  }

  const loanAmount = loanApplication?.amount_requested || 0
  const platformFee = calculatePlatformFee(loanAmount)
  const totalDebit = loanAmount + platformFee

  const insufficientFunds = walletBalance < totalDebit

  const handleConfirm = async () => {
    if (!termsAccepted) {
      setError("You must accept the terms and conditions to proceed")
      return
    }

    if (insufficientFunds) {
      setError("Insufficient funds in your wallet. Please top up your wallet before approving this loan.")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onConfirm(platformFee)
    } catch (error) {
      console.error("Error in loan approval:", error)
      setError(error instanceof Error ? error.message : "An error occurred during approval")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Loan Approval</DialogTitle>
          <DialogDescription>Please review the details below before approving this loan application.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Loan Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(loanAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Platform Fee</p>
              <p className="text-lg font-semibold">{formatCurrency(platformFee)}</p>
              <p className="text-xs text-muted-foreground">Based on loan amount tier</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Debit</p>
            <p className="text-xl font-bold">{formatCurrency(totalDebit)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Current Wallet Balance</p>
            <p className={`text-lg font-semibold ${insufficientFunds ? "text-red-500" : "text-green-500"}`}>
              {formatCurrency(walletBalance)}
            </p>
            {insufficientFunds && (
              <p className="text-sm text-red-500">Insufficient funds. Please top up your wallet before proceeding.</p>
            )}
          </div>

          <div className="flex items-start space-x-2 pt-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the platform terms and conditions
              </Label>
              <p className="text-sm text-muted-foreground">
                By approving this loan, you agree to the platform&apos;s terms of service and fee structure.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || !termsAccepted || insufficientFunds}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Loan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
