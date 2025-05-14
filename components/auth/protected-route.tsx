"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<"farmer" | "lender" | "admin">
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, userRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    } else if (!isLoading && user && userRole && !allowedRoles.includes(userRole as any)) {
      if (userRole === "farmer") {
        router.push("/dashboard")
      } else if (userRole === "lender") {
        router.push("/lender-dashboard")
      } else if (userRole === "admin") {
        router.push("/admin/pending-users")
      } else if (userRole === "pending") {
        router.push("/auth/confirmation")
      }
    }
  }, [user, isLoading, userRole, router, allowedRoles])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || !userRole || !allowedRoles.includes(userRole as any)) {
    return null
  }

  return <>{children}</>
}
