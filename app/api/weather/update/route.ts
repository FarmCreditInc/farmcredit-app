import { NextResponse } from "next/server"
import { updateFarmerWeatherData } from "@/utils/weather-utils"
import { getSession } from "@/lib/auth-utils"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await updateFarmerWeatherData(session.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to update weather data" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in weather update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
