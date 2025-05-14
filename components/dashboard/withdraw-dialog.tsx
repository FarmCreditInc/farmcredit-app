"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { withdrawFunds } from "@/actions/lender-actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { WithdrawalStatusTracker } from "@/components/dashboard/withdrawal-status-tracker"

interface WithdrawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function WithdrawDialog({ open, onOpenChange, onSuccess }: WithdrawDialogProps) {
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("amount", amount)
      formData.append("bankName", bankName)
      formData.append("accountNumber", accountNumber)
      formData.append("accountName", accountName)

      const result = await withdrawFunds(formData)

      if (result.success) {
        toast({
          title: "Withdrawal Initiated",
          description: "Your withdrawal request has been submitted and is being processed.",
        })

        // Store the withdrawal ID for tracking
        if (result.data?.withdrawalId) {
          setWithdrawalId(result.data.withdrawalId)
        }

        // Reset form fields but don't close dialog yet
        setAmount("")
        setBankName("")
        setAccountNumber("")
        setAccountName("")

        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "Withdrawal Failed",
          description: result.error || "Failed to process withdrawal",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setWithdrawalId(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>Enter the amount you want to withdraw and your bank details.</DialogDescription>
        </DialogHeader>

        {withdrawalId ? (
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">
                Your withdrawal request has been submitted successfully. You can track its status below.
              </p>
            </div>
            <WithdrawalStatusTracker withdrawalId={withdrawalId} />
            <p className="text-sm text-muted-foreground">
              For demonstration purposes, your withdrawal will be processed automatically within 1 minute.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (NGN)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bank">Bank Name</Label>
                <Select value={bankName} onValueChange={setBankName} required>
                  <SelectTrigger id="bank">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Access Bank">Access Bank</SelectItem>
                    <SelectItem value="First Bank">First Bank</SelectItem>
                    <SelectItem value="GTBank">GTBank</SelectItem>
                    <SelectItem value="UBA">UBA</SelectItem>
                    <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter account name"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Withdraw"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
