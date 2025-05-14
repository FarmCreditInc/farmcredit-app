"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Wallet,
  BarChart2,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  BanknoteIcon,
  Building,
  ChevronDown,
  ChevronRight,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-browser"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface MenuGroup {
  title: string
  items: {
    title: string
    href: string
    icon: React.ReactNode
  }[]
}

export function LenderSidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClient()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Main Navigation": true,
    "Financial Management": true,
    "Account Settings": true,
  })

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

  // Grouped sidebar links
  const sidebarGroups: MenuGroup[] = [
    {
      title: "Main Navigation",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard/lender",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          title: "Applications",
          href: "/dashboard/lender/applications",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Approved Loans",
          href: "/dashboard/lender/approved-loans",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          title: "Notifications",
          href: "/dashboard/lender/notifications",
          icon: <Bell className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Financial Management",
      items: [
        {
          title: "Wallet",
          href: "/dashboard/lender/wallet",
          icon: <Wallet className="h-4 w-4" />,
        },
        {
          title: "Transactions",
          href: "/dashboard/lender/transactions",
          icon: <BanknoteIcon className="h-4 w-4" />,
        },
        {
          title: "Analytics",
          href: "/dashboard/lender/analytics",
          icon: <BarChart2 className="h-4 w-4" />,
        },
        {
          title: "Bank Details",
          href: "/dashboard/lender/bank-details",
          icon: <Building className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Account Settings",
      items: [
        {
          title: "Settings",
          href: "/dashboard/lender/settings",
          icon: <Settings className="h-4 w-4" />,
        },
        {
          title: "Support",
          href: "/dashboard/lender/support",
          icon: <HelpCircle className="h-4 w-4" />,
        },
      ],
    },
  ]

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)

      // Show toast notification
      toast({
        title: "Signing out...",
        description: "You are being logged out of your account",
      })

      // Sign out using Supabase client
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Also call the API endpoint to clear server-side session
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Redirect to login page
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Error signing out:", error)

      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      })

      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4 py-4 lender-sidebar">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Lender Dashboard</h2>
        <div className="space-y-1">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <span>{group.title}</span>
                {openGroups[group.title] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {openGroups[group.title] && (
                <div className="mt-1 space-y-1 pl-4">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                          : "transparent",
                      )}
                    >
                      <span
                        className={cn(
                          "mr-2",
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                            ? "text-green-600 dark:text-green-400"
                            : "",
                        )}
                      >
                        {item.icon}
                      </span>
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </div>
  )
}
