/**
 * Test script for geocoding functionality
 * Run with: npx tsx scripts/test-geocoding.ts
 */

import { geocodeAddress } from "../utils/geocoding-utils"

async function testGeocoding() {
  console.log("Testing geocoding functionality...")

  // Test cases - major Nigerian cities
  const testCases = [
    { city: "Lagos", state: "Lagos" },
    { city: "Abuja", state: "FCT" },
    { city: "Kano", state: "Kano" },
    { city: "Port Harcourt", state: "Rivers" },
    { city: "Ibadan", state: "Oyo" },
    { city: "Benin City", state: "Edo" },
    { city: "Kaduna", state: "Kaduna" },
    { city: "Enugu", state: "Enugu" },
  ]

  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.city}, ${testCase.state}`)

    try {
      const result = await geocodeAddress({
        city: testCase.city,
        state: testCase.state,
        country: "Nigeria",
      })

      if (result) {
        console.log(
          `✅ Success: ${testCase.city}, ${testCase.state} -> Lat: ${result.latitude}, Lng: ${result.longitude}`,
        )
      } else {
        console.log(`❌ Failed to geocode: ${testCase.city}, ${testCase.state}`)
      }
    } catch (error) {
      console.error(`❌ Error geocoding ${testCase.city}, ${testCase.state}:`, error)
    }
  }

  console.log("\nGeocoding test completed.")
}

// Run the test
testGeocoding().catch(console.error)
