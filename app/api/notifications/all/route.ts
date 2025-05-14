import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  const role = request.nextUrl.searchParams.get("role") || "farmer"

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const supabase = createClient()

    // Get all notifications for this role or both
    const recipientTypes = role === "farmer" ? ["farmers", "both"] : ["lenders", "both"]

    // First, get all notifications for the appropriate role
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
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
      .select("*")
      .eq(userIdField, userId)

    if (viewsError) {
      console.error("Error fetching notification views:", viewsError)
      return NextResponse.json({ error: "Failed to fetch notification views" }, { status: 500 })
    }

    // Create a map of notification_id to read status
    const readStatusMap = new Map()
    views?.forEach((view) => {
      readStatusMap.set(view.notification_id, view.read)
    })

    // Combine notifications with read status
    const notificationsWithReadStatus = notifications.map((notification) => {
      // If there's no view record, it's unread
      const isRead = readStatusMap.has(notification.id) ? readStatusMap.get(notification.id) : false
      return {
        ...notification,
        read: isRead,
      }
    })

    return NextResponse.json({
      notifications: notificationsWithReadStatus,
      count: notificationsWithReadStatus.filter((n) => !n.read).length,
    })
  } catch (error) {
    console.error("Unexpected error fetching notifications:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
