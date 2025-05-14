import { Suspense } from "react"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PendingLendersTable from "@/components/dashboard/pending-lenders-table"
import { Skeleton } from "@/components/ui/skeleton"

// Force dynamic rendering to avoid serialization issues during build
export const dynamic = "force-dynamic"

async function getLenders(status?: string) {
  let query = supabaseAdmin.from("lenders").select("*")

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching lenders:", error)
    return []
  }

  return data || []
}

function LendersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AdminLendersPage({ searchParams }: { searchParams: { status?: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lenders</h1>
        <p className="text-muted-foreground">Manage lender accounts and applications</p>
      </div>

      <Suspense fallback={<LendersPageSkeleton />}>
        <LendersPageContent status={searchParams.status} />
      </Suspense>
    </div>
  )
}

async function LendersPageContent({ status }: { status?: string }) {
  // Get lenders based on status filter
  const lenders = await getLenders(status)

  // Count lenders by status
  const pendingCount = lenders.filter((lender) => lender.status === "pending").length
  const approvedCount = lenders.filter((lender) => lender.status === "approved").length
  const rejectedCount = lenders.filter((lender) => lender.status === "rejected").length

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={!status ? "bg-muted/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">All Lenders</CardTitle>
            <div className="text-2xl font-bold">{lenders.length}</div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={status || "all"} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" asChild>
                  <a href="/dashboard/admin/lenders">All</a>
                </TabsTrigger>
                <TabsTrigger value="pending" asChild>
                  <a href="/dashboard/admin/lenders?status=pending">Pending</a>
                </TabsTrigger>
                <TabsTrigger value="approved" asChild>
                  <a href="/dashboard/admin/lenders?status=approved">Approved</a>
                </TabsTrigger>
                <TabsTrigger value="rejected" asChild>
                  <a href="/dashboard/admin/lenders?status=rejected">Rejected</a>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{pendingCount} lenders awaiting approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{approvedCount} active lender accounts</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {status ? `${status.charAt(0).toUpperCase() + status.slice(1)} Lenders` : "All Lenders"}
          </CardTitle>
          <CardDescription>
            {status === "pending"
              ? "Lenders awaiting approval"
              : status === "approved"
                ? "Approved lender accounts"
                : status === "rejected"
                  ? "Rejected lender applications"
                  : "All registered lenders"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingLendersTable lenders={lenders} />
        </CardContent>
      </Card>
    </>
  )
}
