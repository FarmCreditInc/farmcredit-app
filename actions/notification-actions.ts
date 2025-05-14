"use server"

import { createClient } from "@/lib/supabase-server"
import { getSession } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"

// Fix the markNotificationAsRead function to properly handle notification IDs
// Replace the existing markNotificationAsRead function with this implementation:

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const supabase = createClient()

    // First check if a view already exists
    const { data: existingView } = await supabase
      .from("notification_views")
      .select("id")
      .eq("notification_id", notificationId)
      .eq("farmer_id", userId)
      .maybeSingle()

    if (existingView) {
      // Update existing view
      const { error } = await supabase
        .from("notification_views")
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", existingView.id)

      if (error) {
        console.error("Error updating notification view:", error)
        return { success: false, error: error.message }
      }
    } else {
      // Create new view
      const { error } = await supabase.from("notification_views").insert({
        notification_id: notificationId,
        farmer_id: userId,
        read: true,
        read_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating notification view:", error)
        return { success: false, error: error.message }
      }
    }

    // Revalidate the notifications page
    revalidatePath("/dashboard/farmer/notifications")
    revalidatePath("/dashboard/farmer")

    return { success: true }
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error)
    return { success: false, error: "Failed to mark notification as read" }
  }
}

// Fix the markAllNotificationsAsRead function to properly handle all notifications
// Replace the existing markAllNotificationsAsRead function with this implementation:

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = createClient()

    // Get all notifications for farmers
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("id")
      .or(`recipient_type.eq.farmers,recipient_type.eq.both`)

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError)
      return { success: false, error: notificationsError.message }
    }

    if (!notifications || notifications.length === 0) {
      return { success: true }
    }

    // Get existing views
    const { data: existingViews } = await supabase
      .from("notification_views")
      .select("notification_id")
      .eq("farmer_id", userId)

    const existingViewIds = new Set(existingViews?.map((view) => view.notification_id) || [])

    // Prepare batch operations
    const updatePromises = []
    const insertData = []

    for (const notification of notifications) {
      if (existingViewIds.has(notification.id)) {
        // Update existing view
        updatePromises.push(
          supabase
            .from("notification_views")
            .update({ read: true, read_at: new Date().toISOString() })
            .eq("notification_id", notification.id)
            .eq("farmer_id", userId),
        )
      } else {
        // Create new view
        insertData.push({
          notification_id: notification.id,
          farmer_id: userId,
          read: true,
          read_at: new Date().toISOString(),
        })
      }
    }

    // Execute updates
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }

    // Execute inserts
    if (insertData.length > 0) {
      const { error: insertError } = await supabase.from("notification_views").insert(insertData)

      if (insertError) {
        console.error("Error inserting notification views:", insertError)
        return { success: false, error: insertError.message }
      }
    }

    // Revalidate the notifications page
    revalidatePath("/dashboard/farmer/notifications")
    revalidatePath("/dashboard/farmer")

    return { success: true }
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error)
    return { success: false, error: "Failed to mark all notifications as read" }
  }
}

// Add back the createNotification function that was missing
export async function createNotification(formData: FormData) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const message = formData.get("message") as string
    const type = formData.get("type") as string
    const recipient_type = formData.get("recipient_type") as string

    if (!title || !message || !type || !recipient_type) {
      return { success: false, error: "Missing required fields" }
    }

    const supabase = createClient()

    // First, insert the notification
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        title,
        message,
        type,
        recipient_type,
      })
      .select()
      .single()

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      return { success: false, error: notificationError.message }
    }

    // Then, create notification views for all relevant users
    if (recipient_type === "farmers" || recipient_type === "both") {
      // Get all farmers
      const { data: farmers, error: farmersError } = await supabase.from("farmers").select("id")

      if (farmersError) {
        console.error("Error fetching farmers:", farmersError)
        return { success: false, error: farmersError.message }
      }

      // Create notification views for each farmer
      if (farmers && farmers.length > 0) {
        const notificationViews = farmers.map((farmer) => ({
          notification_id: notification.id,
          farmer_id: farmer.id,
          read: false,
        }))

        const { error: viewsError } = await supabase.from("notification_views").insert(notificationViews)

        if (viewsError) {
          console.error("Error creating farmer notification views:", viewsError)
          return { success: false, error: viewsError.message }
        }
      }
    }

    if (recipient_type === "lenders" || recipient_type === "both") {
      // Get all lenders
      const { data: lenders, error: lendersError } = await supabase.from("lenders").select("id")

      if (lendersError) {
        console.error("Error fetching lenders:", lendersError)
        return { success: false, error: lendersError.message }
      }

      // Create notification views for each lender
      if (lenders && lenders.length > 0) {
        const notificationViews = lenders.map((lender) => ({
          notification_id: notification.id,
          lender_id: lender.id,
          read: false,
        }))

        const { error: viewsError } = await supabase.from("notification_views").insert(notificationViews)

        if (viewsError) {
          console.error("Error creating lender notification views:", viewsError)
          return { success: false, error: viewsError.message }
        }
      }
    }

    // Revalidate the notifications page
    revalidatePath("/dashboard/admin/notifications")

    return { success: true }
  } catch (error) {
    console.error("Error in createNotification:", error)
    return { success: false, error: String(error) }
  }
}

export async function getUnreadNotificationsCount(userId: string, role = "farmer") {
  if (!userId) {
    return { count: 0 }
  }

  const supabase = createClient()

  // Get all notifications for this role or both
  const recipientTypes = role === "farmer" ? ["farmers", "both"] : ["lenders", "both"]

  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("id")
    .in("recipient_type", recipientTypes)

  if (notificationsError || !notifications) {
    console.error("Error fetching notifications:", notificationsError)
    return { count: 0 }
  }

  if (notifications.length === 0) {
    return { count: 0 }
  }

  // Get notification views for this user
  const userIdField = role === "farmer" ? "farmer_id" : "lender_id"

  const { data: views, error: viewsError } = await supabase
    .from("notification_views")
    .select("notification_id, read")
    .eq(userIdField, userId)

  if (viewsError) {
    console.error("Error fetching notification views:", viewsError)
    return { count: 0 }
  }

  // Create a map of notification_id to read status
  const viewsMap = new Map()
  views?.forEach((view) => {
    viewsMap.set(view.notification_id, view.read)
  })

  // Count unread notifications
  const unreadCount = notifications.filter((notification) => {
    // If there's no view for this notification, it's unread
    if (!viewsMap.has(notification.id)) return true
    // If there's a view but read is false, it's unread
    return viewsMap.get(notification.id) === false
  }).length

  return { count: unreadCount }
}
