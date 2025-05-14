import { Suspense } from "react"
import Link from "next/link"
import { CreditCard, Download, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/auth-utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dynamic = "force-dynamic"

export default async function BankTransactionsPage() {
  // Use requireAuth to ensure the user is authenticated
  const session = await requireAuth("/auth/login/farmer")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/farmer/bank-details">Manage Bank Details</Link>
        </Button>
      </div>

      <Suspense fallback={<TransactionHistorySkeleton />}>
        <TransactionHistoryPanel userId={session.id} />
      </Suspense>
    </div>
  )
}

async function TransactionHistoryPanel({ userId }: { userId: string }) {
  const supabase = createClient()

  console.log("Fetching transaction history for user ID:", userId)

  // Fetch transaction history
  const { data: transactions, error: transactionError } = await supabase
    .from("transaction_history")
    .select("*")
    .eq("farmer_id", userId)
    .order("created_at", { ascending: false })

  if (transactionError) {
    console.error("Error fetching transaction history:", transactionError)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            <p>Error loading transaction history: {transactionError.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center border rounded-md">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
            <p className="text-muted-foreground">
              You don't have any recorded transactions yet. Transactions will appear here once you receive or make
              payments.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent financial transactions</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              // Parse the transaction data from JSONB
              const data = transaction.transaction_data || {}
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{data.description || "Transaction"}</TableCell>
                  <TableCell>₦{(data.amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        data.status === "completed" ? "default" : data.status === "pending" ? "outline" : "destructive"
                      }
                    >
                      {data.status || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/farmer/bank-transactions/${transaction.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </p>
      </CardFooter>
    </Card>
  )
}

function TransactionHistorySkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent financial transactions</CardDescription>
        </div>
        <Skeleton className="h-9 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
