"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { PendingUsersList } from "@/components/admin/pending-users-list"

export default function PendingUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-6">Pending User Applications</h1>
            <PendingUsersList />
          </div>
        </main>
        <SiteFooter />
      </div>
    </ProtectedRoute>
  )
}
