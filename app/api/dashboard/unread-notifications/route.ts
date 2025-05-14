import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { createClient } from "@/lib/supabase-server"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: Request) {
  // Get user from session
  const sessionCookie = cookies().get("session")?.value
  let userId = ""
  let userRole = ""

  if (sessionCookie) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
      userId = payload.id as string
      userRole = payload.role as string
    } catch (error) {
      console.error("Error verifying JWT:", error)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get("userId")

    // Ensure the requested user ID matches the authenticated user
    if (requestedUserId && requestedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Get unread notifications count using the new schema
    // First, get all notifications that are for farmers or both
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("id, title, message, type, created_at")
      .in("recipient_type", ["farmers", "both"])
      .order("created_at", { ascending: false })

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError)
      return NextResponse.json({ error: "Database Error", message: "Failed to fetch notifications" }, { status: 500 })
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Get notification views for this farmer
    const { data: notificationViews, error: viewsError } = await supabase
      .from("notification_views")
      .select("notification_id, read")
      .eq("farmer_id", userId)

    if (viewsError) {
      console.error("Error fetching notification views:", viewsError)
      return NextResponse.json(
        { error: "Database Error", message: "Failed to fetch notification views" },
        { status: 500 },
      )
    }

    // Create a map of notification_id to read status
    const viewsMap = new Map()
    notificationViews?.forEach((view) => {
      viewsMap.set(view.notification_id, view.read)
    })

    // Filter notifications that are either not viewed or viewed but not read
    const unreadNotifications = notifications.filter((notification) => {
      // If there's no view for this notification, it's unread
      if (!viewsMap.has(notification.id)) return true
      // If there's a view but read is false, it's unread
      return viewsMap.get(notification.id) === false
    })

    // Take only the top 3 unread notifications
    const topUnreadNotifications = unreadNotifications.slice(0, 3)

    // If there are unread notifications, create a task
    if (topUnreadNotifications.length > 0) {
      const notificationTask = {
        id: "unread-notifications",
        count: unreadNotifications.length,
        details: topUnreadNotifications.map((notification) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          timestamp: notification.created_at,
          actionUrl: "/dashboard/farmer/notifications",
        })),
      }

      return NextResponse.json({ success: true, data: [notificationTask] })
    }

    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    console.error("Error in unread-notifications API:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch unread notifications" },
      { status: 500 },
    )
  }
}
