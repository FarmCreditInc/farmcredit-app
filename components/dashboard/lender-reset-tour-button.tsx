"use client"

import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { RefreshCw } from "lucide-react"

interface ResetTourButtonProps {
  userId: string
}

export function LenderResetTourButton({ userId }: ResetTourButtonProps) {
  const [isResetting, setIsResetting] = useState(false)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const handleResetTour = async () => {
    try {
      setIsResetting(true)

      const { error } = await supabase.from("lenders").update({ seen_guided_tour: false }).eq("id", userId)

      if (error) {
        throw error
      }

      toast({
        title: "Tour Reset",
        description: "The guided tour will appear the next time you visit the dashboard.",
      })

      // Redirect to dashboard to show the tour
      window.location.href = "/dashboard/lender"
    } catch (error) {
      console.error("Error resetting tour:", error)
      toast({
        title: "Reset Failed",
        description: "There was an error resetting the guided tour. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Button onClick={handleResetTour} disabled={isResetting} variant="outline" className="w-full sm:w-auto">
      <RefreshCw className="mr-2 h-4 w-4" />
      {isResetting ? "Resetting..." : "Reset Guided Tour"}
    </Button>
  )
}
