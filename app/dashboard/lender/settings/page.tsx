import { requireRole } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { LenderSettingsPage as LenderSettingsPageComponent } from "@/components/dashboard/lender-settings-page"

export default async function SettingsPage() {
  // Get the authenticated user session using our custom JWT auth
  const session = await requireRole(["lender"])

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  let lender = null
  let documents = []

  if (session && session.id) {
    // Fetch lender data using the ID from our custom JWT session
    const { data: lenderData, error: lenderError } = await supabase
      .from("lenders")
      .select("*")
      .eq("id", session.id)
      .single()

    if (lenderData && !lenderError) {
      lender = lenderData

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from("lender_documents")
        .select("*")
        .eq("lender_id", session.id)

      if (docsData && !docsError) {
        documents = docsData
      }
    } else if (lenderError) {
      console.error("Error fetching lender data:", lenderError)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <LenderSettingsPageComponent lender={lender} documents={documents} />
    </div>
  )
}
