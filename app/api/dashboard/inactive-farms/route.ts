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

  if (!userId || userRole !== "farmer") {
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

    // Get all farms for this farmer
    const { data: farms, error: farmsError } = await supabase
      .from("farms")
      .select("id, name, location, size, size_units, created_at")
      .eq("farmer_id", userId)

    if (farmsError) {
      console.error("Error fetching farms:", farmsError)
      return NextResponse.json({ error: "Database Error", message: "Failed to fetch farms" }, { status: 500 })
    }

    if (!farms || farms.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // For each farm, check if it has any production data
    const inactiveFarms = []

    for (const farm of farms) {
      const { count, error: productionError } = await supabase
        .from("farm_production")
        .select("*", { count: "exact", head: true })
        .eq("farm_id", farm.id)

      if (productionError) {
        console.error(`Error checking production for farm ${farm.id}:`, productionError)
        continue
      }

      if (!count || count === 0) {
        // Get farmer's crop types
        const { data: farmer, error: farmerError } = await supabase
          .from("farmers")
          .select("crop_types")
          .eq("id", userId)
          .single()

        if (farmerError) {
          console.error("Error fetching farmer crop types:", farmerError)
        }

        inactiveFarms.push({
          id: farm.id,
          name: farm.name,
          location: farm.location,
          size: farm.size,
          size_units: farm.size_units,
          created_at: farm.created_at,
          details: {
            cropTypes: farmer?.crop_types ? farmer.crop_types.split(",") : [],
            lastActivity: farm.created_at,
            recommendations: [
              "Add production data to track farm performance",
              "Update farm details with current crop status",
              "Consider adding irrigation information",
            ],
          },
        })
      }
    }

    return NextResponse.json({ success: true, data: inactiveFarms })
  } catch (error) {
    console.error("Error in inactive-farms API:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch inactive farms" },
      { status: 500 },
    )
  }
}
