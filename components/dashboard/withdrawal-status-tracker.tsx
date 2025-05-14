"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WithdrawalStatusTrackerProps {
  withdrawalId: string
}

export function WithdrawalStatusTracker({ withdrawalId }: WithdrawalStatusTrackerProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch of withdrawal status
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase.from("withdrawals").select("status").eq("id", withdrawalId).single()

        if (error) {
          console.error("Error fetching withdrawal status:", error)
          return
        }

        setStatus(data.status)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`withdrawal-${withdrawalId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "withdrawals",
          filter: `id=eq.${withdrawalId}`,
        },
        (payload) => {
          const newStatus = payload.new.status
          setStatus(newStatus)

          // Show toast notification when status changes
          if (newStatus === "processing") {
            toast({
              title: "Withdrawal Processing",
              description: "Your withdrawal request is now being processed.",
            })
          } else if (newStatus === "successful") {
            toast({
              title: "Withdrawal Successful",
              description: "Your funds have been successfully transferred to your bank account.",
              variant: "success",
            })
          } else if (newStatus === "failed") {
            toast({
              title: "Withdrawal Failed",
              description: "There was an issue with your withdrawal. The funds have been returned to your wallet.",
              variant: "destructive",
            })
          }
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [withdrawalId, supabase, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "successful":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Loading status...</span>
      </div>
    )
  }

  if (!status) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 p-2">
      <span className="text-sm font-medium">Status:</span>
      <Badge variant="outline" className={getStatusColor(status)}>
        {formatStatus(status)}
      </Badge>
    </div>
  )
}
