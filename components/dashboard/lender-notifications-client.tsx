"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notification-views-actions"
import { useToast } from "@/hooks/use-toast"
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  read: boolean
}

interface LenderNotificationsClientProps {
  initialNotifications: Notification[]
  userId: string
}

export function LenderNotificationsClient({ initialNotifications, userId }: LenderNotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const readNotifications = notifications.filter((notification) => notification.read)

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await markNotificationAsRead(notificationId)

      if (!response.success) {
        throw new Error(response.error || "Failed to mark notification as read")
      }

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )

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
    if (unreadNotifications.length === 0) return

    try {
      const response = await markAllNotificationsAsRead()

      if (!response.success) {
        throw new Error(response.error || "Failed to mark all notifications as read")
      }

      // Update local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      )

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "loan_update":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "system":
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <TabsList className="mb-4 sm:mb-0">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
            <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
          </TabsList>
          {unreadNotifications.length > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              Mark all as read
            </Button>
          )}
        </div>

        <TabsContent value="all" className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
            ))
          ) : (
            <EmptyState message="You don't have any notifications yet." />
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
            ))
          ) : (
            <EmptyState message="You don't have any unread notifications." />
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {readNotifications.length > 0 ? (
            readNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
            ))
          ) : (
            <EmptyState message="You don't have any read notifications." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "loan_update":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "system":
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card className={notification.read ? "bg-muted/40" : "border-l-4 border-l-green-500"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getNotificationIcon(notification.type)}
            <CardTitle className="text-base">{notification.title}</CardTitle>
          </div>
          <CardDescription>
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{notification.message}</p>
        {!notification.read && (
          <Button variant="outline" size="sm" onClick={() => onMarkAsRead(notification.id)} className="text-xs">
            Mark as read
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No notifications</h3>
      <p className="text-muted-foreground mt-2">{message}</p>
    </div>
  )
}
