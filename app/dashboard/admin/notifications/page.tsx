import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth-utils"
import { NotificationForm } from "@/components/dashboard/notification-form"
import { LoadingPane } from "@/components/loading-pane"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminNotificationsPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/auth/login/admin")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Notifications</h1>
          <p className="text-muted-foreground">Create and send notifications to farmers and lenders</p>
        </div>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <a href="/dashboard/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </a>
        </Button>
      </div>

      <Suspense fallback={<LoadingPane message="Loading notification form..." />}>
        <NotificationForm />
      </Suspense>
    </div>
  )
}
