import { requireRole } from "@/lib/auth-utils"
import { LenderWithdrawalsPage } from "@/components/dashboard/lender-withdrawals-page"

export default async function WithdrawalsPage() {
  await requireRole(["lender"])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdrawal History</h1>
        <p className="text-muted-foreground">View all your withdrawal requests and their current status.</p>
      </div>

      <LenderWithdrawalsPage />
    </div>
  )
}
