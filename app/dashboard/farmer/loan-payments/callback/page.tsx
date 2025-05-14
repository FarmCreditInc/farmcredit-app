import { LoanRepaymentCallback } from "./loan-repayment-callback"

export default function CallbackPage({
  searchParams,
}: {
  searchParams: { reference?: string; trxref?: string }
}) {
  // Use either reference or trxref, whichever is provided by Paystack
  const reference = searchParams.reference || searchParams.trxref || ""

  return (
    <div className="container mx-auto py-10">
      <LoanRepaymentCallback reference={reference} />
    </div>
  )
}
