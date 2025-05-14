import { Suspense } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getSession } from "@/lib/auth-utils"
import { FarmsList } from "@/components/dashboard/farm/farms-list"
import { AddFarmDialog } from "@/components/dashboard/farm/add-farm-dialog"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FarmsPage({
  searchParams,
}: {
  searchParams: { page?: string; per_page?: string }
}) {
  const session = await getSession()

  if (!session || !session.id) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Error</h2>
        <p>Unable to retrieve your session. Please try signing in again.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/login/farmer">Sign In</Link>
        </Button>
      </div>
    )
  }

  // Parse pagination parameters
  const page = Number(searchParams.page) || 1
  const per_page = Number(searchParams.per_page) || 6

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Farms</h1>
          <p className="text-muted-foreground">Manage your farms and track production activities</p>
        </div>
        <AddFarmDialog />
      </div>

      <Suspense fallback={<FarmsListSkeleton />}>
        <FarmsList farmerId={session.id} page={page} perPage={per_page} />
      </Suspense>
    </div>
  )
}

function FarmsListSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <Skeleton className="h-32 sm:h-40 w-full rounded-md aspect-video" />
            <Skeleton className="h-5 sm:h-6 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-1/2" />
            <Skeleton className="h-3 sm:h-4 w-2/3" />
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-2">
              <Skeleton className="h-8 sm:h-9 w-full sm:w-24" />
              <Skeleton className="h-8 sm:h-9 w-full sm:w-24" />
            </div>
          </div>
        ))}
    </div>
  )
}
