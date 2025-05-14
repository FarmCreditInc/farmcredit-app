import { requireRole } from "@/lib/auth-utils"
import { LenderSupportPage } from "@/components/dashboard/lender-support-page"

export default async function SupportPage() {
  await requireRole(["lender"])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support & Help Center</h1>
        <p className="text-muted-foreground">Get help with your account, investments, and lending questions</p>
      </div>

      <LenderSupportPage />
    </div>
  )
}
