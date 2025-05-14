import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")
  const role = searchParams.get("role") || "farmer"

  if (!userId) {
    return NextResponse.json({ notifications: [], count: 0 })
  }

  const supabase = createClient()

  try {
    // Get all notifications for this role or both
    const recipientTypes = role === "farmer" ? ["farmers", "both"] : ["lenders", "both"]

    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("id, title, message, type, created_at")
      .in("recipient_type", recipientTypes)
      .order("created_at", { ascending: false })

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ notifications: [], count: 0 })
    }

    // Get notification views for this user
    const userIdField = role === "farmer" ? "farmer_id" : "lender_id"

    const { data: views, error: viewsError } = await supabase
      .from("notification_views")
      .select("notification_id, read")
      .eq(userIdField, userId)

    if (viewsError) {
      console.error("Error fetching notification views:", viewsError)
      return NextResponse.json({ error: "Failed to fetch notification views" }, { status: 500 })
    }

    // Create a map of notification_id to read status
    const viewsMap = new Map()
    views?.forEach((view) => {
      viewsMap.set(view.notification_id, view.read)
    })

    // Filter for unread notifications
    const unreadNotifications = notifications.filter((notification) => {
      // If there's no view for this notification, it's unread
      if (!viewsMap.has(notification.id)) return true
      // If there's a view but read is false, it's unread
      return viewsMap.get(notification.id) === false
    })

    // Limit to 3 most recent unread notifications
    const limitedNotifications = unreadNotifications.slice(0, 3)

    return NextResponse.json({
      notifications: limitedNotifications,
      count: unreadNotifications.length,
    })
  } catch (error) {
    console.error("Unexpected error in unread notifications:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
