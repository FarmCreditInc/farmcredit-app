import type { Database } from "@/lib/database.types"

type Address = Database["public"]["Tables"]["address"]["Row"]

/**
 * Geocodes an address using the OpenCage Geocoding API
 * @param city The city
 * @param state The state
 * @param country The country (defaults to Nigeria)
 * @returns Promise with latitude and longitude or null if geocoding fails
 */
export async function geocodeAddress(
  city: string,
  state: string,
  country = "Nigeria",
): Promise<{ latitude: number; longitude: number } | null> {
  const apiKey = process.env.OPENCAGE_API_KEY

  if (!apiKey) {
    console.error("OpenCage API key is missing")
    return null
  }

  try {
    // Format the address for geocoding
    const formattedAddress = `${city}, ${state}, ${country}`

    // Encode the address for URL
    const encodedAddress = encodeURIComponent(formattedAddress)

    // Make request to OpenCage API
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${apiKey}&countrycode=ng&limit=1`,
    )

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Check if we got results
    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        latitude: result.geometry.lat,
        longitude: result.geometry.lng,
      }
    } else {
      console.warn(`No geocoding results found for: ${formattedAddress}`)
      return null
    }
  } catch (error) {
    console.error("Error geocoding address:", error)
    return null
  }
}

/**
 * Determines the geopolitical zone based on the Nigerian state
 * @param state The Nigerian state
 * @returns The geopolitical zone or empty string if not found
 */
export function getGeopoliticalZone(state: string): string {
  const northCentral = ["Benue", "FCT", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"]
  const northEast = ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"]
  const northWest = ["Kaduna", "Katsina", "Kano", "Kebbi", "Sokoto", "Jigawa", "Zamfara"]
  const southEast = ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"]
  const southSouth = ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"]
  const southWest = ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"]

  if (northCentral.includes(state)) return "North Central"
  if (northEast.includes(state)) return "North East"
  if (northWest.includes(state)) return "North West"
  if (southEast.includes(state)) return "South East"
  if (southSouth.includes(state)) return "South South"
  if (southWest.includes(state)) return "South West"

  return ""
}

/**
 * Updates an address with geocoding information
 * @param addressId The address ID to update
 * @param supabase The Supabase client
 * @returns Promise with success status
 */
export async function updateAddressWithGeocoding(addressId: string, supabase: any): Promise<boolean> {
  try {
    // Get the address
    const { data: address, error: addressError } = await supabase
      .from("address")
      .select("*")
      .eq("id", addressId)
      .single()

    if (addressError || !address) {
      console.error("Error fetching address:", addressError)
      return false
    }

    // Skip if already has coordinates
    if (address.latitude && address.longitude) {
      return true
    }

    // Geocode the address
    const coordinates = await geocodeAddress(address.city, address.state, address.country)

    if (!coordinates) {
      return false
    }

    // Update the address with coordinates
    const { error: updateError } = await supabase
      .from("address")
      .update({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      })
      .eq("id", addressId)

    if (updateError) {
      console.error("Error updating address with coordinates:", updateError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateAddressWithGeocoding:", error)
    return false
  }
}
