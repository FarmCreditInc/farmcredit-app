import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedNotifications() {
  try {
    // First, get all farmer users
    const { data: farmers, error: farmersError } = await supabase.from("users").select("id").eq("role", "farmer")

    if (farmersError) {
      console.error("Error fetching farmers:", farmersError)
      return
    }

    if (!farmers || farmers.length === 0) {
      console.log("No farmers found to seed notifications for")
      return
    }

    // Create sample notifications for each farmer
    for (const farmer of farmers) {
      const notifications = [
        {
          user_id: farmer.id,
          title: "Welcome to the Farmer Dashboard",
          message: "Welcome to your new dashboard! Explore all the features to help grow your farming business.",
          type: "system",
          read: false,
        },
        {
          user_id: farmer.id,
          title: "Complete Your Profile",
          message: "Please complete your profile to unlock all features of the platform.",
          type: "system",
          read: false,
        },
        {
          user_id: farmer.id,
          title: "New Learning Module Available",
          message: 'Check out our new module on "Sustainable Farming Practices".',
          type: "learning",
          read: false,
        },
      ]

      const { error: notificationsError } = await supabase.from("notifications").insert(notifications)

      if (notificationsError) {
        console.error(`Error seeding notifications for farmer ${farmer.id}:`, notificationsError)
      }
    }

    console.log("Successfully seeded notifications")
  } catch (error) {
    console.error("Error:", error)
  }
}

seedNotifications()
