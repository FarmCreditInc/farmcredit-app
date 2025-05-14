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
    const today = new Date()
    const twoWeeksFromNow = new Date()
    twoWeeksFromNow.setDate(today.getDate() + 14)

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(today.getDate() - 7)

    // First get all farms for this farmer
    const { data: farms, error: farmsError } = await supabase
      .from("farms")
      .select("id, name, location, size, size_units")
      .eq("farmer_id", userId)

    if (farmsError) {
      console.error("Error fetching farms:", farmsError)
      return NextResponse.json({ error: "Database Error", message: "Failed to fetch farms" }, { status: 500 })
    }

    if (!farms || farms.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const farmIds = farms.map((farm) => farm.id)

    // Get farm production data with upcoming harvest dates
    const { data: harvestData, error: harvestError } = await supabase
      .from("farm_production")
      .select("id, farm_id, type, expected_harvest_date")
      .in("farm_id", farmIds)
      .gte("expected_harvest_date", today.toISOString())
      .lte("expected_harvest_date", twoWeeksFromNow.toISOString())
      .order("expected_harvest_date", { ascending: true })

    if (harvestError) {
      console.error("Error fetching harvest data:", harvestError)
      return NextResponse.json({ error: "Database Error", message: "Failed to fetch harvest data" }, { status: 500 })
    }

    // Get farm production data with recent or upcoming planting dates
    const { data: plantingData, error: plantingError } = await supabase
      .from("farm_production")
      .select("id, farm_id, type, crop_plant_date")
      .in("farm_id", farmIds)
      .gte("crop_plant_date", oneWeekAgo.toISOString())
      .lte("crop_plant_date", twoWeeksFromNow.toISOString())
      .order("crop_plant_date", { ascending: true })

    if (plantingError) {
      console.error("Error fetching planting data:", plantingError)
      return NextResponse.json({ error: "Database Error", message: "Failed to fetch planting data" }, { status: 500 })
    }

    // Create milestone tasks
    const milestones = []

    // Add harvest milestones
    for (const harvest of harvestData || []) {
      const farm = farms.find((f) => f.id === harvest.farm_id)
      const daysToHarvest = Math.ceil(
        (new Date(harvest.expected_harvest_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )

      milestones.push({
        id: `harvest-${harvest.id}`,
        farmId: harvest.farm_id,
        title: "Upcoming Harvest",
        description: `${harvest.type} harvest on ${farm?.name} in ${daysToHarvest} days`,
        date: harvest.expected_harvest_date,
        priority: daysToHarvest <= 7 ? "high" : "medium",
        details: {
          farmName: farm?.name,
          location: farm?.location,
          cropType: harvest.type,
          harvestDate: harvest.expected_harvest_date,
          daysToHarvest: daysToHarvest,
          taskType: "harvest",
        },
      })
    }

    // Add planting-related milestones
    for (const planting of plantingData || []) {
      const farm = farms.find((f) => f.id === planting.farm_id)
      const plantDate = new Date(planting.crop_plant_date)
      const daysDiff = Math.ceil((plantDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      let title, description, priority, taskType

      if (daysDiff < 0) {
        // Recently planted
        title = "Recent Planting"
        description = `${planting.type} planted on ${farm?.name} ${Math.abs(daysDiff)} days ago - Consider fertilizer application`
        priority = "medium"
        taskType = "fertilizer"
      } else {
        // Upcoming planting
        title = "Upcoming Planting"
        description = `${planting.type} planting on ${farm?.name} in ${daysDiff} days - Prepare soil and seeds`
        priority = daysDiff <= 3 ? "high" : "medium"
        taskType = "planting"
      }

      milestones.push({
        id: `planting-${planting.id}`,
        farmId: planting.farm_id,
        title,
        description,
        date: planting.crop_plant_date,
        priority,
        details: {
          farmName: farm?.name,
          location: farm?.location,
          cropType: planting.type,
          plantDate: planting.crop_plant_date,
          daysDiff: daysDiff,
          taskType: taskType,
        },
      })
    }

    return NextResponse.json({ success: true, data: milestones })
  } catch (error) {
    console.error("Error in farming-milestones API:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch farming milestones" },
      { status: 500 },
    )
  }
}
