import { Loader } from "lucide-react"

export default function CallbackLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Verifying your payment...</p>
      </div>
    </div>
  )
}
