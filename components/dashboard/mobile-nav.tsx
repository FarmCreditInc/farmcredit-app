"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  Menu,
  LayoutDashboard,
  BarChart3,
  BadgePercent,
  Bell,
  Tractor,
  Calendar,
  CloudSun,
  CreditCard,
  FileText,
  Calculator,
  BookOpen,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { handleSignOut } from "@/app/dashboard/farmer/actions"
import Link from "next/link"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex items-center md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Open menu" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
          <div className="flex flex-col h-full">
            <div className="px-4 py-6 border-b">
              <h2 className="text-lg font-semibold tracking-tight">FarmCredit Dashboard</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                {/* Modified FarmerSidebar to close menu on click */}
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
                        onClick={() => setOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Overview</span>
                      </Link>
                      <Link
                        href="/dashboard/farmer/analytics"
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === "/dashboard/farmer/analytics"
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                      <Link
                        href="/dashboard/farmer/credit-score"
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === "/dashboard/farmer/credit-score"
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <BadgePercent className="mr-2 h-4 w-4" />
                        <span>Credit Score</span>
                      </Link>
                      <Link
                        href="/dashboard/farmer/notifications"
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === "/dashboard/farmer/notifications"
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
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
                          pathname.startsWith("/dashboard/farmer/farms")
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>My Loans</span>
                      </Link>
                      <Link
                        href="/dashboard/farmer/loan-application"
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === "/dashboard/farmer/loan-application"
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Apply for Loan</span>
                      </Link>
                      <Link
                        href="/dashboard/farmer/loan-calculator"
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === "/dashboard/farmer/loan-calculator"
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Loan Payments</span>
                      </Link>
                      <Link
                        href="/dashboard/farmer/bank-transactions"
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === "/dashboard/farmer/bank-transactions"
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
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
                          pathname === "/dashboard/farmer/learning"
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Get Help</span>
                      </Link>
                      <Link
                        href="/dashboard/farmer/settings"
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === "/dashboard/farmer/settings"
                            ? "bg-accent text-accent-foreground"
                            : "transparent",
                        )}
                        onClick={() => setOpen(false)}
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
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <span className="text-xl font-bold text-green-600">FarmCredit</span>
    </div>
  )
}
