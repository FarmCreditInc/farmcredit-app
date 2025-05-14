import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getFarmerLoans } from "@/actions/farmer-actions"
import { formatCurrency } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default function LoansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Applications</h1>
          <p className="text-muted-foreground">Apply for loans and track your applications</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/farmer/loan-application">Apply for a Loan</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>View and manage your loan applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
            <Suspense fallback={<LoanApplicationsSkeleton />}>
              <LoanApplications />
            </Suspense>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

async function LoanApplications() {
  const loansResponse = await getFarmerLoans()

  // Ensure loans is an array
  const loans = Array.isArray(loansResponse.data)
    ? loansResponse.data.filter((loan) => loan.status === "pending" || loan.status === "approved")
    : []

  if (loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <ArrowRight className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No loan applications yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Apply for your first loan to get started</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/farmer/loan-application">Apply Now</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <div key={loan.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{loan.purpose_category || "Loan Application"}</h3>
                <LoanStatusBadge status={loan.status} />
              </div>
              <p className="text-sm text-muted-foreground">Amount: {formatCurrency(loan.amount_requested || 0)}</p>
              <p className="text-sm text-muted-foreground">
                Duration: {loan.loan_duration_days ? `${loan.loan_duration_days} days` : "Not specified"}
              </p>
              <p className="text-sm text-muted-foreground">
                Applied on: {loan.created_at ? new Date(loan.created_at).toLocaleDateString() : "Unknown date"}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/farmer/loan-history/${loan.id}`}>View Details</Link>
            </Button>
          </div>
          {loan.rejection_reason && (
            <div className="mt-2 rounded-md bg-red-50 p-2 text-sm">
              <p className="font-medium">Rejection Reason:</p>
              <p>{loan.rejection_reason}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function LoanStatusBadge({ status }: { status: string }) {
  const statusText = status?.toLowerCase() || "unknown"

  switch (statusText) {
    case "pending":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-yellow-200 bg-yellow-50 text-yellow-600">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-green-200 bg-green-50 text-green-600">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-red-200 bg-red-50 text-red-600">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>
  }
}

function LoanApplicationsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="mt-2 h-4 w-32" />
              <Skeleton className="mt-1 h-4 w-24" />
              <Skeleton className="mt-1 h-4 w-36" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
