import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

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

// Verify JWT token with improved error handling
async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    // Basic format validation before attempting verification
    if (!token || typeof token !== "string" || !token.includes(".")) {
      console.error("Invalid token format in middleware")
      return null
    }

    // Convert JWT_SECRET to Uint8Array for jose
    const secretKey = new TextEncoder().encode(JWT_SECRET)

    // Verify token with jose
    const { payload } = await jose.jwtVerify(token, secretKey)

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < currentTime) {
      console.error("Token expired:", payload.exp, "Current time:", currentTime)
      return null
    }

    // Ensure the payload has the required fields
    if (!payload.id || !payload.email || !payload.role) {
      console.error("Token payload missing required fields:", payload)
      return null
    }

    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      name: payload.name as string,
    }
  } catch (error) {
    console.error("Token verification error:", error)

    // Log additional debugging information
    if (error.code === "ERR_JWS_INVALID") {
      console.error("Invalid JWS format in middleware. Token might be corrupted.")
    }

    return null
  }
}

// Define protected paths that require authentication
const protectedPaths = [
  "/dashboard",
  "/dashboard/farmer",
  "/dashboard/farmer/analytics",
  "/dashboard/lender",
  "/dashboard/lender/approved-loans", // Make sure this path is included
  "/dashboard/admin",
]

// Check if a path is protected
function isProtectedPath(path: string): boolean {
  return protectedPaths.some((protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`))
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for static assets and API routes
  if (path.startsWith("/_next") || path.startsWith("/api/") || path.includes(".") || path === "/favicon.ico") {
    return NextResponse.next()
  }

  console.log("Middleware processing path:", path)

  // Only check authentication for protected paths
  if (!isProtectedPath(path)) {
    console.log("Non-protected path, allowing access:", path)
    return NextResponse.next()
  }

  console.log("Protected path, checking authentication:", path)

  // Check for session cookie
  const sessionCookie = request.cookies.get("session")
  if (!sessionCookie || !sessionCookie.value) {
    console.log("No session cookie, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Verify token
  const session = await verifyToken(sessionCookie.value)
  if (!session) {
    console.log("Invalid session token, redirecting to login and clearing cookie")

    // Create response with redirect
    const response = NextResponse.redirect(new URL("/auth/login", request.url))

    // Clear the invalid session cookie
    response.cookies.delete("session")

    return response
  }

  console.log("User authenticated:", { role: session.role, path })

  // Check role-specific paths
  if (path.startsWith("/dashboard/farmer") && session.role !== "farmer") {
    console.log("User is not a farmer, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (path.startsWith("/dashboard/lender") && session.role !== "lender") {
    console.log("User is not a lender, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (path.startsWith("/dashboard/admin") && session.role !== "admin") {
    console.log("User is not an admin, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If user is trying to access /dashboard, redirect to role-specific dashboard
  if (path === "/dashboard") {
    console.log("Redirecting to role-specific dashboard:", `/dashboard/${session.role}`)
    return NextResponse.redirect(new URL(`/dashboard/${session.role}`, request.url))
  }

  console.log("Access granted to dashboard:", path)

  // Add cache control headers to prevent caching
  const headers = new Headers(request.headers)
  headers.set("Cache-Control", "no-store, max-age=0")

  return NextResponse.next({
    request: {
      headers,
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
