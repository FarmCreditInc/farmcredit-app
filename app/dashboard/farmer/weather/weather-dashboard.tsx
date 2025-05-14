"use client"

import { useEffect, useState, useTransition } from "react"
import { Cloud, CloudRain, Droplets, Thermometer, Wind } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LineChart, BarChart } from "@/components/ui/charts"
import { Button } from "@/components/ui/button"
import { refreshWeatherData } from "@/actions/weather-actions"
import { WeatherAnimation } from "@/components/dashboard/weather-animation"

type WeatherData = {
  id: string
  address_id: string
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

export default function WeatherDashboard({ farmerId, addressId }: { farmerId: string; addressId: string }) {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [currentDate] = useState(new Date())

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/weather/forecast?addressId=${addressId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch weather data: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setWeatherData(data.data || [])
      } catch (err) {
        console.error("Error fetching weather data:", err)
        setError(err instanceof Error ? err.message : "Failed to load weather data")
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [addressId])

  const handleRefreshWeather = () => {
    startTransition(async () => {
      try {
        const result = await refreshWeatherData(farmerId)
        if (!result.success) {
          setError(result.error || "Failed to refresh weather data")
          return
        }

        // Refetch the weather data
        const response = await fetch(`/api/weather/forecast?addressId=${addressId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch weather data: ${response.statusText}`)
        }

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }

        setWeatherData(data.data || [])
        setError(null)
      } catch (err) {
        console.error("Error refreshing weather data:", err)
        setError(err instanceof Error ? err.message : "Failed to refresh weather data")
      }
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading weather data...</div>
  }

  if (error) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <Cloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-2 text-xl font-semibold">Weather data unavailable</h2>
        <p className="mt-1 text-muted-foreground">{error}</p>
        <Button onClick={handleRefreshWeather} disabled={isPending} className="mt-4">
          {isPending ? "Refreshing..." : "Refresh Weather Data"}
        </Button>
      </div>
    )
  }

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <Cloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-2 text-xl font-semibold">No weather data available</h2>
        <p className="mt-1 text-muted-foreground">
          Please click the button below to fetch weather data for your location.
        </p>
        <Button onClick={handleRefreshWeather} disabled={isPending} className="mt-4">
          {isPending ? "Refreshing..." : "Refresh Weather Data"}
        </Button>
      </div>
    )
  }

  // Format the current date for display
  const formattedCurrentDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get current weather (most recent data point)
  // Sort data by timestamp (newest first for current day data)
  const sortedData = [...weatherData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const currentWeather = sortedData[0]

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if we have data for today
  const hasCurrentDayData = sortedData.some((data) => {
    const dataDate = new Date(data.timestamp)
    dataDate.setHours(0, 0, 0, 0)
    return dataDate.getTime() === today.getTime()
  })

  // If no current day data, show a message
  if (!hasCurrentDayData) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border p-8 text-center">
          <Cloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-2 text-xl font-semibold">Weather data needs to be updated</h2>
          <p className="mt-1 text-muted-foreground">
            We don't have weather data for today. Please click the button below to get the latest forecast.
          </p>
          <Button onClick={handleRefreshWeather} disabled={isPending} className="mt-4">
            {isPending ? "Refreshing..." : "Refresh Weather Data"}
          </Button>
        </div>
      </div>
    )
  }

  // Generate the next 5 days starting from today
  const nextFiveDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      date,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      fullDay: date.toLocaleDateString("en-US", { weekday: "long" }),
      dateString: date.toISOString().split("T")[0], // YYYY-MM-DD format
    }
  })

  // Group forecast data by day using the timestamp from the data
  const dailyForecasts = weatherData.reduce(
    (acc, data) => {
      const date = new Date(data.timestamp)
      const dateString = date.toISOString().split("T")[0] // YYYY-MM-DD format

      if (!acc[dateString]) {
        acc[dateString] = []
      }

      acc[dateString].push(data)
      return acc
    },
    {} as Record<string, WeatherData[]>,
  )

  // Calculate daily averages for the forecast
  const dailyAverages = nextFiveDays.map((dayInfo) => {
    const forecasts = dailyForecasts[dayInfo.dateString] || []

    // If no data for this day, create default values
    if (forecasts.length === 0) {
      return {
        day: dayInfo.day,
        fullDay: dayInfo.fullDay,
        date: dayInfo.date,
        avgTemp: 25,
        maxTemp: 28,
        minTemp: 22,
        totalPrecip: 0,
        avgWind: 5,
        condition: "sunny",
        weatherCondition: "sunny",
        hasData: false,
      }
    }

    const avgTemp = forecasts.reduce((sum, f) => sum + f.temperature, 0) / forecasts.length
    const maxTemp = Math.max(...forecasts.map((f) => f.temperature))
    const minTemp = Math.min(...forecasts.map((f) => f.temperature))
    const totalPrecip = forecasts.reduce((sum, f) => sum + f.precipitation, 0)
    const avgWind = forecasts.reduce((sum, f) => sum + f.wind_speed, 0) / forecasts.length
    const avgHumidity = forecasts.reduce((sum, f) => sum + f.relative_humidity, 0) / forecasts.length

    // Determine weather condition
    let condition = "sunny"

    if (totalPrecip > 5) {
      condition = "rainy"
    } else if (totalPrecip > 0) {
      condition = "drizzle"
    } else if (avgWind > 20) {
      condition = "windy"
    } else if (forecasts[0].sea_level_pressure < 1000) {
      condition = "cloudy"
    } else if (avgHumidity > 80) {
      condition = "humid"
    } else if (avgHumidity < 30) {
      condition = "dry"
    }

    return {
      day: dayInfo.day,
      fullDay: dayInfo.fullDay,
      date: dayInfo.date,
      avgTemp,
      maxTemp,
      minTemp,
      totalPrecip,
      avgWind,
      condition,
      weatherCondition: condition,
      hasData: true,
    }
  })

  // Prepare data for charts
  const temperatureData = weatherData.map((data) => ({
    day: new Date(data.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    temperature: data.temperature,
    soil_temperature: data.soil_temperature_0_7cm,
  }))

  const precipitationData = weatherData.map((data) => ({
    day: new Date(data.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    precipitation: data.precipitation,
  }))

  const soilData = weatherData.map((data) => ({
    day: new Date(data.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    moisture: data.soil_moisture_0_7cm,
    temperature: data.soil_temperature_0_7cm,
  }))

  // Determine weather condition for animation
  let weatherCondition = "default"
  if (currentWeather.precipitation > 5) {
    weatherCondition = "rainy"
  } else if (currentWeather.precipitation > 0) {
    weatherCondition = "drizzle"
  } else if (currentWeather.wind_speed > 20) {
    weatherCondition = "windy"
  } else if (currentWeather.sea_level_pressure < 1000) {
    weatherCondition = "cloudy"
  } else if (currentWeather.relative_humidity > 80) {
    weatherCondition = "humid"
  } else if (currentWeather.relative_humidity < 30) {
    weatherCondition = "dry"
  } else {
    weatherCondition = "sunny"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleRefreshWeather} disabled={isPending} size="sm" variant="outline">
          {isPending ? "Refreshing..." : "Refresh Weather Data"}
        </Button>
      </div>

      {/* Current Weather Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-sm text-muted-foreground">{formattedCurrentDate}</p>
              <h2 className="text-3xl font-bold">{Math.round(currentWeather.temperature)}°C</h2>
              <p className="text-sm text-muted-foreground">Feels like {Math.round(currentWeather.temperature - 2)}°C</p>
            </div>
            <div className="flex items-center space-x-4">
              <WeatherAnimation condition={weatherCondition as any} />
              <div>
                <p className="font-medium">
                  {currentWeather.precipitation > 5
                    ? "Rainy"
                    : currentWeather.precipitation > 0
                      ? "Drizzle"
                      : currentWeather.wind_speed > 20
                        ? "Windy"
                        : currentWeather.sea_level_pressure < 1000
                          ? "Cloudy"
                          : currentWeather.relative_humidity > 80
                            ? "Humid"
                            : currentWeather.relative_humidity < 30
                              ? "Dry"
                              : "Sunny"}
                </p>
                <p className="text-sm text-muted-foreground">Wind: {currentWeather.wind_speed} km/h</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg border p-3">
              <Thermometer className="h-6 w-6 text-orange-500" />
              <p className="mt-1 text-xs text-muted-foreground">Temperature</p>
              <p className="font-medium">{Math.round(currentWeather.temperature)}°C</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-3">
              <Wind className="h-6 w-6 text-blue-500" />
              <p className="mt-1 text-xs text-muted-foreground">Wind Speed</p>
              <p className="font-medium">{currentWeather.wind_speed} km/h</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-3">
              <CloudRain className="h-6 w-6 text-blue-500" />
              <p className="mt-1 text-xs text-muted-foreground">Precipitation</p>
              <p className="font-medium">{currentWeather.precipitation} mm</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-3">
              <Droplets className="h-6 w-6 text-blue-500" />
              <p className="mt-1 text-xs text-muted-foreground">Soil Moisture</p>
              <p className="font-medium">{Math.round(currentWeather.soil_moisture_0_7cm)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Tabs */}
      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList className="flex w-full flex-wrap justify-start overflow-x-auto">
          <TabsTrigger value="forecast">5-Day Forecast</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
          <TabsTrigger value="soil">Soil Conditions</TabsTrigger>
        </TabsList>

        {/* 5-Day Forecast */}
        <TabsContent value="forecast" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {dailyAverages.map((forecast, index) => (
              <Card key={index}>
                <CardHeader className="pb-2 text-center">
                  <CardTitle>{forecast.day}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-2">
                  <WeatherAnimation condition={forecast.weatherCondition as any} className="h-16 w-16" />
                  <p className="font-medium">{Math.round(forecast.avgTemp)}°C</p>
                  <div className="flex w-full justify-between text-xs text-muted-foreground">
                    <span>H: {Math.round(forecast.maxTemp)}°</span>
                    <span>L: {Math.round(forecast.minTemp)}°</span>
                  </div>
                  <p className="text-xs text-center capitalize">{forecast.weatherCondition.replace("-", " ")}</p>
                  <p className="text-xs text-center text-muted-foreground">
                    {forecast.hasData ? `Rain: ${forecast.totalPrecip.toFixed(1)}mm` : "No data available"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Temperature Chart */}
        <TabsContent value="temperature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Trends</CardTitle>
              <CardDescription>Temperature data for the forecast period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
                <LineChart
                  data={temperatureData}
                  lines={[
                    { key: "temperature", label: "Air Temperature (°C)", color: "#f59e0b" },
                    { key: "soil_temperature", label: "Soil Temperature (°C)", color: "#84cc16" },
                  ]}
                  xAxis="day"
                  yAxisUnit="°C"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Precipitation Chart */}
        <TabsContent value="precipitation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Precipitation</CardTitle>
              <CardDescription>Rainfall data for the forecast period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
                <BarChart data={precipitationData} xAxis="day" yAxis="precipitation" color="#3b82f6" yAxisUnit="mm" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Soil Conditions Chart */}
        <TabsContent value="soil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Soil Conditions</CardTitle>
              <CardDescription>Soil moisture and temperature data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
                <LineChart
                  data={soilData}
                  lines={[
                    { key: "moisture", label: "Soil Moisture (%)", color: "#3b82f6" },
                    { key: "temperature", label: "Soil Temperature (°C)", color: "#f59e0b" },
                  ]}
                  xAxis="day"
                  yAxisUnit=""
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weather Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Insights</CardTitle>
          <CardDescription>How weather affects your farming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Crop Recommendations</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {currentWeather.precipitation > 2
                ? "With the current rainfall, focus on drainage to prevent waterlogging. Consider delaying any new planting until conditions improve."
                : "Current weather conditions are favorable for planting. Crops like maize, cassava, and vegetables would thrive well."}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Irrigation Planning</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {dailyAverages.slice(0, 3).some((day) => day.totalPrecip > 5)
                ? "With the forecasted precipitation levels, you may need to reduce irrigation in the coming days."
                : "With limited rainfall expected, plan your irrigation schedule to maintain optimal soil moisture levels."}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Pest & Disease Alert</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {currentWeather.relative_humidity > 75 && currentWeather.temperature > 25
                ? "The current high humidity and temperature conditions increase the risk of fungal diseases. Consider preventive measures and monitor your crops closely."
                : "Current conditions have a lower risk for common pests and diseases. Continue regular monitoring as part of good practice."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
