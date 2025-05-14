"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useInactivityTracker } from "@/hooks/use-inactivity-tracker"
import { InactivityWarning } from "@/components/dashboard/inactivity-warning"
import { signOut } from "@/actions/auth-actions"
import { useRouter } from "next/navigation"

interface SessionContextType {
  resetActivity: () => void
}

const SessionContext = createContext<SessionContextType>({
  resetActivity: () => {},
})

export const useSession = () => useContext(SessionContext)

interface SessionProviderProps {
  children: ReactNode
  timeout?: number // in milliseconds
}

export function SessionProvider({
  children,
  timeout = 60 * 60 * 1000, // 1 hour by default
}: SessionProviderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const { resetTimer, showWarning, remainingTime, dismissWarning } = useInactivityTracker({
    timeout,
    warningTime: timeout - 5 * 60 * 1000, // 5 minutes before timeout
    onTimeout: () => {
      console.log("Session timed out due to inactivity")
    },
  })

  return (
    <SessionContext.Provider value={{ resetActivity: resetTimer }}>
      {children}
      <InactivityWarning
        isOpen={showWarning}
        onStayLoggedIn={resetTimer}
        onLogout={handleLogout}
        remainingTime={remainingTime}
      />
    </SessionContext.Provider>
  )
}
