import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get request body
    const body = await request.json()
    const { lenderId, profileData } = body

    if (!lenderId || !profileData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update lender profile
    const { data, error } = await supabase
      .from("lenders")
      .update({
        organization_name: profileData.organization_name,
        contact_person_name: profileData.contact_person_name,
        phone: profileData.phone,
        organization_type: profileData.organization_type,
        license_number: profileData.license_number,
        profile_url: profileData.profile_url,
        bio: profileData.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lenderId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update address if provided
    if (profileData.address || profileData.city || profileData.state) {
      // First check if lender has an address
      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .select("id")
        .eq("lender_id", lenderId)
        .maybeSingle()

      if (addressError && addressError.code !== "PGRST116") {
        return NextResponse.json({ error: addressError.message }, { status: 500 })
      }

      if (addressData) {
        // Update existing address
        const { error: updateAddressError } = await supabase
          .from("addresses")
          .update({
            street_address: profileData.address,
            city: profileData.city,
            state: profileData.state,
            updated_at: new Date().toISOString(),
          })
          .eq("id", addressData.id)

        if (updateAddressError) {
          return NextResponse.json({ error: updateAddressError.message }, { status: 500 })
        }
      } else {
        // Create new address
        const { error: createAddressError } = await supabase.from("addresses").insert({
          lender_id: lenderId,
          street_address: profileData.address,
          city: profileData.city,
          state: profileData.state,
        })

        if (createAddressError) {
          return NextResponse.json({ error: createAddressError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in update-lender-profile API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
