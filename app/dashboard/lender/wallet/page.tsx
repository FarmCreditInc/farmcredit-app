import { requireRole } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase-server"
import { WalletClient } from "./client"

export default async function LenderWalletPage() {
  // Verify user is authenticated and has lender role
  const session = await requireRole(["lender"])
  const userId = session.id

  // Get initial data from Supabase
  const supabase = createClient()

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from("lenders")
    .select("id, email")
    .eq("id", userId)
    .single()

  if (userError) {
    console.error("Error fetching user data:", userError)
    // You could redirect to an error page here
  }

  // Fetch wallet data - using the correct "wallets" table
  const { data: walletData, error: walletError } = await supabase
    .from("wallets")
    .select("*")
    .eq("lender_id", userId)
    .maybeSingle()

  if (walletError && walletError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching wallet data:", walletError)
  }

  // Fetch bank accounts from payment_details table
  const { data: bankAccounts, error: bankError } = await supabase
    .from("payment_details")
    .select("*")
    .eq("lender_id", userId)

  if (bankError) {
    console.error("Error fetching bank accounts:", bankError)
  }

  return (
    <WalletClient
      userId={userId}
      email={userData?.email || ""}
      initialWalletBalance={walletData?.balance || 0}
      initialBankAccounts={bankAccounts || []}
    />
  )
}
