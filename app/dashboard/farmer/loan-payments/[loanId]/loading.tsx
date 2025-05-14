import { Skeleton } from "@/components/ui/skeleton"

export default function LoanDetailsLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <Skeleton className="h-10 w-[120px] rounded-md" />

      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[600px] md:col-span-2 rounded-lg" />
        <div className="space-y-6">
          <Skeleton className="h-[250px] rounded-lg" />
          <Skeleton className="h-[200px] rounded-lg" />
          <Skeleton className="h-[100px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}
