import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Get lender ID from query params or from session
    const searchParams = request.nextUrl.searchParams
    const lenderId = searchParams.get("lenderId")

    // Get the authenticated user session
    const session = await getSession()

    if (!session || session.role !== "lender") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the lender ID from the query params or from the session
    const finalLenderId = lenderId || session.id

    // Create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the lender's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("lender_id", finalLenderId)
      .maybeSingle()

    if (walletError) {
      console.error("Error fetching wallet:", walletError)
      return NextResponse.json({ error: walletError.message }, { status: 500 })
    }

    // If wallet exists, return it
    if (wallet) {
      return NextResponse.json(wallet)
    }

    // If no wallet exists, create one
    const { data: newWallet, error: createError } = await supabase
      .from("wallets")
      .insert({
        lender_id: finalLenderId,
        balance: 0,
        locked_balance: 0,
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating wallet:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json(newWallet)
  } catch (error) {
    console.error("Error in wallet API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
