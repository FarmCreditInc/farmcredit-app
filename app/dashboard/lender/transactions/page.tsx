import { requireRole } from "@/lib/auth-utils"
import { TransactionHistory } from "@/components/dashboard/transaction-history"

export default async function TransactionsPage() {
  await requireRole(["lender"])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">View and manage your wallet transactions</p>
      </div>

      <TransactionHistory />
    </div>
  )
}
