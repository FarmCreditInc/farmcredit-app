"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  Bell,
  Tractor,
  Calculator,
  BookOpen,
  Calendar,
  BarChart3,
  CloudSun,
  BadgePercent,
  LogOut,
} from "lucide-react"
import { signOut } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

interface FarmerSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FarmerSidebar({ className, ...props }: FarmerSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // Show toast notification
      toast.loading("Signing out...", { id: "signout" })

      const result = await signOut()
      if (result.success) {
        toast.success("Signed out successfully", { id: "signout" })
        router.push("/auth/login")
      } else {
        toast.error("Failed to sign out", { id: "signout" })
      }
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("An error occurred while signing out", { id: "signout" })
    }
  }

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Dashboard</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard/farmer"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Overview</span>
            </Link>
            <Link
              href="/dashboard/farmer/analytics"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/analytics" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </Link>
            <Link
              href="/dashboard/farmer/credit-score"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/credit-score" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <BadgePercent className="mr-2 h-4 w-4" />
              <span>Credit Score</span>
            </Link>
            <Link
              href="/dashboard/farmer/notifications"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/notifications" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Farming</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard/farmer/farms"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/dashboard/farmer/farms") ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <Tractor className="mr-2 h-4 w-4" />
              <span>My Farms</span>
            </Link>
            <Link
              href="/dashboard/farmer/tasks"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/tasks" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Tasks</span>
            </Link>
            <Link
              href="/dashboard/farmer/weather"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/weather" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <CloudSun className="mr-2 h-4 w-4" />
              <span>Weather</span>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Finances</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard/farmer/loans"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/loans" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>My Loans</span>
            </Link>
            <Link
              href="/dashboard/farmer/loan-application"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/loan-application" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Apply for Loan</span>
            </Link>
            <Link
              href="/dashboard/farmer/loan-calculator"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/loan-calculator" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <Calculator className="mr-2 h-4 w-4" />
              <span>Loan Calculator</span>
            </Link>
            <Link
              href="/dashboard/farmer/loan-payments"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/dashboard/farmer/loan-payments") ||
                  pathname.startsWith("/dashboard/farmer/loan-history")
                  ? "bg-accent text-accent-foreground"
                  : "transparent",
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Loan Payments</span>
            </Link>
            <Link
              href="/dashboard/farmer/bank-transactions"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/bank-transactions" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Transactions</span>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Learning</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard/farmer/learning"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/learning" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Learning Modules</span>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Support</h2>
          <div className="space-y-1">
            <Link
              href="/dashboard/farmer/support"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/support" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Get Help</span>
            </Link>
            <Link
              href="/dashboard/farmer/settings"
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard/farmer/settings" ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
