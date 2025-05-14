import { createClient } from "@supabase/supabase-js"
import { geocodeAddress } from "../utils/geocoding-utils"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateAddressesWithGeocoding() {
  try {
    console.log("Starting to update addresses with geocoding information...")

    // Get all addresses without latitude and longitude
    const { data: addresses, error } = await supabase
      .from("address")
      .select("*")
      .or("latitude.is.null,longitude.is.null")

    if (error) {
      throw new Error(`Error fetching addresses: ${error.message}`)
    }

    console.log(`Found ${addresses.length} addresses to update`)

    // Process each address
    for (const address of addresses) {
      try {
        console.log(`Processing address ID: ${address.id} (${address.city}, ${address.state})`)

        // Get coordinates
        const coordinates = await geocodeAddress(address.city, address.state, address.country || "Nigeria")

        if (!coordinates) {
          console.log(`No coordinates found for address ID: ${address.id}`)
          continue
        }

        // Update the address
        const { error: updateError } = await supabase
          .from("address")
          .update({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          })
          .eq("id", address.id)

        if (updateError) {
          console.error(`Error updating address ID ${address.id}:`, updateError)
          continue
        }

        console.log(
          `Successfully updated address ID: ${address.id} with coordinates: ${coordinates.latitude}, ${coordinates.longitude}`,
        )
      } catch (addressError) {
        console.error(`Error processing address ID ${address.id}:`, addressError)
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log("Finished updating addresses with geocoding information")
  } catch (error) {
    console.error("Error in updateAddressesWithGeocoding:", error)
  }
}

// Run the script
updateAddressesWithGeocoding()
  .then(() => {
    console.log("Script completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Script failed:", error)
    process.exit(1)
  })
