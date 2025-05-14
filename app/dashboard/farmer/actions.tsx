"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

/**
 * Handles user sign out from the farmer dashboard
 */
export async function handleSignOut() {
  const supabase = createClient()

  // Sign out the user
  await supabase.auth.signOut()

  // Redirect to the home page after sign out
  redirect("/")
}
