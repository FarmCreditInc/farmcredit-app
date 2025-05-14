"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotifications,
} from "@/actions/notification-views-actions"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
}

export function LenderNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await getUnreadNotifications()

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch notifications")
        }

        setNotifications(response.notifications || [])
        setUnreadCount(response.notifications?.length || 0)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await markNotificationAsRead(notificationId)

      if (!response.success) {
        throw new Error(response.error || "Failed to mark notification as read")
      }

      // Update local state
      setNotifications(notifications.filter((n) => n.id !== notificationId))
      setUnreadCount((prev) => Math.max(0, prev - 1))

      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return

    try {
      const response = await markAllNotificationsAsRead()

      if (!response.success) {
        throw new Error(response.error || "Failed to mark all notifications as read")
      }

      // Update local state
      setNotifications([])
      setUnreadCount(0)

      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      })
    }
  }

  const getNotificationLink = (type: string) => {
    switch (type) {
      case "loan_update":
        return `/dashboard/lender/loans`
      case "profile_update":
        return `/dashboard/lender/settings`
      case "system":
        return `/dashboard/lender/notifications`
      default:
        return `/dashboard/lender/notifications`
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {!loading && unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4 cursor-default">
                <div className="flex w-full justify-between">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <div className="flex justify-between w-full mt-2">
                  <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-blue-600">
                    <Link href={getNotificationLink(notification.type)}>View</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    Dismiss
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No new notifications</p>
            </div>
          )}
        </div>

        <div className="border-t p-2">
          <Button variant="ghost" size="sm" asChild className="w-full justify-center text-sm">
            <Link href="/dashboard/lender/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
