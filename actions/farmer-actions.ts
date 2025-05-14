"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import * as jose from "jose"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get the current user session
async function getCurrentUser() {
  // Use a try-catch block to handle the case when cookies() is called during static generation
  let cookieStore
  try {
    cookieStore = cookies()
  } catch (error) {
    // During static generation, cookies() will throw an error
    console.log("Cookies not available during static generation")
    return null
  }

  const sessionCookie = cookieStore.get("session")?.value

  if (!sessionCookie) {
    console.log("No session cookie found in farmer-actions")
    return null
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(sessionCookie, secretKey)

    console.log("User session verified in farmer-actions:", payload.email)
    return payload
  } catch (error) {
    console.error("Error verifying JWT in farmer-actions:", error)
    return null
  }
}

// Get farmer profile
export async function getFarmerProfile() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      console.error("Unauthorized access or invalid user role:", user?.role)
      return { success: false, error: "Unauthorized" }
    }

    console.log("Fetching farmer profile for user ID:", user.id)
    const { data, error } = await supabaseAdmin.from("farmers").select("*").eq("id", user.id)

    if (error) {
      console.error("Error fetching farmer profile:", error.message)
      throw new Error(`Error fetching farmer profile: ${error.message}`)
    }

    // Check if we have any farmer data
    if (!data || data.length === 0) {
      console.log("No farmer profile found for user ID:", user.id)
      return {
        success: true,
        data: null,
        message: "No farmer profile found. Please complete your profile.",
      }
    }

    console.log("Farmer profile loaded successfully:", data[0].full_name)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Get farmer profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Get farmer loans
export async function getFarmerLoans() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      console.log("Unauthorized or not a farmer role")
      return { data: [] }
    }

    // In this schema, the farmer ID is directly the user ID from the session
    const farmerId = user.id

    const { data, error } = await supabaseAdmin
      .from("loan_application")
      .select(`
        *,
        loan_contract(*)
      `)
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching farmer loans:", error.message)
      return { data: [] }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Get farmer loans error:", error)
    return { data: [] }
  }
}

// Apply for loan
export async function applyForLoan(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "farmer") {
      return { success: false, error: "Unauthorized" }
    }

    // In this schema, the farmer ID is directly the user ID from the session
    const farmerId = user.id

    const lenderId = formData.get("lender_id") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const purpose = formData.get("purpose") as string
    const duration = Number.parseInt(formData.get("duration") as string)

    if (!lenderId || !amount || !purpose || !duration) {
      return { success: false, error: "Missing required fields" }
    }

    const { data, error } = await supabaseAdmin
      .from("loan_application")
      .insert({
        farmer_id: farmerId,
        lender_id: lenderId,
        amount: amount,
        purpose: purpose,
        duration_months: duration,
        status: "pending",
      })
      .select()

    if (error) {
      throw new Error(`Error applying for loan: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Apply for loan error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
