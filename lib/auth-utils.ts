import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as jose from "jose"

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// User types
export type UserRole = "farmer" | "lender" | "admin"

export interface UserSession {
  id: string
  email: string
  role: UserRole
  name?: string
  iat?: number
  exp?: number
}

// Verify JWT token with improved error handling
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    // Basic format validation before attempting verification
    if (!token || typeof token !== "string" || !token.includes(".")) {
      console.error("Invalid token format:", token ? token.substring(0, 10) + "..." : "undefined")
      return null
    }

    // Convert JWT_SECRET to Uint8Array for jose
    const secretKey = new TextEncoder().encode(JWT_SECRET)

    // Verify token with jose
    const { payload } = await jose.jwtVerify(token, secretKey)
    return payload as unknown as UserSession
  } catch (error) {
    console.error("Token verification error:", error)

    // Log additional debugging information
    if (error.code === "ERR_JWS_INVALID") {
      console.error("Invalid JWS format. Token might be corrupted or malformed.")
      console.error("Token length:", token ? token.length : "undefined")
      console.error("Token prefix:", token ? token.substring(0, 20) + "..." : "undefined")
    }

    return null
  }
}

// Alias for verifyToken to maintain compatibility
export async function verifyJWT(token: string): Promise<UserSession | null> {
  return verifyToken(token)
}

// Get session from cookie with improved error handling
export async function getSession(): Promise<UserSession | null> {
  try {
    // Use a try-catch block to handle the case when cookies() is called during static generation
    let cookieStore
    try {
      cookieStore = cookies()
    } catch (error) {
      // During static generation, cookies() will throw an error
      console.log("Cookies not available during static generation")
      return null
    }

    const sessionCookie = cookieStore.get("session")
    if (!sessionCookie) {
      console.log("No session cookie found")
      return null
    }

    // Check for obviously invalid token
    if (!sessionCookie.value || sessionCookie.value.length < 10) {
      console.error("Session cookie value is too short or empty")
      return null
    }

    const session = await verifyToken(sessionCookie.value)
    if (!session) {
      console.error("Failed to verify session token")
      return null
    }

    console.log("Session retrieved successfully for user:", session.email)
    return session
  } catch (error) {
    console.error("Error retrieving session:", error)
    return null
  }
}

// Get user role from JWT cookie
export async function getUserRole(): Promise<string | null> {
  const session = await getSession()
  return session?.role || null
}

// Add a new function to check if a user is authenticated for a specific role

// Authentication middleware with improved error handling and debugging
export async function requireAuth(redirectTo = "/auth/login") {
  const session = await getSession()
  if (!session) {
    console.log("No session found, redirecting to", redirectTo)
    redirect(redirectTo)
  }
  return session
}

// Role-based authentication middleware with improved logging
export async function requireRole(roles: UserRole[], redirectTo = "/auth/login") {
  const session = await getSession()

  if (!session) {
    console.log("No session found, redirecting to", redirectTo)
    redirect(redirectTo)
  }

  if (!roles.includes(session.role as UserRole)) {
    console.log(`User role ${session.role} not in allowed roles [${roles.join(", ")}], redirecting to ${redirectTo}`)
    redirect(redirectTo)
  }

  return session
}

// New function to check if token is valid without throwing errors
export async function isValidToken(token: string): Promise<boolean> {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return false
    }

    const secretKey = new TextEncoder().encode(JWT_SECRET)
    await jose.jwtVerify(token, secretKey)
    return true
  } catch (error) {
    return false
  }
}

// New function to clear invalid session
export function clearInvalidSession() {
  try {
    cookies().delete("session")
    return true
  } catch (error) {
    console.error("Error clearing session:", error)
    return false
  }
}
