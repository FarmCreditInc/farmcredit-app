import { Suspense } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { ApprovedLoansClient } from "./approved-loans-client"
import { requireRole } from "@/lib/auth-utils"
import { Loader } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ApprovedLoansPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  await requireRole(["lender"])

  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <PageHeader heading="Approved Loans" subheading="Manage and track all your approved loans" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading approved loans...</span>
          </div>
        }
      >
        <ApprovedLoansClient initialPage={page} />
      </Suspense>
    </div>
  )
}
