"use client"

import { useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@/lib/supabase-browser"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Home,
  CreditCard,
  LineChart,
  Bell,
  LayoutDashboard,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Wallet,
  FileText,
  BanknoteIcon,
} from "lucide-react"

interface LenderGuidedTourProps {
  userId: string
}

export function LenderGuidedTour({ userId }: LenderGuidedTourProps) {
  // All hooks must be called at the top level, not conditionally
  const [showTour, setShowTour] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()
  const supabase = createBrowserClient()
  const { toast } = useToast()
  const [hasCheckedTourStatus, setHasCheckedTourStatus] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Define the tour steps
  const tourSteps = [
    {
      target: "body",
      title: "Welcome to FarmCredit!",
      content:
        "We're excited to have you on board as a lender! This guided tour will help you understand how to make the most of your dashboard.",
      icon: <Home className="h-5 w-5" />,
    },
    {
      target: ".wallet-card",
      title: "Wallet Overview",
      content:
        "Your wallet shows your available balance for funding loans. You can top up your wallet and track all transactions here.",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      target: ".pending-applications",
      title: "Loan Applications",
      content:
        "Review and approve pending loan applications from farmers. You can see their credit scores and requested amounts before making decisions.",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      target: ".active-loans",
      title: "Active Loans",
      content:
        "Monitor all your approved loans, track repayments, and view detailed information about each borrower and their farming projects.",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      target: ".transaction-history",
      title: "Transaction History",
      content: "View all your financial transactions, including deposits, withdrawals, and loan disbursements.",
      icon: <BanknoteIcon className="h-5 w-5" />,
    },
    {
      target: ".analytics-charts",
      title: "Analytics Dashboard",
      content:
        "Track your lending performance with visual charts showing funding patterns, repayment trends, and portfolio distribution.",
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      target: ".notifications-panel",
      title: "Notifications",
      content:
        "Stay updated with important information about loan applications, repayments, and platform announcements.",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      target: ".lender-sidebar",
      title: "Navigation Menu",
      content:
        "This menu provides access to all sections of your dashboard, including applications, loans, transactions, and settings.",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      target: "body",
      title: "You're All Set!",
      content:
        "Congratulations on completing the tour! You're now ready to make the most of the FarmCredit platform to support farmers and grow your investment.",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ]

  // Define all handler functions using useCallback to prevent unnecessary re-renders
  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1)
      scrollToTarget(tourSteps[currentStep + 1].target)
    }
  }, [currentStep, tourSteps])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1)
      scrollToTarget(tourSteps[currentStep - 1].target)
    }
  }, [currentStep, tourSteps])

  const handleFinish = useCallback(async () => {
    try {
      const { error } = await supabase.from("lenders").update({ seen_guided_tour: true }).eq("id", userId)

      if (error) {
        console.error("Error updating guided tour status:", error)
      }

      setShowTour(false)
      toast({
        title: "Tour Completed!",
        description: "You can restart the tour anytime from your settings page.",
      })
    } catch (error) {
      console.error("Error in tour finish:", error)
    }
  }, [supabase, userId, toast])

  const handleSkip = useCallback(async () => {
    try {
      const { error } = await supabase.from("lenders").update({ seen_guided_tour: true }).eq("id", userId)

      if (error) {
        console.error("Error updating guided tour status:", error)
      }

      setShowTour(false)
      toast({
        title: "Tour Skipped",
        description: "You can start the tour anytime from your settings page.",
      })
    } catch (error) {
      console.error("Error in tour skip:", error)
    }
  }, [supabase, userId, toast])

  // Define scrollToTarget outside of any conditional rendering
  const scrollToTarget = useCallback((selector: string) => {
    if (selector === "body") return

    try {
      const element = document.querySelector(selector)
      if (element) {
        // On mobile, we need to account for the fixed position of the tour
        const isMobile = window.innerWidth < 640

        if (isMobile) {
          // For mobile, just scroll to the element with more offset
          element.scrollIntoView({ behavior: "smooth", block: "center" })

          // Add a small delay to ensure the scroll completes
          setTimeout(() => {
            // Add a highlight effect to the target element
            element.classList.add("tour-highlight")

            // Remove the highlight after 2 seconds
            setTimeout(() => {
              element.classList.remove("tour-highlight")
            }, 2000)
          }, 500)
        } else {
          // For desktop, standard scrolling works fine
          element.scrollIntoView({ behavior: "smooth", block: "center" })

          // Add a highlight effect to the target element
          element.classList.add("tour-highlight")

          // Remove the highlight after 2 seconds
          setTimeout(() => {
            element.classList.remove("tour-highlight")
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Error scrolling to element:", error)
    }
  }, [])

  // Check guided tour status effect
  useEffect(() => {
    // Check if the user has seen the guided tour
    const checkGuidedTourStatus = async () => {
      if (!userId || hasCheckedTourStatus) return

      try {
        const { data, error } = await supabase.from("lenders").select("seen_guided_tour").eq("id", userId).single()

        if (error) {
          console.error("Error checking guided tour status:", error)
          return
        }

        // Only run the tour if seen_guided_tour is specifically false
        setShowTour(data && data.seen_guided_tour === false)
      } catch (error) {
        console.error("Error in guided tour check:", error)
      } finally {
        setHasCheckedTourStatus(true)
      }
    }

    checkGuidedTourStatus()
  }, [userId, supabase, hasCheckedTourStatus])

  // Clean up effect
  useEffect(() => {
    if (showTour && typeof document !== "undefined") {
      document.body.classList.add("tour-active")
    }

    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("tour-active")
      }
    }
  }, [showTour])

  // Early return if tour shouldn't be shown
  if (!showTour) return null

  const currentTourStep = tourSteps[currentStep]

  return (
    <>
      {/* Overlay that prevents interaction with the page while tour is active */}
      <style jsx global>{`
        .tour-active {
          overflow: hidden;
        }
        
        .tour-highlight {
          position: relative;
          z-index: 60;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5);
          border-radius: 4px;
          transition: box-shadow 0.3s ease;
        }
        
        @media (max-width: 640px) {
          .tour-modal {
            width: calc(100% - 32px);
            max-height: calc(100% - 100px);
            overflow-y: auto;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="tour-modal relative w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-5 shadow-lg sm:p-6">
          <button
            onClick={handleSkip}
            className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 sm:right-4 sm:top-4"
            aria-label="Close tour"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white sm:h-10 sm:w-10">
              {currentTourStep.icon}
            </div>
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400 sm:text-xl">{currentTourStep.title}</h3>
          </div>

          <div className="mb-5 sm:mb-6">
            <div className="text-sm text-gray-700 dark:text-gray-300 sm:text-base">{currentTourStep.content}</div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {currentStep > 0 ? (
                <Button variant="outline" onClick={handlePrevious} size="sm" className="w-full sm:w-auto">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              ) : (
                <Button variant="outline" onClick={handleSkip} size="sm" className="w-full sm:w-auto">
                  Skip tour
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep + 1} of {tourSteps.length}
              </span>
              {currentStep < tourSteps.length - 1 ? (
                <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700" size="sm">
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700" size="sm">
                  Finish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
