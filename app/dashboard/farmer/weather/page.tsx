import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Cloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase-server"
import { getSession } from "@/lib/auth-utils"
import { updateFarmerWeatherData } from "@/utils/weather-utils"
import WeatherDashboard from "./weather-dashboard"

export default async function WeatherForecastPage() {
  const session = await getSession()

  if (!session) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/farmer">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weather Forecast</h1>
            <p className="text-muted-foreground">Weather conditions for your farm location</p>
          </div>
        </div>

        <div className="rounded-lg border p-8 text-center">
          <p>Please sign in to view weather forecast</p>
        </div>
      </div>
    )
  }

  // Get the farmer's address
  const supabase = createClient()
  const { data: farmer } = await supabase.from("farmers").select("address_id").eq("id", session.id).single()

  if (!farmer?.address_id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/farmer">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weather Forecast</h1>
            <p className="text-muted-foreground">Weather conditions for your farm location</p>
          </div>
        </div>

        <div className="rounded-lg border p-8 text-center">
          <p>Please update your address in settings to view weather forecast</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/farmer/settings">Go to Settings</Link>
          </Button>
        </div>
      </div>
    )
  }

  try {
    // Check if we have weather data
    const { data: weatherData } = await supabase
      .from("weather_metrics")
      .select("*")
      .eq("address_id", farmer.address_id)
      .order("timestamp", { ascending: true })
      .limit(1)

    // If no weather data, fetch it
    if (!weatherData || weatherData.length === 0) {
      console.log("No weather data found, fetching new data...")
      await updateFarmerWeatherData(session.id)
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/farmer">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weather Forecast</h1>
            <p className="text-muted-foreground">Weather conditions for your farm location</p>
          </div>
        </div>

        <Suspense fallback={<WeatherSkeleton />}>
          <WeatherDashboard farmerId={session.id} addressId={farmer.address_id} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error loading weather page:", error)

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/farmer">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weather Forecast</h1>
            <p className="text-muted-foreground">Weather conditions for your farm location</p>
          </div>
        </div>

        <div className="rounded-lg border p-8 text-center">
          <Cloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-2 text-xl font-semibold">Weather data unavailable</h2>
          <p className="mt-1 text-muted-foreground">
            We're having trouble retrieving weather data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}

function WeatherSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-12 w-24" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-1 h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center rounded-lg border p-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="mt-2 h-4 w-16" />
              <Skeleton className="mt-1 h-5 w-12" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-[400px] w-full rounded-lg" />

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    </div>
  )
}
