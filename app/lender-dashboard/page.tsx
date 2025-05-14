"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function LenderDashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={["lender"]}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-6">Lender Dashboard</h1>
            <p className="text-lg mb-4">Welcome, {user?.email}</p>
            {/* Rest of the dashboard content */}
          </div>
        </main>
        <SiteFooter />
      </div>
    </ProtectedRoute>
  )
}
