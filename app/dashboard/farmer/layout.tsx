import type { ReactNode } from "react"
import { FarmerSidebar } from "@/components/dashboard/farmer-sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { ResetTourButton } from "@/components/dashboard/reset-tour-button"
import { SiteFooter } from "@/components/site-footer"
import { getSession } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase-server"
import { GuidedTour } from "@/components/dashboard/guided-tour"
import Link from "next/link"
import { SessionProvider } from "@/providers/session-provider"

interface FarmerDashboardLayoutProps {
  children: ReactNode
}

export default async function FarmerDashboardLayout({ children }: FarmerDashboardLayoutProps) {
  const session = await getSession()
  const userId = session?.id

  // Fetch the farmer data to get the name and profile image
  const supabase = createClient()
  const { data: farmer } = await supabase.from("farmers").select("full_name, profile_url").eq("id", userId).single()

  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              <Link href="/" className="hidden md:flex items-center mr-6">
                <span className="text-xl font-bold text-green-600">FarmCredit</span>
              </Link>
              <div className="md:hidden">
                <MobileNav />
              </div>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <NotificationBell userId={userId} userRole="farmer" />
              <ThemeToggle />
              {userId && <ResetTourButton userId={userId} userType="farmer" />}
              <UserNav
                user={{
                  id: userId,
                  name: farmer?.full_name || "",
                  email: session?.email || "",
                  profileUrl: farmer?.profile_url || "",
                  role: "farmer",
                }}
              />
            </div>
          </div>
        </div>
        <div className="grid flex-1 md:grid-cols-[240px_1fr]">
          <aside className="hidden w-[240px] flex-col md:flex">
            <FarmerSidebar className="farmer-sidebar" />
          </aside>
          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-4 sm:pt-6">{children}</div>
          </main>
        </div>
        <SiteFooter />
        {userId && <GuidedTour userId={userId} userType="farmer" />}
      </div>
    </SessionProvider>
  )
}
