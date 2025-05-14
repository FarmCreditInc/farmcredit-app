import { createClient } from "@/lib/supabase-server"

type WeatherData = {
  timestamp: string
  temperature: number
  sea_level_pressure: number
  precipitation: number
  wind_direction: string
  wind_speed: number
  relative_humidity: number
  soil_temperature_0_7cm: number
  soil_moisture_0_7cm: number
  dew_point_temperature: number
  wind_speed_100m: number
  forecast_type: string
}

/**
 * Fetches weather data from meteoblue API for a specific location
 */
export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData[]> {
  try {
    const apiKey = process.env.METEOBLUE_API_KEY
    if (!apiKey) {
      throw new Error("METEOBLUE_API_KEY is not defined in environment variables")
    }

    const url = `https://my.meteoblue.com/packages/basic-day?apikey=${apiKey}&lat=${latitude}&lon=${longitude}&asl=11&format=json`

    console.log(`Fetching weather data for lat: ${latitude}, lon: ${longitude}`)

    const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API response error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Failed to fetch weather data: ${response.statusText}`)
    }

    const data = await response.json()

    // Log the structure of the response for debugging
    console.log("API response structure:", JSON.stringify(Object.keys(data), null, 2))

    if (!data.data_day) {
      console.error("Invalid API response - missing data_day:", JSON.stringify(data, null, 2))
      throw new Error("Invalid API response format: missing data_day")
    }

    // Transform the API response into our database schema format
    return transformWeatherData(data)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}

/**
 * Transforms the meteoblue API response into our database schema format
 */
function transformWeatherData(apiData: any): WeatherData[] {
  const weatherData: WeatherData[] = []

  try {
    if (!apiData.data_day) {
      throw new Error("Invalid API response format: missing data_day")
    }

    const dataDay = apiData.data_day

    // Check if all required fields exist
    const requiredFields = [
      "time",
      "temperature_mean",
      "precipitation", // Changed from precipitation_sum to precipitation
      "windspeed_mean",
      "winddirection_dominant" in dataDay ? "winddirection_dominant" : "winddirection", // Check both possible field names
      "relativehumidity_mean",
    ]

    for (const field of requiredFields) {
      if (!dataDay[field] || !Array.isArray(dataDay[field]) || dataDay[field].length === 0) {
        console.error(`Missing or invalid field in API response: ${field}`, dataDay[field])
        throw new Error(`Invalid API response format: missing or invalid ${field}`)
      }
    }

    // Get the correct wind direction field name
    const windDirectionField = "winddirection_dominant" in dataDay ? "winddirection_dominant" : "winddirection"

    const {
      time,
      temperature_max = [],
      temperature_mean,
      temperature_min = [],
      precipitation_probability = [],
      precipitation, // Changed from precipitation_sum to precipitation
      windspeed_max = [],
      windspeed_mean,
      relativehumidity_mean,
      sealevelpressure_mean = [],
    } = dataDay

    // Create a data point for each day in the forecast
    for (let i = 0; i < time.length; i++) {
      const timestamp = new Date(time[i])

      // Use default values for missing data
      const tempMean = temperature_mean[i] || 25
      const tempMin = temperature_min[i] || tempMean - 5
      const pressureMean = sealevelpressure_mean[i] || 1013
      const precipAmount = precipitation[i] || 0 // Changed from precipitation_sum to precipitation
      const windDir = dataDay[windDirectionField][i]?.toString() || "N"
      const windSpeed = windspeed_mean[i] || 0
      const humidity = relativehumidity_mean[i] || 50
      const windSpeedMax = windspeed_max[i] || windSpeed + 5

      weatherData.push({
        timestamp: timestamp.toISOString(),
        temperature: tempMean,
        sea_level_pressure: pressureMean,
        precipitation: precipAmount,
        wind_direction: windDir,
        wind_speed: windSpeed,
        relative_humidity: humidity,
        // These fields might not be directly available from the basic-day package
        soil_temperature_0_7cm: tempMin, // Approximation
        soil_moisture_0_7cm: humidity * 0.8, // Approximation
        dew_point_temperature: calculateDewPoint(tempMean, humidity),
        wind_speed_100m: windSpeedMax, // Approximation
        forecast_type: "daily",
      })
    }

    return weatherData
  } catch (error) {
    console.error("Error transforming weather data:", error)

    // Return a single default weather data point if transformation fails
    return [
      {
        timestamp: new Date().toISOString(),
        temperature: 25,
        sea_level_pressure: 1013,
        precipitation: 0,
        wind_direction: "N",
        wind_speed: 5,
        relative_humidity: 50,
        soil_temperature_0_7cm: 22,
        soil_moisture_0_7cm: 40,
        dew_point_temperature: 15,
        wind_speed_100m: 8,
        forecast_type: "default",
      },
    ]
  }
}

/**
 * Calculate dew point temperature using temperature and relative humidity
 */
function calculateDewPoint(temperature: number, relativeHumidity: number): number {
  try {
    // Magnus formula for dew point calculation
    const a = 17.27
    const b = 237.7

    const alpha = (a * temperature) / (b + temperature) + Math.log(relativeHumidity / 100)
    const dewPoint = (b * alpha) / (a - alpha)

    return Math.round(dewPoint * 10) / 10 // Round to 1 decimal place
  } catch (error) {
    console.error("Error calculating dew point:", error)
    return temperature - 10 // Fallback approximation
  }
}

/**
 * Stores weather data in the database for a specific address
 */
export async function storeWeatherData(addressId: string, weatherData: WeatherData[]): Promise<void> {
  const supabase = createClient()

  for (const data of weatherData) {
    try {
      // First try to insert the data
      const { error: insertError } = await supabase.from("weather_metrics").insert({
        address_id: addressId,
        timestamp: data.timestamp,
        temperature: data.temperature,
        sea_level_pressure: data.sea_level_pressure,
        precipitation: data.precipitation,
        wind_direction: data.wind_direction,
        wind_speed: data.wind_speed,
        relative_humidity: data.relative_humidity,
        soil_temperature_0_7cm: data.soil_temperature_0_7cm,
        soil_moisture_0_7cm: data.soil_moisture_0_7cm,
        dew_point_temperature: data.dew_point_temperature,
        wind_speed_100m: data.wind_speed_100m,
        forecast_type: data.forecast_type,
      })

      // If insert fails due to duplicate, try to update
      if (insertError && insertError.code === "23505") {
        // PostgreSQL unique violation code
        const { error: updateError } = await supabase
          .from("weather_metrics")
          .update({
            temperature: data.temperature,
            sea_level_pressure: data.sea_level_pressure,
            precipitation: data.precipitation,
            wind_direction: data.wind_direction,
            wind_speed: data.wind_speed,
            relative_humidity: data.relative_humidity,
            soil_temperature_0_7cm: data.soil_temperature_0_7cm,
            soil_moisture_0_7cm: data.soil_moisture_0_7cm,
            dew_point_temperature: data.dew_point_temperature,
            wind_speed_100m: data.wind_speed_100m,
            forecast_type: data.forecast_type,
          })
          .eq("address_id", addressId)
          .eq("timestamp", data.timestamp)

        if (updateError) {
          console.error("Error updating weather data:", updateError)
        }
      } else if (insertError) {
        console.error("Error inserting weather data:", insertError)
      }
    } catch (error) {
      console.error("Error storing weather data:", error)
    }
  }
}

/**
 * Fetches and updates weather data for a specific farmer
 */
export async function updateFarmerWeatherData(farmerId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Get the farmer's address
    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select("address_id")
      .eq("id", farmerId)
      .single()

    if (farmerError || !farmer?.address_id) {
      console.error("Error fetching farmer address:", farmerError)
      return false
    }

    // Get the address details with coordinates
    const { data: address, error: addressError } = await supabase
      .from("address")
      .select("*")
      .eq("id", farmer.address_id)
      .single()

    if (addressError || !address) {
      console.error("Error fetching address:", addressError)
      return false
    }

    // Check if we have coordinates
    if (!address.latitude || !address.longitude) {
      console.error("Address does not have coordinates")

      // Use default coordinates for Nigeria (center of the country)
      const defaultLat = 9.082
      const defaultLon = 8.6753

      console.log(`Using default coordinates: lat ${defaultLat}, lon ${defaultLon}`)

      // Fetch weather data with default coordinates
      const weatherData = await fetchWeatherData(defaultLat, defaultLon)

      // Store weather data
      await storeWeatherData(address.id, weatherData)

      return true
    }

    // Fetch weather data with the address coordinates
    console.log(`Using address coordinates: lat ${address.latitude}, lon ${address.longitude}`)
    const weatherData = await fetchWeatherData(address.latitude, address.longitude)

    // Store weather data
    await storeWeatherData(address.id, weatherData)

    return true
  } catch (error) {
    console.error("Error updating farmer weather data:", error)

    // Create a default weather entry if everything fails
    try {
      const supabase = createClient()

      // Get the farmer's address
      const { data: farmer } = await supabase.from("farmers").select("address_id").eq("id", farmerId).single()

      if (farmer?.address_id) {
        const defaultWeatherData = [
          {
            timestamp: new Date().toISOString(),
            temperature: 25,
            sea_level_pressure: 1013,
            precipitation: 0,
            wind_direction: "N",
            wind_speed: 5,
            relative_humidity: 50,
            soil_temperature_0_7cm: 22,
            soil_moisture_0_7cm: 40,
            dew_point_temperature: 15,
            wind_speed_100m: 8,
            forecast_type: "default",
          },
        ]

        await storeWeatherData(farmer.address_id, defaultWeatherData)
        return true
      }
    } catch (fallbackError) {
      console.error("Error creating fallback weather data:", fallbackError)
    }

    return false
  }
}
