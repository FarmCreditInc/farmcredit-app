import { Suspense } from "react"
import { Loader } from "lucide-react"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { LoanDetailsClient } from "./loan-details-client"
import { getActiveLoansWithRepayments } from "@/actions/repayment-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LoanDetailsPage({ params }: { params: { loanId: string } }) {
  const { loanId } = params

  try {
    const response = await getActiveLoansWithRepayments()

    if (!response.success || !response.data) {
      notFound()
    }

    const loan = response.data.find((loan) => loan.contract.id === loanId)

    if (!loan) {
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-6 space-y-8">
        <PageHeader
          heading="Loan Details"
          subheading={`${loan.contract.loan_application.purpose_category || "Farm Loan"} - ${loan.contract.lender.organization_name}`}
        />

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading loan details...</span>
            </div>
          }
        >
          <LoanDetailsClient loan={loan} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error fetching loan details:", error)
    notFound()
  }
}
