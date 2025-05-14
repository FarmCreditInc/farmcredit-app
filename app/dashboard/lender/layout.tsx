import type React from "react"
import { SiteFooter } from "@/components/site-footer"
import { LenderSidebar } from "@/components/dashboard/lender-sidebar"
import { UserNav } from "@/components/dashboard/user-nav"
import { LenderMobileNav } from "@/components/dashboard/lender-mobile-nav"
import { requireRole } from "@/lib/auth-utils"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LenderGuidedTour } from "@/components/dashboard/lender-guided-tour"
import { LenderRestartTourButton } from "@/components/dashboard/lender-restart-tour-button"
import { LenderNotificationBell } from "@/components/dashboard/lender-notification-bell"
import { SessionProvider } from "@/providers/session-provider"

export default async function LenderDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["lender"])

  const sidebarItems = [
    {
      href: "/dashboard/lender",
      title: "Overview",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      href: "/dashboard/lender/applications",
      title: "Loan Applications",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      href: "/dashboard/lender/approved-loans",
      title: "Approved Loans",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      href: "/dashboard/lender/transactions",
      title: "Transactions",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      href: "/dashboard/lender/bank-details",
      title: "Bank Details",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
          <path d="M7 15h.01" />
          <path d="M11 15h2" />
        </svg>
      ),
    },
    {
      href: "/dashboard/lender/settings",
      title: "Settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ]

  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              <LenderMobileNav items={sidebarItems} userId={session.id} />
              <div className="hidden md:flex items-center ml-2">
                <Link href="/dashboard/lender" className="flex items-center">
                  <span className="text-xl font-bold text-green-600">FarmCredit</span>
                </Link>
              </div>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <LenderRestartTourButton userId={session.id} />
                <LenderNotificationBell />
                <ThemeToggle />
              </div>
              <UserNav user={session} />
            </div>
          </div>
        </div>
        <div className="flex flex-1">
          <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
            <div className="flex h-full flex-col gap-2 p-4">
              <div className="flex-1">
                <LenderSidebar items={sidebarItems} />
              </div>
            </div>
          </div>
          <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="mx-auto max-w-7xl w-full">
              <LenderGuidedTour userId={session.id} />
              {children}
            </div>
          </main>
        </div>
        <SiteFooter />
      </div>
    </SessionProvider>
  )
}
