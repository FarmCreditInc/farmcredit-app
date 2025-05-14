"use server"

import { updateFarmerWeatherData } from "@/utils/weather-utils"

export async function refreshWeatherData(farmerId: string) {
  try {
    await updateFarmerWeatherData(farmerId)
    return { success: true }
  } catch (error) {
    console.error("Error refreshing weather data:", error)
    return { success: false, error: "Failed to refresh weather data" }
  }
}
