import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import SettingsClient from "./client"
import { getSession } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  // Get the user session using the custom JWT
  const session = await getSession()

  if (!session || session.role !== "farmer") {
    redirect("/auth/login")
  }

  // Fetch farmer data using the session ID
  const { data: farmerData, error } = await supabaseAdmin
    .from("farmers")
    .select("*, address:address_id(*)")
    .eq("id", session.id)
    .single()

  if (error) {
    console.error("Error fetching farmer data:", error)
    // We'll handle this in the client component
  }

  // Fetch next of kin data if farmer data exists
  let nextOfKinData = null
  if (farmerData) {
    const { data: nextOfKin, error: nextOfKinError } = await supabaseAdmin
      .from("farmer_next_of_kin")
      .select("*")
      .eq("farmer_id", session.id)
      .single()

    if (!nextOfKinError) {
      nextOfKinData = nextOfKin
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your profile data...</p>
          </div>
        </div>
      }
    >
      <SettingsClient
        initialFarmerData={farmerData || null}
        initialNextOfKinData={nextOfKinData}
        userId={session.id}
        userEmail={session.email}
      />
    </Suspense>
  )
}
