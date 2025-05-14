"use server"

import { cookies } from "next/headers"
import * as jose from "jose"
import { v4 as uuidv4 } from "uuid"

import { supabaseAdmin } from "@/lib/supabase-admin"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get the current user session
async function getCurrentUser() {
  const sessionCookie = cookies().get("session")?.value

  if (!sessionCookie) {
    console.log("No session cookie found in farm-actions")
    return null
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

    console.log("User session verified in farm-actions:", payload.email)
    return payload
  } catch (error) {
    console.error("Error verifying JWT in farm-actions:", error)
    return null
  }
}

// Get farms with pagination
export async function getFarms(farmerId: string, page = 1, perPage = 6) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      console.error("Unauthorized access or invalid user role:", user?.role)
      return { success: false, error: "Unauthorized", data: [], total: 0 }
    }

    // If farmerId is "current", use the current user's ID
    const actualFarmerId = farmerId === "current" ? user.id : farmerId

    // Verify the farmerId matches the current user's ID if not "current"
    if (farmerId !== "current" && user.id !== actualFarmerId) {
      console.error("User ID mismatch:", user.id, farmerId)
      return { success: false, error: "Unauthorized", data: [], total: 0 }
    }

    // Calculate pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from("farms")
      .select("*", { count: "exact", head: true })
      .eq("farmer_id", actualFarmerId)

    if (countError) {
      console.error("Error counting farms:", countError.message)
      return { success: false, error: countError.message, data: [], total: 0 }
    }

    // Get paginated farms
    const { data, error } = await supabaseAdmin
      .from("farms")
      .select("*")
      .eq("farmer_id", actualFarmerId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      console.error("Error fetching farms:", error.message)
      return { success: false, error: error.message, data: [], total: 0 }
    }

    return { success: true, data, total: count }
  } catch (error) {
    console.error("Get farms error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: [],
      total: 0,
    }
  }
}

// Add a new farm
export async function addFarm(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      console.error("Unauthorized access or invalid user role:", user?.role)
      return { success: false, error: "Unauthorized" }
    }

    const farmerId = user.id

    // Extract form data
    const name = formData.get("name") as string
    const size = Number.parseFloat(formData.get("size") as string)
    const size_units = formData.get("size_units") as string
    const location = formData.get("location") as string
    const start_date = formData.get("start_date") as string
    const number_of_harvests = formData.get("number_of_harvests")
      ? Number.parseInt(formData.get("number_of_harvests") as string)
      : null

    // Extract new fields
    const uses_fertilizer = formData.get("uses_fertilizer") === "true"
    const uses_machinery = formData.get("uses_machinery") === "true"
    const uses_irrigation = formData.get("uses_irrigation") === "true"

    const photo = formData.get("photo") as File

    let photoUrl = null

    // Upload photo if provided
    if (photo && photo.size > 0) {
      const fileExt = photo.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`

      // Get user email for the file path
      const { data: userData, error: userError } = await supabaseAdmin
        .from("farmers")
        .select("email")
        .eq("id", farmerId)
        .single()

      if (userError) {
        console.error("Error fetching user email:", userError.message)
        return { success: false, error: `Error fetching user data: ${userError.message}` }
      }

      const userEmail = userData?.email || "unknown"
      const filePath = `farm_photos/${userEmail}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("photos")
        .upload(filePath, photo, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Error uploading farm photo:", uploadError.message)
        return { success: false, error: `Error uploading photo: ${uploadError.message}` }
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage.from("photos").getPublicUrl(filePath)

      photoUrl = urlData.publicUrl
    }

    // Insert farm record
    const { data, error } = await supabaseAdmin
      .from("farms")
      .insert({
        farmer_id: farmerId,
        name,
        size,
        size_units,
        location,
        start_date,
        number_of_harvests,
        photo: photoUrl,
        uses_fertilizer,
        uses_machinery,
        uses_irrigation,
      })
      .select()

    if (error) {
      console.error("Error adding farm:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Add farm error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Delete a farm
export async function deleteFarm(farmId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      console.error("Unauthorized access or invalid user role:", user?.role)
      return { success: false, error: "Unauthorized" }
    }

    // Verify the farm belongs to the current user
    const { data: farm, error: farmError } = await supabaseAdmin
      .from("farms")
      .select("farmer_id")
      .eq("id", farmId)
      .single()

    if (farmError) {
      console.error("Error verifying farm ownership:", farmError.message)
      return { success: false, error: farmError.message }
    }

    if (farm.farmer_id !== user.id) {
      console.error("Farm does not belong to current user")
      return { success: false, error: "Unauthorized" }
    }

    // First, delete any production records associated with this farm
    const { error: productionError } = await supabaseAdmin.from("farm_production").delete().eq("farm_id", farmId)

    if (productionError) {
      console.error("Error deleting farm production records:", productionError.message)
      return { success: false, error: productionError.message }
    }

    // Then delete the farm record
    const { error } = await supabaseAdmin.from("farms").delete().eq("id", farmId)

    if (error) {
      console.error("Error deleting farm:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Delete farm error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Add a production activity
export async function addProduction(data: any) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      console.error("Unauthorized access or invalid user role:", user?.role)
      return { success: false, error: "Unauthorized" }
    }

    // Verify the farm belongs to the current user
    const { data: farm, error: farmError } = await supabaseAdmin
      .from("farms")
      .select("farmer_id")
      .eq("id", data.farm_id)
      .single()

    if (farmError) {
      console.error("Error verifying farm ownership:", farmError.message)
      return { success: false, error: farmError.message }
    }

    if (farm.farmer_id !== user.id) {
      console.error("Farm does not belong to current user")
      return { success: false, error: "Unauthorized" }
    }

    // Insert production record
    const { data: production, error } = await supabaseAdmin
      .from("farm_production")
      .insert({
        farm_id: data.farm_id,
        category: data.category,
        type: data.type,
        crop_plant_date: data.crop_plant_date || null,
        expected_harvest_date: data.expected_harvest_date,
        expected_yield: data.expected_yield,
        expected_yield_unit: data.expected_yield_unit,
        expected_unit_profit: data.expected_unit_profit,
        financiers: data.financiers || null,
        notes: data.notes || null,
      })
      .select()

    if (error) {
      console.error("Error adding production:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data: production }
  } catch (error) {
    console.error("Add production error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
