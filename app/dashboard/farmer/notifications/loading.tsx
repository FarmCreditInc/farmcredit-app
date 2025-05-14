import { LoadingPane } from "@/components/loading-pane"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotificationsLoading() {
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

      <LoadingPane message="Loading notifications..." />
    </div>
  )
}
