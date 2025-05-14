"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaystackPaymentButton } from "@/components/dashboard/paystack-payment-button"

interface TopUpWalletDialogProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export function TopUpWalletDialog({ isOpen, onClose, userEmail }: TopUpWalletDialogProps) {
  const [amount, setAmount] = useState<number>(0)

  // Reset amount when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAmount(0)
    }
  }, [isOpen])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setAmount(isNaN(value) ? 0 : value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top Up Wallet</DialogTitle>
          <DialogDescription>Enter the amount you want to add to your wallet.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              min="100"
              step="100"
              value={amount || ""}
              onChange={handleAmountChange}
              placeholder="Enter amount"
            />
          </div>
          <div className="mt-4">
            <PaystackPaymentButton amount={amount} email={userEmail} onSuccess={onClose} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
