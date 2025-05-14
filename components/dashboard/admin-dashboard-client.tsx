"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"

type DashboardStats = {
  pendingFarmersCount: number
  pendingLendersCount: number
  approvedFarmersCount: number
  approvedLendersCount: number
  rejectedFarmersCount: number
  rejectedLendersCount: number
  pendingFarmers: any[]
  pendingLenders: any[]
}

export function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingFarmersCount: 0,
    pendingLendersCount: 0,
    approvedFarmersCount: 0,
    approvedLendersCount: 0,
    rejectedFarmersCount: 0,
    rejectedLendersCount: 0,
    pendingFarmers: [],
    pendingLenders: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/dashboard-stats")
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }
        const data = await response.json()

        // Ensure all numeric values are numbers, not null or undefined
        const safeData = {
          pendingFarmersCount: Number(data.pendingFarmersCount) || 0,
          pendingLendersCount: Number(data.pendingLendersCount) || 0,
          approvedFarmersCount: Number(data.approvedFarmersCount) || 0,
          approvedLendersCount: Number(data.approvedLendersCount) || 0,
          rejectedFarmersCount: Number(data.rejectedFarmersCount) || 0,
          rejectedLendersCount: Number(data.rejectedLendersCount) || 0,
          pendingFarmers: data.pendingFarmers || [],
          pendingLenders: data.pendingLenders || [],
        }

        setStats(safeData)
        setError(null)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setError(error instanceof Error ? error.message : "Failed to load dashboard stats")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error: {error}</p>
        <p className="mt-2">Please try refreshing the page or contact support.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Farmers</CardTitle>
            <div className="text-2xl font-bold">{stats.pendingFarmersCount}</div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-muted-foreground">Farmers awaiting approval</div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="px-0 text-blue-500" asChild>
              <Link href="/dashboard/admin/farmers">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Lenders</CardTitle>
            <div className="text-2xl font-bold">{stats.pendingLendersCount}</div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-muted-foreground">Lenders awaiting approval</div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="px-0 text-green-500" asChild>
              <Link href="/dashboard/admin/lenders">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Farmers</CardTitle>
            <div className="text-2xl font-bold">{stats.approvedFarmersCount}</div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-muted-foreground">Active farmer accounts</div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="px-0 text-purple-500" asChild>
              <Link href="/dashboard/admin/farmers?status=approved">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Lenders</CardTitle>
            <div className="text-2xl font-bold">{stats.approvedLendersCount}</div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-muted-foreground">Active lender accounts</div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="px-0 text-amber-500" asChild>
              <Link href="/dashboard/admin/lenders?status=approved">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground">Latest platform activities and updates</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.pendingFarmers.length > 0 || stats.pendingLenders.length > 0 ? (
              <>
                {stats.pendingFarmers.map((farmer, index) => (
                  <div key={`farmer-${index}`} className="flex items-center gap-4 border-b pb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">F</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{farmer.full_name || "Unnamed Farmer"}</p>
                      <p className="text-sm text-muted-foreground">New farmer registration</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(farmer.created_at).toLocaleDateString()}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/admin/farmers?id=${farmer.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}

                {stats.pendingLenders.map((lender, index) => (
                  <div key={`lender-${index}`} className="flex items-center gap-4 border-b pb-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-medium">L</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {lender.organization_name || lender.contact_person_name || "Unnamed Lender"}
                      </p>
                      <p className="text-sm text-muted-foreground">New lender registration</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(lender.created_at).toLocaleDateString()}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/admin/lenders?id=${lender.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No pending applications to review</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            Showing registrations from the last 24 hours
          </p>
        </CardFooter>
      </Card>

      {/* Quick Actions Section */}
      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Users</span>
                <span className="font-medium">{stats.approvedFarmersCount + stats.approvedLendersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Approvals</span>
                <span className="font-medium">{stats.pendingFarmersCount + stats.pendingLendersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rejected Applications</span>
                <span className="font-medium">{stats.rejectedFarmersCount + stats.rejectedLendersCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/farmers">
                  <span>Manage Farmers</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/lenders">
                  <span>Manage Lenders</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Database: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Storage: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Authentication: Online</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground w-full text-center">All systems operational</p>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
