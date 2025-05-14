"use client"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface LenderRestartTourButtonProps {
  userId: string
}

export function LenderRestartTourButton({ userId }: LenderRestartTourButtonProps) {
  const [isRestarting, setIsRestarting] = useState(false)
  const supabase = createBrowserClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleRestartTour = async () => {
    if (!userId || isRestarting) return

    try {
      setIsRestarting(true)

      // Update the seen_guided_tour flag to false
      const { error } = await supabase.from("lenders").update({ seen_guided_tour: false }).eq("id", userId)

      if (error) {
        throw error
      }

      toast({
        title: "Tour Reset",
        description: "The guided tour will start when you refresh the page.",
      })

      // Refresh the page to trigger the tour
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Error restarting tour:", error)
      toast({
        title: "Error",
        description: "Failed to restart the guided tour. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRestarting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRestartTour}
      disabled={isRestarting}
      className="relative"
      title="Restart Guided Tour"
    >
      <HelpCircle className="h-5 w-5" />
      <span className="sr-only">Restart Guided Tour</span>
    </Button>
  )
}
