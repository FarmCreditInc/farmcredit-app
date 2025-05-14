"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import * as jose from "jose"

import { supabaseAdmin } from "@/lib/supabase-admin"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// User types
export type UserRole = "farmer" | "lender" | "admin"

export interface UserSession {
  id: string
  email: string
  role: UserRole
  name: string
}

// Generate JWT token with improved error handling
async function generateToken(user: UserSession): Promise<string> {
  try {
    // Validate user object
    if (!user.id || !user.email || !user.role) {
      throw new Error("Invalid user object for token generation")
    }

    // Convert JWT_SECRET to Uint8Array for jose
    const secretKey = new TextEncoder().encode(JWT_SECRET)

    // Create JWT with jose
    const token = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h") // Set to 1 hour
      .sign(secretKey)

    // Verify the token is valid before returning
    try {
      await jose.jwtVerify(token, secretKey)
    } catch (verifyError) {
      console.error("Generated token failed verification:", verifyError)
      throw new Error("Generated token is invalid")
    }

    console.log("Generated token successfully")
    return token
  } catch (error) {
    console.error("Error generating token:", error)
    throw error
  }
}

// Set session cookie with improved error handling
function setSessionCookie(token: string) {
  try {
    // Validate token
    if (!token || typeof token !== "string" || token.length < 10) {
      throw new Error("Invalid token for cookie")
    }

    // Set the cookie with proper options
    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour to match token expiration
      path: "/",
      sameSite: "lax",
    })
    console.log("Session cookie set successfully")
  } catch (error) {
    console.error("Error setting session cookie:", error)
    throw error
  }
}

// Compare password with hash
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Login action
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as UserRole

  if (!email || !password || !role) {
    return { success: false, error: "Missing required fields" }
  }

  try {
    // Query the appropriate table based on role
    const tableName = `${role}s` // farmers, lenders, admins

    console.log(`Attempting to login as ${role} with email: ${email}`)

    // Modified query to handle potential multiple results
    const { data, error } = await supabaseAdmin.from(tableName).select("*").eq("email", email).limit(1)

    if (error) {
      console.error(`Error querying ${tableName}:`, error)
      return { success: false, error: `Database error: ${error.message}` }
    }

    // Check if we got any results
    if (!data || data.length === 0) {
      console.error(`No user found in ${tableName} table with email: ${email}`)
      return { success: false, error: "Invalid credentials" }
    }

    // Use the first result
    const user = data[0]
    console.log(`User found in ${tableName}:`, {
      id: user.id,
      email: user.email,
      // Don't log the password hash in production!
      passwordHashLength: user.password_hash?.length || 0,
    })

    // For farmers and lenders, check if status is approved
    if ((role === "farmer" || role === "lender") && user.status !== "approved") {
      console.error(`User status is not approved: ${user.status}`)
      return {
        success: false,
        error: user.status === "pending" ? "Your account is pending approval" : "Your account has not been approved",
      }
    }

    // Verify password
    console.log("Comparing password...")
    const isPasswordValid = await comparePassword(password, user.password_hash)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return { success: false, error: "Invalid credentials" }
    }

    // Create session
    const session: UserSession = {
      id: user.id,
      email: user.email,
      role: role,
      name: user.full_name || user.organization_name || user.email,
    }

    console.log("Creating session for user:", { id: session.id, email: session.email, role: session.role })

    // Clear any existing session before setting a new one
    cookies().delete("session")

    // Generate and set JWT token
    const token = await generateToken(session)
    setSessionCookie(token)

    // Verify the token was set correctly
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")
    if (!sessionCookie) {
      console.error("Failed to set session cookie")
      return { success: false, error: "Failed to set session cookie" }
    }

    const redirectUrl = `/dashboard/${role}`
    console.log("Login successful, redirecting to:", redirectUrl)

    // Return success with redirect URL
    return {
      success: true,
      redirectUrl: redirectUrl,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: error.message || "An error occurred during login.",
    }
  }
}

// Logout action
export async function logout() {
  try {
    // Delete the session cookie
    cookies().delete("session")

    // Return success and redirect URL instead of using redirect()
    return { success: true, redirectUrl: "/" }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: String(error), redirectUrl: "/" }
  }
}

// Server-side logout with redirect
export async function logoutWithRedirect() {
  cookies().delete("session")
  redirect("/")
}

// Add the missing signOut export (alias for logout)
export async function signOut() {
  try {
    // Check if session cookie exists
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    // If session cookie exists, delete it
    if (sessionCookie) {
      cookieStore.delete("session")
    }

    // Return success regardless of whether cookie existed
    return { success: true, redirectUrl: "/" }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: String(error), redirectUrl: "/" }
  }
}

// Approve user action
export async function approveUser(userId: string, role: string, adminNote?: string) {
  try {
    const tableName = `${role}s`
    const updateData: Record<string, any> = { status: "approved" }

    // Add admin note if provided
    if (adminNote) {
      updateData.admin_note = adminNote
    }

    const { error } = await supabaseAdmin.from(tableName).update(updateData).eq("id", userId)

    if (error) {
      throw new Error(`Error approving user: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Approve user error:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

// Reject user action
export async function rejectUser(userId: string, role: string, adminNote?: string) {
  try {
    const tableName = `${role}s`
    const updateData: Record<string, any> = { status: "rejected" }

    // Add admin note if provided
    if (adminNote) {
      updateData.admin_note = adminNote
    }

    const { error } = await supabaseAdmin.from(tableName).update(updateData).eq("id", userId)

    if (error) {
      throw new Error(`Error rejecting user: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Reject user error:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

// Update admin note action
export async function updateAdminNote(userId: string, role: string, adminNote: string) {
  try {
    const tableName = `${role}s`
    const { error } = await supabaseAdmin.from(tableName).update({ admin_note: adminNote }).eq("id", userId)

    if (error) {
      throw new Error(`Error updating admin note: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Update admin note error:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}
