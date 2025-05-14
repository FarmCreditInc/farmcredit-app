import { Suspense } from "react"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PendingFarmersTable from "@/components/dashboard/pending-farmers-table"
import { Skeleton } from "@/components/ui/skeleton"

// Mark this as a server action with "use server" directive
export const dynamic = "force-dynamic"

async function getFarmers(status?: string) {
  let query = supabaseAdmin.from("farmers").select("*")

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching farmers:", error)
    return []
  }

  return data || []
}

function FarmersPageSkeleton() {
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

export default async function AdminFarmersPage({ searchParams }: { searchParams: { status?: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Farmers</h1>
        <p className="text-muted-foreground">Manage farmer accounts and applications</p>
      </div>

      <Suspense fallback={<FarmersPageSkeleton />}>
        <FarmersPageContent status={searchParams.status} />
      </Suspense>
    </div>
  )
}

async function FarmersPageContent({ status }: { status?: string }) {
  // Get farmers based on status filter
  const farmers = await getFarmers(status)

  // Count farmers by status
  const pendingCount = farmers.filter((farmer) => farmer.status === "pending").length
  const approvedCount = farmers.filter((farmer) => farmer.status === "approved").length
  const rejectedCount = farmers.filter((farmer) => farmer.status === "rejected").length

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={!status ? "bg-muted/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">All Farmers</CardTitle>
            <div className="text-2xl font-bold">{farmers.length}</div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={status || "all"} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" asChild>
                  <a href="/dashboard/admin/farmers">All</a>
                </TabsTrigger>
                <TabsTrigger value="pending" asChild>
                  <a href="/dashboard/admin/farmers?status=pending">Pending</a>
                </TabsTrigger>
                <TabsTrigger value="approved" asChild>
                  <a href="/dashboard/admin/farmers?status=approved">Approved</a>
                </TabsTrigger>
                <TabsTrigger value="rejected" asChild>
                  <a href="/dashboard/admin/farmers?status=rejected">Rejected</a>
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
            <div className="text-xs text-muted-foreground">{pendingCount} farmers awaiting approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{approvedCount} active farmer accounts</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {status ? `${status.charAt(0).toUpperCase() + status.slice(1)} Farmers` : "All Farmers"}
          </CardTitle>
          <CardDescription>
            {status === "pending"
              ? "Farmers awaiting approval"
              : status === "approved"
                ? "Approved farmer accounts"
                : status === "rejected"
                  ? "Rejected farmer applications"
                  : "All registered farmers"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingFarmersTable farmers={farmers} />
        </CardContent>
      </Card>
    </>
  )
}
