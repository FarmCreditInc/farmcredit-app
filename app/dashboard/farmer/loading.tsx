import { LoadingPane } from "@/components/loading-pane"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-2"></div>
        <div className="h-4 w-72 bg-muted animate-pulse rounded-md"></div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <LoadingPane className="h-[120px]" />
        <LoadingPane className="h-[120px]" />
        <LoadingPane className="h-[120px]" />
        <LoadingPane className="h-[120px]" />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <LoadingPane className="h-[300px]" />
        <LoadingPane className="h-[300px] lg:col-span-2" />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <LoadingPane />
        <LoadingPane />
        <LoadingPane />
      </div>
    </div>
  )
}
