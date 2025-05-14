import { requireRole } from "@/lib/auth-utils"
import { LenderBankDetailsPage } from "@/components/dashboard/lender-bank-details-page"

export default async function BankDetailsPage() {
  // Verify user is authenticated and has lender role
  const session = await requireRole(["lender"])

  return <LenderBankDetailsPage userId={session.id} />
}
