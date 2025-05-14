import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Ruler } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase-server"
import { getSession } from "@/lib/auth-utils"
import { AddProductionDialog } from "@/components/dashboard/farm/add-production-dialog"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FarmDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session || !session.id) {
    notFound()
  }

  const supabase = createClient()

  // Get farm details
  const { data: farm, error: farmError } = await supabase
    .from("farms")
    .select("*")
    .eq("id", params.id)
    .eq("farmer_id", session.id)
    .single()

  if (farmError || !farm) {
    notFound()
  }

  // Get production activities
  const { data: productions, error: productionsError } = await supabase
    .from("farm_production")
    .select("*")
    .eq("farm_id", params.id)
    .order("created_at", { ascending: false })

  if (productionsError) {
    console.error("Error fetching production activities:", productionsError.message)
  }

  const farmName = farm.name || `Farm ${farm.id.substring(0, 8)}`
  const formattedDate = new Date(farm.start_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/farmer/farms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{farmName}</h1>
        </div>
        <AddProductionDialog farmId={farm.id} farmName={farmName} />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="p-0">
            <div className="relative w-full aspect-video">
              {farm.photo ? (
                <Image src={farm.photo || "/placeholder.svg"} alt={farmName} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold">Farm Details</h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-center text-sm">
                  <Ruler className="h-4 w-4 mr-2" />
                  <span>
                    {farm.size} {farm.size_units}
                  </span>
                </div>
                {farm.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{farm.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Started {formattedDate}</span>
                </div>
                {farm.number_of_harvests && (
                  <div className="text-sm mt-2">
                    <span className="font-medium">Number of Harvests:</span> {farm.number_of_harvests}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Activities</TabsTrigger>
                <TabsTrigger value="crops">Crops</TabsTrigger>
                <TabsTrigger value="livestock">Livestock</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ProductionActivitiesList productions={productions || []} />
              </TabsContent>

              <TabsContent value="crops">
                <ProductionActivitiesList productions={(productions || []).filter((p) => p.category === "crop")} />
              </TabsContent>

              <TabsContent value="livestock">
                <ProductionActivitiesList productions={(productions || []).filter((p) => p.category === "livestock")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProductionActivitiesList({ productions }: { productions: any[] }) {
  if (productions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-xl font-medium mb-2">No production activities yet</h3>
        <p className="text-muted-foreground mb-6">Add your first production activity to start tracking</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {productions.map((production) => (
        <Card key={production.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{production.type}</h3>
                <p className="text-sm text-muted-foreground capitalize">{production.category}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {production.expected_yield} {production.expected_yield_unit}
                </p>
                <p className="text-sm text-muted-foreground">
                  ₦{production.expected_unit_profit}/{production.expected_yield_unit}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {production.crop_plant_date && (
                <div>
                  <span className="font-medium">Plant Date:</span>{" "}
                  {new Date(production.crop_plant_date).toLocaleDateString()}
                </div>
              )}
              <div>
                <span className="font-medium">Harvest Date:</span>{" "}
                {new Date(production.expected_harvest_date).toLocaleDateString()}
              </div>

              {production.financiers && (
                <div className="col-span-2">
                  <span className="font-medium">Financiers:</span> {production.financiers}
                </div>
              )}

              {production.notes && (
                <div className="col-span-2 mt-2">
                  <span className="font-medium">Notes:</span> {production.notes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
