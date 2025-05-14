import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getSession } from "@/lib/auth-utils"
import { updateFarmerWeatherData } from "@/utils/weather-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const addressId = searchParams.get("addressId")

    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if the address belongs to the current user
    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select("address_id")
      .eq("id", session.id)
      .single()

    if (farmerError || !farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 })
    }

    if (farmer.address_id !== addressId) {
      return NextResponse.json({ error: "Unauthorized access to address" }, { status: 403 })
    }

    // Get weather data
    const { data: weatherData, error: weatherError } = await supabase
      .from("weather_metrics")
      .select("*")
      .eq("address_id", addressId)
      .order("timestamp", { ascending: true })

    if (weatherError) {
      console.error("Error fetching weather data:", weatherError)
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }

    // If no data, try to fetch it
    if (!weatherData || weatherData.length === 0) {
      console.log("No weather data found, fetching new data...")
      const success = await updateFarmerWeatherData(session.id)

      if (!success) {
        return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
      }

      // Try to get the data again
      const { data: refreshedData, error: refreshError } = await supabase
        .from("weather_metrics")
        .select("*")
        .eq("address_id", addressId)
        .order("timestamp", { ascending: true })

      if (refreshError || !refreshedData || refreshedData.length === 0) {
        return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
      }

      return NextResponse.json({ data: refreshedData })
    }

    return NextResponse.json({ data: weatherData })
  } catch (error) {
    console.error("Error in weather forecast API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
