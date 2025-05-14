export const dynamic = "force-dynamic"
export const revalidate = 0

import { AdminDashboardContent } from "@/components/dashboard/admin-dashboard-content"

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <AdminDashboardContent />
    </div>
  )
}
