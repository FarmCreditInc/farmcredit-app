"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  CreditCard,
  BarChart3,
  FileText,
  Wallet,
  BanknoteIcon,
  Settings,
  Bell,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  Building,
  LogOut,
} from "lucide-react"
import { LenderNotificationBell } from "./lender-notification-bell"
import { LenderRestartTourButton } from "./lender-restart-tour-button"

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
  userId: string
}

interface MenuGroup {
  title: string
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function LenderMobileNav({ className, items, userId, ...props }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
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

  // Grouped navigation items
  const navGroups: MenuGroup[] = [
    {
      title: "Main Navigation",
      items: [
        {
          href: "/dashboard/lender",
          title: "Dashboard",
          icon: <Home className="h-5 w-5" />,
        },
        {
          href: "/dashboard/lender/applications",
          title: "Loan Applications",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          href: "/dashboard/lender/loans",
          title: "Active Loans",
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          href: "/dashboard/lender/approved-loans",
          title: "Approved Loans",
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          href: "/dashboard/lender/notifications",
          title: "Notifications",
          icon: <Bell className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Financial Management",
      items: [
        {
          href: "/dashboard/lender/wallet",
          title: "Wallet",
          icon: <Wallet className="h-5 w-5" />,
        },
        {
          href: "/dashboard/lender/transactions",
          title: "Transactions",
          icon: <BanknoteIcon className="h-5 w-5" />,
        },
        {
          href: "/dashboard/lender/analytics",
          title: "Analytics",
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          href: "/dashboard/lender/bank-details",
          title: "Bank Details",
          icon: <Building className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Account Settings",
      items: [
        {
          href: "/dashboard/lender/settings",
          title: "Settings",
          icon: <Settings className="h-5 w-5" />,
        },
        {
          href: "/dashboard/lender/support",
          title: "Support",
          icon: <LifeBuoy className="h-5 w-5" />,
        },
      ],
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center md:hidden">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <div className="flex items-center space-x-1">
          <LenderRestartTourButton userId={userId} />
          <LenderNotificationBell />
        </div>
      </div>
      <SheetContent side="left" className="pr-0 max-w-[85vw] sm:max-w-[350px] overflow-hidden flex flex-col">
        <div className="px-4 sm:px-7">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold text-xl text-green-600 dark:text-green-400">FarmCredit</span>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className={cn("flex flex-col gap-4 px-2 mt-6 overflow-y-auto flex-1", className)} {...props}>
            {navGroups.map((group) => (
              <div key={group.title} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>{group.title}</span>
                  {openGroups[group.title] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {openGroups[group.title] && (
                  <div className="mt-1 space-y-1 pl-3">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : "hover:bg-muted",
                        )}
                      >
                        <span
                          className={cn(
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
          </nav>
          <div className="mt-auto px-3 py-4 border-t">
            <button
              onClick={() => {
                window.location.href = "/api/auth/logout"
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
