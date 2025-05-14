"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/actions/auth-actions"

type UseInactivityTrackerProps = {
  timeout?: number // in milliseconds
  warningTime?: number // in milliseconds
  onWarning?: () => void
  onTimeout?: () => void
}

export function useInactivityTracker({
  timeout = 60 * 60 * 1000, // 1 hour by default
  warningTime = 55 * 60 * 1000, // 55 minutes by default
  onWarning = () => {},
  onTimeout = () => {},
}: UseInactivityTrackerProps = {}) {
  const router = useRouter()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState<number>(timeout)

  // Reset the timer when user interacts with the page
  const resetTimer = () => {
    setLastActivity(Date.now())
    setShowWarning(false)
  }

  // Handle automatic logout
  const handleLogout = async () => {
    try {
      await signOut()
      onTimeout()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    // Events that count as user activity
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    // Add event listeners for all activity events
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    // Check inactivity every minute
    const intervalId = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const timeRemaining = timeout - timeSinceLastActivity

      setRemainingTime(Math.max(0, timeRemaining))

      // Show warning when approaching timeout
      if (timeSinceLastActivity >= warningTime && !showWarning) {
        setShowWarning(true)
        onWarning()
      }

      // Log out when timeout is reached
      if (timeSinceLastActivity >= timeout) {
        handleLogout()
      }
    }, 60000) // Check every minute

    // Clean up event listeners and interval
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
      clearInterval(intervalId)
    }
  }, [lastActivity, timeout, warningTime, showWarning, onWarning, onTimeout])

  return {
    resetTimer,
    showWarning,
    remainingTime,
    dismissWarning: () => setShowWarning(false),
  }
}
