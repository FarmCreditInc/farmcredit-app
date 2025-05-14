import { Skeleton } from "@/components/ui/skeleton"

export default function LoanPaymentsLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <Skeleton className="h-16 w-full rounded-lg" />

      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-[100px] rounded-md" />
          <Skeleton className="h-10 w-[100px] rounded-md" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-lg" />
            ))}
        </div>
      </div>
    </div>
  )
}
