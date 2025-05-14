import { requireRole } from "@/lib/auth-utils"
import { PendingApplicationsList } from "@/components/dashboard/pending-applications-list"
import { supabaseAdmin } from "@/lib/supabase-admin"

export default async function PendingApplicationsPage() {
  await requireRole(["lender"])

  // Fetch applications server-side to improve initial load
  try {
    // First, get the loan applications with farmer details
    const { data: loanApplications, error: loanAppError } = await supabaseAdmin
      .from("loan_application")
      .select(`
        *,
        farmer:farmer_id (
          id,
          full_name,
          profile_url
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (loanAppError) {
      console.error("Error fetching loan applications:", loanAppError)
      // We'll let the client component handle the error
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Applications</h1>
            <p className="text-muted-foreground">Review and approve loan applications from farmers</p>
          </div>

          <PendingApplicationsList />
        </div>
      )
    }

    // If we have applications, get credit scores for all farmers
    if (loanApplications && loanApplications.length > 0) {
      // Get all farmer IDs
      const farmerIds = loanApplications.map((app) => app.farmer_id)

      // Get credit scores for these farmers
      const { data: creditScores, error: creditScoreError } = await supabaseAdmin
        .from("credit_scores")
        .select("farmer_id, credit_score")
        .in("farmer_id", farmerIds)
        .order("created_at", { ascending: false })

      if (!creditScoreError && creditScores) {
        // Create a map of farmer_id to credit_score
        const creditScoreMap = new Map()

        // Group by farmer_id and take the most recent score
        const farmerScoreGroups = creditScores.reduce((groups, item) => {
          if (!groups[item.farmer_id]) {
            groups[item.farmer_id] = []
          }
          groups[item.farmer_id].push(item)
          return groups
        }, {})

        // For each farmer, get the most recent score
        Object.entries(farmerScoreGroups).forEach(([farmerId, scores]) => {
          if (Array.isArray(scores) && scores.length > 0) {
            creditScoreMap.set(farmerId, scores[0].credit_score)
          }
        })

        // Add credit scores to loan applications
        loanApplications.forEach((app) => {
          if (app.farmer && creditScoreMap.has(app.farmer_id)) {
            app.farmer.credit_score = creditScoreMap.get(app.farmer_id)
          }
        })
      }
    }

    // If we have applications, pass them to the component
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Applications</h1>
          <p className="text-muted-foreground">Review and approve loan applications from farmers</p>
        </div>

        <PendingApplicationsList applications={loanApplications} />
      </div>
    )
  } catch (error) {
    console.error("Error in pending applications page:", error)
    // Let the client component handle fetching and errors
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Applications</h1>
          <p className="text-muted-foreground">Review and approve loan applications from farmers</p>
        </div>

        <PendingApplicationsList />
      </div>
    )
  }
}
