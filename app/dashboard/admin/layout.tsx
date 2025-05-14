import type React from "react"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { SiteFooter } from "@/components/site-footer"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { AdminMobileNav } from "@/components/dashboard/admin-mobile-nav"
import { SessionProvider } from "@/providers/session-provider"

export const dynamic = "force-dynamic"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        {/* Add navbar */}
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2 py-4">
              <AdminMobileNav />
              <Link href="/dashboard/admin" className="flex items-center">
                <span className="text-xl font-bold text-green-600">FarmCredit</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="flex-1 container py-6">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] gap-8">
            <aside className="hidden md:block">
              <AdminSidebar className="sticky top-6" />
            </aside>
            <main className="flex-1">{children}</main>
          </div>
        </div>
        <SiteFooter />
      </div>
    </SessionProvider>
  )
}
