import { Suspense } from "react"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { LoanDetailsClient } from "./loan-details-client"
import { requireRole } from "@/lib/auth-utils"
import { getLoanDetails } from "@/actions/approved-loans-actions"
import { Loader } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LoanDetailsPage({ params }: { params: { id: string } }) {
  await requireRole(["lender"])

  const { id } = params

  try {
    const response = await getLoanDetails(id)

    if (!response.success || !response.data) {
      console.error("Failed to get loan details:", response.error)
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-6 space-y-8">
        <PageHeader
          heading="Loan Details"
          subheading={`${response.data.loan.loan_application.purpose_category || "Farm Loan"} - ${response.data.loan.loan_application.farmer.full_name}`}
        />

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading loan details...</span>
            </div>
          }
        >
          <LoanDetailsClient loanData={response.data} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error fetching loan details:", error)
    notFound()
  }
}
