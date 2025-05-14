import { LoadingPane } from "@/components/loading-pane"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminNotificationsLoading() {
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

      <LoadingPane message="Loading notification form..." />
    </div>
  )
}
