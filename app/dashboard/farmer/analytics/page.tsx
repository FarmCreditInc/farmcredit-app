import { Suspense } from "react"
import { cookies } from "next/headers"
import AnalyticsClient from "./client"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import * as jose from "jose"

export const dynamic = "force-dynamic"
export const revalidate = 0

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Verify JWT token directly
async function verifyToken(token: string) {
  try {
    // Convert JWT_SECRET to Uint8Array for jose
    const secretKey = new TextEncoder().encode(JWT_SECRET)

    // Verify token with jose
    const { payload } = await jose.jwtVerify(token, secretKey)

    return payload
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

async function getServerSession() {
  try {
    // Get the session cookie directly
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      console.error("No session cookie found")
      return null
    }

    // Verify the token directly instead of making an API call
    const payload = await verifyToken(sessionCookie)

    if (!payload) {
      console.error("Invalid token")
      return null
    }

    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as string,
      name: payload.name as string,
    }
  } catch (err) {
    console.error("Error getting user session:", err)
    return null
  }
}

async function getFarmData(userId: string) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Fetch farm performance data
    const { data: farmProductionData, error: farmError } = await supabase
      .from("farm_production")
      .select(`
        type, 
        expected_yield, 
        expected_harvest_date,
        farm_id,
        farms!inner(
          id,
          name,
          farmer_id
        )
      `)
      .eq("farms.farmer_id", userId)

    if (farmError) {
      console.error("Error fetching farm data:", farmError)
      throw farmError
    }

    // Format farm data for bar chart
    const formattedFarmData = farmProductionData.map((item) => ({
      name: item.type,
      yield: item.expected_yield,
      farm: item.farms.name,
      harvestDate: new Date(item.expected_harvest_date).toLocaleDateString(),
    }))

    return formattedFarmData
  } catch (error) {
    console.error("Error fetching farm data:", error)
    return []
  }
}

async function getFinancialData(userId: string) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Get all loan contracts for this farmer with their applications
    const { data: contracts, error: contractsError } = await supabase
      .from("loan_contract")
      .select(`
        id,
        amount_disbursed,
        interest_rate,
        loan_application!inner (
          id,
          farmer_id
        )
      `)
      .eq("loan_application.farmer_id", userId)

    if (contractsError) {
      console.error("Error fetching contracts:", contractsError)
      throw contractsError
    }

    // Calculate total disbursed including interest
    let totalDisbursed = 0
    let totalWithInterest = 0

    for (const contract of contracts || []) {
      const principal = contract.amount_disbursed || 0
      const interestRate = contract.interest_rate || 0
      const interest = principal * (interestRate / 100)

      totalDisbursed += principal
      totalWithInterest += principal + interest
    }

    // Get total repaid
    const { data: repaidData, error: repaidError } = await supabase.rpc("get_total_repaid_amount", {
      farmer_id: userId,
    })

    if (repaidError) {
      console.error("Error fetching repaid amount:", repaidError)
      throw repaidError
    }

    const totalRepaid = repaidData || 0
    // Calculate outstanding including interest
    const outstanding = Math.max(0, totalWithInterest - totalRepaid)

    return {
      disbursed: totalDisbursed,
      repaid: totalRepaid,
      outstanding: outstanding,
    }
  } catch (error) {
    console.error("Error fetching financial data:", error)
    return { disbursed: 0, repaid: 0, outstanding: 0 }
  }
}

async function getSeasonalData(userId: string) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Fetch seasonal yield forecast data
    const { data: seasonalYieldData, error: seasonalError } = await supabase
      .from("farm_production")
      .select(`
        expected_harvest_date, 
        expected_yield, 
        type,
        farm_id,
        farms!inner(
          id,
          farmer_id
        )
      `)
      .eq("farms.farmer_id", userId)
      .order("expected_harvest_date")

    if (seasonalError) {
      console.error("Error fetching seasonal data:", seasonalError)
      throw seasonalError
    }

    // Group by month and crop type
    const monthlyData = {}
    seasonalYieldData.forEach((item) => {
      const date = new Date(item.expected_harvest_date)
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {}
      }

      if (!monthlyData[monthYear][item.type]) {
        monthlyData[monthYear][item.type] = 0
      }

      monthlyData[monthYear][item.type] += item.expected_yield
    })

    // Convert to array format for chart
    const formattedSeasonalData = Object.keys(monthlyData).map((month) => {
      const entry = { month }
      Object.keys(monthlyData[month]).forEach((crop) => {
        entry[crop] = monthlyData[month][crop]
      })
      return entry
    })

    return formattedSeasonalData
  } catch (error) {
    console.error("Error fetching seasonal data:", error)
    return []
  }
}

async function getTotalFarms(userId: string) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Fetch total farms count
    const { data: farmsData, error: farmsError } = await supabase.from("farms").select("id").eq("farmer_id", userId)

    if (farmsError) {
      console.error("Error fetching farms count:", farmsError)
      throw farmsError
    }

    return farmsData ? farmsData.length : 0
  } catch (error) {
    console.error("Error fetching total farms:", error)
    return 0
  }
}

export default async function AnalyticsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/auth/login")
  }

  const userId = session.id

  // Fetch all data in parallel
  const [farmData, financialData, seasonalData, totalFarms] = await Promise.all([
    getFarmData(userId),
    getFinancialData(userId),
    getSeasonalData(userId),
    getTotalFarms(userId),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/farmer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">View insights and performance metrics for your farming operations</p>
        </div>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Loading Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <p className="text-muted-foreground">Loading your analytics data...</p>
              </div>
            </CardContent>
          </Card>
        }
      >
        <AnalyticsClient
          initialFarmData={farmData}
          initialFinancialData={financialData}
          initialSeasonalData={seasonalData}
          initialTotalFarms={totalFarms}
          userId={userId}
        />
      </Suspense>
    </div>
  )
}
