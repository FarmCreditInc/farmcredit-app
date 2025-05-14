import { Suspense } from "react"
import { Loader } from "lucide-react"
import { LoanPaymentsClient } from "./loan-payments-client"
import { PageHeader } from "@/components/ui/page-header"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function LoanPaymentsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <PageHeader heading="Loan Payments" subheading="Manage your active loans and make repayments" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading your loan payments...</span>
          </div>
        }
      >
        <LoanPaymentsClient />
      </Suspense>
    </div>
  )
}
