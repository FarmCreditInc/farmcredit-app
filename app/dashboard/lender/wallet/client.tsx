"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaystackPaymentButton } from "@/components/dashboard/paystack-payment-button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowDown, Wallet, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase-browser"

interface WalletClientProps {
  userId: string
  email: string
  initialWalletBalance: number
  initialBankAccounts: any[]
}

export function WalletClient({ userId, email, initialWalletBalance, initialBankAccounts }: WalletClientProps) {
  const [amount, setAmount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(initialWalletBalance)
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0)
  const [bankAccounts, setBankAccounts] = useState<any[]>(initialBankAccounts)
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>(
    initialBankAccounts.length > 0 ? initialBankAccounts[0].id : "",
  )
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const [emailValue, setEmail] = useState(email)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  // Get search params for payment status
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get("status")
  const paymentReference = searchParams.get("reference")
  const [showPaymentAlert, setShowPaymentAlert] = useState(!!paymentStatus)

  // Handle payment status notification
  useEffect(() => {
    if (paymentStatus) {
      // Refresh wallet balance after payment
      fetchWalletBalance()

      // Show toast based on payment status
      if (paymentStatus === "success") {
        toast({
          title: "Payment Successful",
          description: "Your wallet has been topped up successfully.",
          variant: "default",
        })
      } else if (paymentStatus === "failed") {
        toast({
          title: "Payment Failed",
          description: "Your payment was not successful. Please try again.",
          variant: "destructive",
        })
      } else if (paymentStatus === "error") {
        toast({
          title: "Payment Error",
          description: "There was an error processing your payment. Please contact support.",
          variant: "destructive",
        })
      }

      // Auto-hide the payment alert after 10 seconds
      const timer = setTimeout(() => {
        setShowPaymentAlert(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [paymentStatus, toast])

  useEffect(() => {
    if (initialBankAccounts.length > 0) {
      setSelectedBankAccount(initialBankAccounts[0].id)
    }
  }, [initialBankAccounts])

  const fetchWalletBalance = async () => {
    try {
      setIsLoading(true)
      const walletResponse = await fetch(`/api/lender/wallet?lenderId=${userId}`)
      if (!walletResponse.ok) {
        throw new Error("Failed to fetch wallet data")
      }

      const walletData = await walletResponse.json()
      setWalletBalance(walletData.balance || 0)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setAmount(isNaN(value) ? 0 : value)
  }

  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setWithdrawAmount(isNaN(value) ? 0 : value)
  }

  const handleWithdraw = async () => {
    // Reset any previous error details
    setErrorDetails(null)

    if (!userId || !selectedBankAccount || withdrawAmount <= 0) {
      toast({
        title: "Invalid withdrawal",
        description: "Please select a bank account and enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (withdrawAmount > walletBalance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)
    try {
      // Simple payload with just the essential data
      const payload = {
        amount: withdrawAmount,
        bankAccountId: selectedBankAccount,
      }

      console.log("Sending withdrawal request:", payload)

      const response = await fetch("/api/lender/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Withdrawal API error:", result)
        if (result.details) {
          setErrorDetails(result.details)
        }
        throw new Error(result.error || "Failed to process withdrawal")
      }

      console.log("Withdrawal successful:", result)

      // Update wallet balance with the returned new balance
      if (result.data && result.data.newBalance !== undefined) {
        setWalletBalance(result.data.newBalance)
      } else {
        // Fallback to refreshing the balance
        await fetchWalletBalance()
      }

      toast({
        title: "Withdrawal request submitted",
        description: `${formatCurrency(withdrawAmount)} has been submitted for processing. You'll be notified when it's complete.`,
        variant: "default",
      })

      // Reset withdrawal amount
      setWithdrawAmount(0)
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast({
        title: "Withdrawal failed",
        description: error instanceof Error ? error.message : "Failed to process your withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleTopUpSuccess = async (reference: string) => {
    // We don't need to do anything here anymore as the server will handle it
    // Just show a message that we're redirecting to process the payment
    toast({
      title: "Processing Payment",
      description: "Please wait while we process your payment...",
    })
  }

  const dismissPaymentAlert = () => {
    setShowPaymentAlert(false)

    // Remove the status and reference from the URL without refreshing the page
    const url = new URL(window.location.href)
    url.searchParams.delete("status")
    url.searchParams.delete("reference")
    window.history.replaceState({}, "", url.toString())
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Wallet Management</h1>

      {/* Payment Status Alert */}
      {showPaymentAlert && paymentStatus && (
        <Alert
          variant={paymentStatus === "success" ? "default" : "destructive"}
          className={`mb-6 ${paymentStatus === "success" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : ""}`}
        >
          {paymentStatus === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
          {paymentStatus === "failed" && <XCircle className="h-4 w-4" />}
          {paymentStatus === "error" && <AlertCircle className="h-4 w-4" />}

          <AlertTitle>
            {paymentStatus === "success" && "Payment Successful"}
            {paymentStatus === "failed" && "Payment Failed"}
            {paymentStatus === "error" && "Payment Error"}
          </AlertTitle>

          <AlertDescription className="flex justify-between items-center">
            <div>
              {paymentStatus === "success" && "Your wallet has been topped up successfully."}
              {paymentStatus === "failed" && "Your payment was not successful. Please try again."}
              {paymentStatus === "error" && "There was an error processing your payment. Please contact support."}

              {paymentReference && (
                <div className="mt-1 text-xs">
                  Reference: <code className="bg-muted px-1 py-0.5 rounded">{paymentReference}</code>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={dismissPaymentAlert}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Wallet Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Your current available balance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{formatCurrency(walletBalance)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Available for funding loans</p>
                </div>
                <Wallet className="h-12 w-12 text-primary opacity-80" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Up Card */}
        <Card>
          <CardHeader>
            <CardTitle>Top Up Your Wallet</CardTitle>
            <CardDescription>Add funds to your wallet to invest in farm projects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount in Naira"
                    min="100"
                    step="100"
                    value={amount || ""}
                    onChange={handleAmountChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    disabled={true}
                  />
                  <p className="text-xs text-muted-foreground">This email will be used for payment confirmation</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <PaystackPaymentButton
              amount={amount}
              email={emailValue}
              onSuccess={handleTopUpSuccess}
              disabled={isLoading || amount <= 0 || !emailValue}
            />
          </CardFooter>
        </Card>

        {/* Withdraw Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Transfer funds from your wallet to your bank account</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : bankAccounts.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No bank accounts found</AlertTitle>
                <AlertDescription>
                  You need to add a bank account before you can withdraw funds.
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="/dashboard/lender/bank-details">Add Bank Account</a>
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (₦)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Enter amount to withdraw"
                    min="100"
                    step="100"
                    value={withdrawAmount || ""}
                    onChange={handleWithdrawAmountChange}
                  />
                  <p className="text-xs text-muted-foreground">Minimum withdrawal: ₦100</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-account">Bank Account</Label>
                  <select
                    id="bank-account"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedBankAccount}
                    onChange={(e) => setSelectedBankAccount(e.target.value)}
                  >
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.bank_name} - {account.bank_account_number}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">Select the bank account for withdrawal</p>
                </div>
              </div>
            )}

            {errorDetails && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing required fields</AlertTitle>
                <AlertDescription>
                  <div className="text-sm">
                    {Object.entries(errorDetails).map(([key, value]) => (
                      <div key={key}>
                        {key}: {value === "✓" ? "Provided" : "Missing"}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleWithdraw}
              disabled={
                isWithdrawing ||
                isLoading ||
                withdrawAmount <= 0 ||
                withdrawAmount > walletBalance ||
                bankAccounts.length === 0
              }
              className="w-full sm:w-auto"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Transaction History Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your recent wallet activities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-center">
                <Button variant="outline" asChild>
                  <a href="/dashboard/lender/transactions">View Transaction History</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
