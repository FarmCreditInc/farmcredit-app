import { notFound } from "next/navigation"
import { requireRole } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { LoanApplicationDetails } from "@/components/dashboard/loan-application-details"

interface LoanApplicationPageProps {
  params: {
    id: string
  }
}

export default async function LoanApplicationPage({ params }: LoanApplicationPageProps) {
  await requireRole(["lender"])

  const { id } = params

  // Fetch the loan application with all related data
  const { data: loanApplication, error } = await supabaseAdmin
    .from("loan_application")
    .select(`
      *,
      farmers:farmer_id (*),
      farms:farm_id (*)
    `)
    .eq("id", id)
    .single()

  if (error || !loanApplication) {
    console.error("Error fetching loan application:", error)
    notFound()
  }

  // Fetch the farmer's address if available
  if (loanApplication.farmers && loanApplication.farmers.address_id) {
    const { data: address, error: addressError } = await supabaseAdmin
      .from("address")
      .select("*")
      .eq("id", loanApplication.farmers.address_id)
      .single()

    if (!addressError && address) {
      loanApplication.farmers.address = address
    }
  }

  // Fetch credit score for the farmer
  if (loanApplication.farmers) {
    const { data: creditScores, error: creditScoreError } = await supabaseAdmin
      .from("credit_scores")
      .select("*")
      .eq("farmer_id", loanApplication.farmers.id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (!creditScoreError && creditScores && creditScores.length > 0) {
      loanApplication.farmers.credit_score = creditScores[0].credit_score
    }
  }

  // Fetch loan contract separately (if exists)
  const { data: loanContract, error: contractError } = await supabaseAdmin
    .from("loan_contract")
    .select(`
      *,
      vendor:vendor_id (
        *
      )
    `)
    .eq("loan_application_id", id)
    .maybeSingle()

  if (!contractError && loanContract) {
    loanApplication.loan_contract = loanContract

    // If there's a vendor, fetch vendor products
    if (loanContract.vendor_id) {
      const { data: vendorProducts, error: productsError } = await supabaseAdmin
        .from("vendor_products")
        .select("*")
        .eq("vendor_id", loanContract.vendor_id)

      if (!productsError && vendorProducts) {
        loanApplication.loan_contract.vendor.vendor_products = vendorProducts
      }
    }
  }

  return <LoanApplicationDetails loanApplication={loanApplication} />
}
