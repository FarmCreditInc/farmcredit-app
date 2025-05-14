import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const lenderId = params.id

    // Verify session using custom JWT auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user is requesting their own data or is an admin
    if (session.id !== lenderId && session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access to another user's data" }, { status: 403 })
    }

    // Fetch lender data
    const { data, error } = await supabase.from("lenders").select("*").eq("id", lenderId).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching lender data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
