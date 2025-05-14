"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notification-actions"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
}

interface NotificationBellProps {
  userId?: string
  userRole?: string
}

export function NotificationBell({ userId, userRole = "farmer" }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/notifications/unread?userId=${userId}`)

        if (!response.ok) {
          throw new Error(`Error fetching notifications: ${response.statusText}`)
        }

        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.count || 0)
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
  }, [userId])

  const handleMarkAsRead = async (notificationId: string) => {
    if (!userId) return

    try {
      await markNotificationAsRead(notificationId, userId)

      // Update local state
      setNotifications(notifications.filter((n) => n.id !== notificationId))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!userId || notifications.length === 0) return

    try {
      await markAllNotificationsAsRead(userId)

      // Update local state
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const getNotificationLink = (type: string) => {
    switch (type) {
      case "loan_update":
        return `/dashboard/${userRole}/loan-history`
      case "profile_update":
        return `/dashboard/${userRole}/settings`
      case "system":
        return `/dashboard/${userRole}/notifications`
      default:
        return `/dashboard/${userRole}/notifications`
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
            <Link href={`/dashboard/${userRole}/notifications`}>View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
