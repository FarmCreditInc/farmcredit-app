import { Suspense } from "react"
import { LenderWalletCallback } from "@/components/dashboard/lender-wallet-callback"
import { LoadingPane } from "@/components/loading-pane"

export default function WalletCallbackPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Payment Verification</h1>
      <Suspense fallback={<LoadingPane message="Verifying your payment..." />}>
        <LenderWalletCallback />
      </Suspense>
    </div>
  )
}
