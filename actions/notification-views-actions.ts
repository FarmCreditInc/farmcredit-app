"use server"

import { cookies } from "next/headers"
import * as jose from "jose"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get the current user session
async function getCurrentUser() {
  const sessionCookie = cookies().get("session")?.value

  if (!sessionCookie) {
    return null
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
    return payload
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return null
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return { success: false, error: "Unauthorized" }
    }

    const userRole = user.role as string

    // Determine if it's a farmer or lender
    const isFarmer = userRole === "farmer"
    const isLender = userRole === "lender"

    if (!isFarmer && !isLender) {
      return { success: false, error: "Invalid user role" }
    }

    // Check if a view record already exists
    const { data: existingView } = await supabaseAdmin
      .from("notification_views")
      .select("id")
      .eq("notification_id", notificationId)
      .eq(isFarmer ? "farmer_id" : "lender_id", user.id)
      .maybeSingle()

    if (existingView) {
      // Update existing view
      const { error } = await supabaseAdmin
        .from("notification_views")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", existingView.id)

      if (error) {
        throw new Error(`Error updating notification view: ${error.message}`)
      }
    } else {
      // Insert new view
      const { error } = await supabaseAdmin.from("notification_views").insert({
        notification_id: notificationId,
        [isFarmer ? "farmer_id" : "lender_id"]: user.id,
        read: true,
        read_at: new Date().toISOString(),
      })

      if (error) {
        throw new Error(`Error creating notification view: ${error.message}`)
      }
    }

    // Revalidate the notifications page
    revalidatePath("/dashboard/lender/notifications")
    revalidatePath("/dashboard/lender")

    return { success: true }
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return { success: false, error: "Unauthorized" }
    }

    const userRole = user.role as string

    // Determine if it's a farmer or lender
    const isFarmer = userRole === "farmer"
    const isLender = userRole === "lender"

    if (!isFarmer && !isLender) {
      return { success: false, error: "Invalid user role" }
    }

    // Get all unread notifications for this user
    const { data: unreadNotifications, error: fetchError } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq(isFarmer ? "recipient_type" : "recipient_type", isFarmer ? "farmers" : "lenders")
      .or(`recipient_type.eq.both`)

    if (fetchError) {
      throw new Error(`Error fetching unread notifications: ${fetchError.message}`)
    }

    if (!unreadNotifications || unreadNotifications.length === 0) {
      return { success: true, message: "No unread notifications" }
    }

    // For each notification, create a view record if it doesn't exist
    const notificationIds = unreadNotifications.map((n) => n.id)

    // Get existing views
    const { data: existingViews, error: viewsError } = await supabaseAdmin
      .from("notification_views")
      .select("notification_id")
      .eq(isFarmer ? "farmer_id" : "lender_id", user.id)
      .in("notification_id", notificationIds)

    if (viewsError) {
      throw new Error(`Error fetching existing views: ${viewsError.message}`)
    }

    // Find notifications that don't have views yet
    const existingViewIds = existingViews?.map((v) => v.notification_id) || []
    const notificationsToInsert = notificationIds.filter((id) => !existingViewIds.includes(id))

    // Insert new views
    if (notificationsToInsert.length > 0) {
      const viewsToInsert = notificationsToInsert.map((notificationId) => ({
        notification_id: notificationId,
        [isFarmer ? "farmer_id" : "lender_id"]: user.id,
        read: true,
        read_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabaseAdmin.from("notification_views").insert(viewsToInsert)

      if (insertError) {
        throw new Error(`Error creating notification views: ${insertError.message}`)
      }
    }

    // Update existing views to read=true
    if (existingViewIds.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("notification_views")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq(isFarmer ? "farmer_id" : "lender_id", user.id)
        .in("notification_id", existingViewIds)
        .eq("read", false)

      if (updateError) {
        throw new Error(`Error updating notification views: ${updateError.message}`)
      }
    }

    // Revalidate the notifications page
    revalidatePath("/dashboard/lender/notifications")
    revalidatePath("/dashboard/lender")

    return { success: true }
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Get unread notifications count
export async function getUnreadNotificationsCount() {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return { success: false, error: "Unauthorized", count: 0 }
    }

    const userRole = user.role as string

    // Determine if it's a farmer or lender
    const isFarmer = userRole === "farmer"
    const isLender = userRole === "lender"

    if (!isFarmer && !isLender) {
      return { success: false, error: "Invalid user role", count: 0 }
    }

    // Use the provided SQL query logic
    const { data, error } = await supabaseAdmin.rpc("get_unread_notifications_count", {
      user_id: user.id,
      user_type: isFarmer ? "farmer" : "lender",
    })

    if (error) {
      throw new Error(`Error getting unread notifications count: ${error.message}`)
    }

    return { success: true, count: data || 0 }
  } catch (error) {
    console.error("Get unread notifications count error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      count: 0,
    }
  }
}

// Get unread notifications
export async function getUnreadNotifications() {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return { success: false, error: "Unauthorized", notifications: [] }
    }

    const userRole = user.role as string

    // Determine if it's a farmer or lender
    const isFarmer = userRole === "farmer"
    const isLender = userRole === "lender"

    if (!isFarmer && !isLender) {
      return { success: false, error: "Invalid user role", notifications: [] }
    }

    // Use the provided SQL query logic
    const { data, error } = await supabaseAdmin.rpc("get_unread_notifications", {
      user_id: user.id,
      user_type: isFarmer ? "farmer" : "lender",
    })

    if (error) {
      throw new Error(`Error getting unread notifications: ${error.message}`)
    }

    return { success: true, notifications: data || [] }
  } catch (error) {
    console.error("Get unread notifications error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      notifications: [],
    }
  }
}
