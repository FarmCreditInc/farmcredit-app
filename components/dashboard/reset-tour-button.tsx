"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ResetTourButtonProps {
  userId: string
}

export function ResetTourButton({ userId }: ResetTourButtonProps) {
  const [isResetting, setIsResetting] = useState(false)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const handleResetTour = async () => {
    if (!userId || isResetting) return

    try {
      setIsResetting(true)
      const { error } = await supabase.from("farmers").update({ seen_guided_tour: false }).eq("id", userId)

      if (error) {
        console.error("Error resetting guided tour:", error)
        toast({
          title: "Error",
          description: "Failed to reset the guided tour. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Guided tour has been reset. Refresh the page to start the tour.",
      })

      // Reload the page after a short delay to start the tour
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error in reset tour:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetTour}
            disabled={isResetting}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            aria-label="Reset Guided Tour"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Reset Guided Tour</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Restart the guided tour</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
