"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notification-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  read?: boolean
}

interface NotificationsClientProps {
  userId: string
}

export function NotificationsClient({ userId }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/notifications/all?userId=${userId}`)

        if (!response.ok) {
          throw new Error(`Error fetching notifications: ${response.statusText}`)
        }

        const data = await response.json()
        setNotifications(data.notifications || [])
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId, userId)

      // Update local state
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId)

      // Update local state
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread") return !notification.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </CardDescription>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {renderNotifications(filteredNotifications)}
          </TabsContent>
          <TabsContent value="unread" className="space-y-4">
            {renderNotifications(filteredNotifications)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  function renderNotifications(notificationsToRender: Notification[]) {
    if (notificationsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-muted-foreground">
            {activeTab === "unread" ? "You've read all your notifications" : "You don't have any notifications yet"}
          </p>
        </div>
      )
    }

    return notificationsToRender.map((notification) => (
      <div
        key={notification.id}
        className={`flex items-start gap-4 p-4 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}
      >
        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h4 className="font-medium">{notification.title}</h4>
            <span className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</span>
          </div>
          <p className="mt-1 text-muted-foreground">{notification.message}</p>
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsRead(notification.id)}
              className="mt-2 text-xs"
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    ))
  }
}
