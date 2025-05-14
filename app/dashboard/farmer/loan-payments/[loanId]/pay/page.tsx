import { notFound } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { PaymentFormClient } from "./payment-form-client"
import { getActiveLoansWithRepayments } from "@/actions/repayment-actions"
import { getSession } from "@/lib/auth-utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PayLoanPage({
  params,
  searchParams,
}: {
  params: { loanId: string }
  searchParams: { amount?: string }
}) {
  const { loanId } = params
  const initialAmount = searchParams.amount ? Number.parseFloat(searchParams.amount) : undefined

  // Get the farmer's session to access their email
  const session = await getSession()
  const farmerEmail = session?.email || ""

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
      <div className="container mx-auto px-4 py-6">
        <PageHeader heading="Make a Payment" subheading="Pay any amount towards your loan" />

        <PaymentFormClient loan={loan} initialAmount={initialAmount} farmerEmail={farmerEmail} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching loan details:", error)
    notFound()
  }
}
