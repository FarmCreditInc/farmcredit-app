"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { type LucideIcon, LayoutDashboard, Users, Bell, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: LucideIcon
  }[]
  isMobile?: boolean
}

export function AdminSidebar({ className, items = [], isMobile = false, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      const result = await signOut()

      if (result.success) {
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account",
        })
        router.push(result.redirectUrl || "/auth/login")
      } else {
        toast({
          title: "Error signing out",
          description: result.error || "There was a problem signing out. Please try again.",
          variant: "destructive",
        })
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      })
      router.push("/auth/login")
    }
  }

  // Define the sidebar items
  const sidebarItems = [
    {
      href: "/dashboard/admin",
      title: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/admin/farmers",
      title: "Farmers",
      icon: Users,
    },
    {
      href: "/dashboard/admin/lenders",
      title: "Lenders",
      icon: Users,
    },
    {
      href: "/dashboard/admin/notifications",
      title: "Notifications",
      icon: Bell,
    },
  ]

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        isMobile ? "flex-col space-x-0 space-y-1 w-full" : "",
        className,
      )}
      {...props}
    >
      {sidebarItems.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "justify-start w-full",
              pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
              isMobile ? "text-left py-3" : "",
            )}
            asChild
          >
            <Link href={item.href}>
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        )
      })}

      <div className={cn("mt-auto pt-4", isMobile ? "pt-8" : "")}>
        <Button
          variant="ghost"
          className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
