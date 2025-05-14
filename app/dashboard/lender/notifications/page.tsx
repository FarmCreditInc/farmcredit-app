import { cookies } from "next/headers"
import * as jose from "jose"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { LenderNotificationsClient } from "@/components/dashboard/lender-notifications-client"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export default async function LenderNotificationsPage() {
  // Get user from session
  const sessionCookie = cookies().get("session")?.value
  let userId = ""

  if (sessionCookie) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
      userId = payload.id as string
    } catch (error) {
      console.error("Error verifying JWT:", error)
    }
  }

  // Fetch all notifications for this lender (where recipient_type is 'lenders' or 'both')
  const { data: notifications } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .or(`recipient_type.eq.lenders,recipient_type.eq.both`)
    .order("created_at", { ascending: false })

  // Fetch notification views for this lender
  const { data: notificationViews } = await supabaseAdmin
    .from("notification_views")
    .select("notification_id, read")
    .eq("lender_id", userId)

  // Create a map of notification IDs to read status
  const readStatusMap = new Map()
  notificationViews?.forEach((view) => {
    readStatusMap.set(view.notification_id, view.read)
  })

  // Add read status to each notification
  const notificationsWithReadStatus =
    notifications?.map((notification) => ({
      ...notification,
      read: readStatusMap.has(notification.id) ? readStatusMap.get(notification.id) : false,
    })) || []

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <LenderNotificationsClient initialNotifications={notificationsWithReadStatus} userId={userId} />
    </div>
  )
}
