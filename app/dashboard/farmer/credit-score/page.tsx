import { Suspense } from "react"
import { createClient } from "@/lib/supabase-server"
import { getSession } from "@/lib/auth-utils"
import { CreditScoreClient } from "./credit-score-client"
import { LoadingPane } from "@/components/loading-pane"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CreditScorePage() {
  const session = await getSession()

  if (!session || !session.id) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Error</h2>
        <p>Unable to retrieve your session. Please try signing in again.</p>
      </div>
    )
  }

  const supabase = createClient()

  // Get farmer data
  const { data: farmer, error: farmerError } = await supabase.from("farmers").select("*").eq("id", session.id).single()

  if (farmerError) {
    console.error("Error fetching farmer data:", farmerError)
    return (
      <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Data Error</h2>
        <p>Unable to retrieve your farmer profile. Please try again later.</p>
      </div>
    )
  }

  // Get credit score history
  const { data: creditScores, error: creditScoreError } = await supabase
    .from("credit_scores")
    .select("*")
    .eq("farmer_id", session.id)
    .order("created_at", { ascending: false })
    .limit(5)

  if (creditScoreError) {
    console.error("Error fetching credit scores:", creditScoreError)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Credit Score</h1>
        <p className="text-muted-foreground">View and manage your creditworthiness on the FarmCredit platform</p>
      </div>

      <Suspense fallback={<LoadingPane />}>
        <CreditScoreClient farmer={farmer} creditScores={creditScores || []} />
      </Suspense>
    </div>
  )
}
