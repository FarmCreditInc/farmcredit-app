"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Wallet, ArrowUpRight, Lock } from "lucide-react"
import { withdrawFunds } from "@/actions/lender-actions"
import { useToast } from "@/hooks/use-toast"
import { TopUpWalletButton } from "./top-up-wallet-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface WalletCardProps {
  wallet: {
    id: string
    balance: number
    locked_balance: number
  } | null
  userEmail: string
}

export function WalletCard({ wallet, userEmail }: WalletCardProps) {
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsWithdrawLoading(true)
    try {
      const amount = Number.parseFloat(withdrawAmount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount greater than 0",
          variant: "destructive",
        })
        return
      }

      if (!bankName || !accountNumber || !accountName) {
        toast({
          title: "Missing details",
          description: "Please fill in all bank details",
          variant: "destructive",
        })
        return
      }

      if (wallet && amount > wallet.balance) {
        toast({
          title: "Insufficient funds",
          description: "Withdrawal amount exceeds available balance",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append("amount", amount.toString())
      formData.append("bankName", bankName)
      formData.append("accountNumber", accountNumber)
      formData.append("accountName", accountName)

      const result = await withdrawFunds(formData)

      if (result.success) {
        toast({
          title: "Withdrawal initiated",
          description: "Your withdrawal request has been submitted",
        })
        setIsWithdrawDialogOpen(false)
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to process withdrawal")
      }
    } catch (error) {
      console.error("Withdraw error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Manage your funds</CardDescription>
          </div>
          <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full flex-shrink-0">
                <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                {" "}
                {/* Use min-width: 0 and flex-1 to allow proper truncation */}
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p
                  className="font-bold truncate"
                  style={{
                    fontSize:
                      wallet?.balance && wallet.balance >= 1000000000
                        ? "1.25rem"
                        : wallet?.balance && wallet.balance >= 10000000
                          ? "1.375rem"
                          : "1.5rem",
                  }}
                  title={formatCurrency(wallet?.balance || 0)}
                >
                  {formatCurrency(wallet?.balance || 0)}
                </p>
              </div>
            </div>
            <TopUpWalletButton userEmail={userEmail} className="w-full" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full flex-shrink-0">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                {" "}
                {/* Use min-width: 0 and flex-1 to allow proper truncation */}
                <p className="text-sm text-muted-foreground">Locked Balance</p>
                <p
                  className="font-bold truncate"
                  style={{
                    fontSize:
                      wallet?.locked_balance && wallet.locked_balance >= 1000000000
                        ? "1.25rem"
                        : wallet?.locked_balance && wallet.locked_balance >= 10000000
                          ? "1.375rem"
                          : "1.5rem",
                  }}
                  title={formatCurrency(wallet?.locked_balance || 0)}
                >
                  {formatCurrency(wallet?.locked_balance || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Funds reserved for approved loans</p>
              </div>
            </div>
            <Button onClick={() => setIsWithdrawDialogOpen(true)} variant="outline" className="w-full">
              Withdraw Funds
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t flex justify-between items-center py-3">
        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleString()}</p>
        <Button variant="ghost" size="sm" onClick={() => router.refresh()}>
          Refresh
        </Button>
      </CardFooter>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] w-full">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>Enter the amount and bank details for withdrawal.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdraw}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="withdraw-amount" className="text-right hidden sm:block">
                  Amount
                </Label>
                <Label htmlFor="withdraw-amount" className="sm:hidden">
                  Amount
                </Label>
                <div className="col-span-4 sm:col-span-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">₦</span>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="pl-8"
                    placeholder="0.00"
                    min="100"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bank-name" className="text-right hidden sm:block">
                  Bank
                </Label>
                <Label htmlFor="bank-name" className="sm:hidden">
                  Bank
                </Label>
                <Input
                  id="bank-name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="col-span-4 sm:col-span-3"
                  placeholder="Bank Name"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account-number" className="text-right hidden sm:block">
                  Account No.
                </Label>
                <Label htmlFor="account-number" className="sm:hidden">
                  Account No.
                </Label>
                <Input
                  id="account-number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="col-span-4 sm:col-span-3"
                  placeholder="Account Number"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account-name" className="text-right hidden sm:block">
                  Account Name
                </Label>
                <Label htmlFor="account-name" className="sm:hidden">
                  Account Name
                </Label>
                <Input
                  id="account-name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="col-span-4 sm:col-span-3"
                  placeholder="Account Name"
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWithdrawDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isWithdrawLoading} className="w-full sm:w-auto">
                {isWithdrawLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Withdraw
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
