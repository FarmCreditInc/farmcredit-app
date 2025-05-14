import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth-utils"
import { NotificationsClient } from "@/components/dashboard/notifications-client"
import { LoadingPane } from "@/components/loading-pane"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function NotificationsPage() {
  const session = await getSession()

  if (!session) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Error</h2>
        <p>Unable to retrieve your session. Please try signing in again.</p>
        <Button asChild className="mt-4">
          <a href="/auth/login/farmer">Sign In</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">View and manage your notifications</p>
        </div>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <a href="/dashboard/farmer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </a>
        </Button>
      </div>

      <Suspense fallback={<LoadingPane message="Loading notifications..." />}>
        <NotificationsClient userId={session.id} />
      </Suspense>
    </div>
  )
}
