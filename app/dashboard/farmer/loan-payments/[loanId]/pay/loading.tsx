import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentLoading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-3xl">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <Skeleton className="h-10 w-[120px] rounded-md" />

      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[400px] rounded-lg" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>

      <Skeleton className="h-[100px] rounded-lg" />
    </div>
  )
}
