import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import * as jose from "jose"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

  // Get user from session
  const sessionCookie = cookies().get("session")?.value
  let userId = ""
  let userRole = ""

  if (sessionCookie) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jose.jwtVerify(sessionCookie, secretKey)
      userId = payload.id as string
      userRole = payload.role as string
    } catch (error) {
      console.error("Error verifying JWT:", error)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  if (!userId || userRole !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Calculate yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    // Format as ISO string for Supabase query
    const yesterdayIso = yesterday.toISOString()

    // Get counts of pending applications
    const { count: pendingFarmersCount, error: pendingFarmersError } = await supabaseAdmin
      .from("farmers")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    if (pendingFarmersError) {
      console.error("Error fetching pending farmers:", pendingFarmersError)
    }

    const { count: pendingLendersCount, error: pendingLendersError } = await supabaseAdmin
      .from("lenders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    if (pendingLendersError) {
      console.error("Error fetching pending lenders:", pendingLendersError)
    }

    // Get counts of approved users
    const { count: approvedFarmersCount, error: approvedFarmersError } = await supabaseAdmin
      .from("farmers")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    if (approvedFarmersError) {
      console.error("Error fetching approved farmers:", approvedFarmersError)
    }

    const { count: approvedLendersCount, error: approvedLendersError } = await supabaseAdmin
      .from("lenders")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    if (approvedLendersError) {
      console.error("Error fetching approved lenders:", approvedLendersError)
    }

    // Get counts of rejected users
    const { count: rejectedFarmersCount, error: rejectedFarmersError } = await supabaseAdmin
      .from("farmers")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected")

    if (rejectedFarmersError) {
      console.error("Error fetching rejected farmers:", rejectedFarmersError)
    }

    const { count: rejectedLendersCount, error: rejectedLendersError } = await supabaseAdmin
      .from("lenders")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected")

    if (rejectedLendersError) {
      console.error("Error fetching rejected lenders:", rejectedLendersError)
    }

    // Get recent pending farmers and lenders (registered since yesterday)
    const { data: pendingFarmers, error: recentFarmersError } = await supabaseAdmin
      .from("farmers")
      .select("*")
      .eq("status", "pending")
      .gte("created_at", yesterdayIso)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentFarmersError) {
      console.error("Error fetching recent farmers:", recentFarmersError)
    }

    const { data: pendingLenders, error: recentLendersError } = await supabaseAdmin
      .from("lenders")
      .select("*")
      .eq("status", "pending")
      .gte("created_at", yesterdayIso)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentLendersError) {
      console.error("Error fetching recent lenders:", recentLendersError)
    }

    return NextResponse.json({
      pendingFarmersCount: pendingFarmersCount || 0,
      pendingLendersCount: pendingLendersCount || 0,
      approvedFarmersCount: approvedFarmersCount || 0,
      approvedLendersCount: approvedLendersCount || 0,
      rejectedFarmersCount: rejectedFarmersCount || 0,
      rejectedLendersCount: rejectedLendersCount || 0,
      pendingFarmers: pendingFarmers || [],
      pendingLenders: pendingLenders || [],
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
        pendingFarmersCount: 0,
        pendingLendersCount: 0,
        approvedFarmersCount: 0,
        approvedLendersCount: 0,
        rejectedFarmersCount: 0,
        rejectedLendersCount: 0,
        pendingFarmers: [],
        pendingLenders: [],
      },
      { status: 500 },
    )
  }
}
