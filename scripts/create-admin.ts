"use server"

import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function createAdminUser() {
  try {
    // Generate a proper bcrypt hash
    const password = "admin123"
    const passwordHash = await bcrypt.hash(password, 10)

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("email", "admin@example.com")
      .single()

    if (existingAdmin) {
      // Update existing admin's password
      const { error } = await supabaseAdmin
        .from("admins")
        .update({ password_hash: passwordHash })
        .eq("id", existingAdmin.id)

      if (error) throw error
      return { success: true, message: "Admin password updated successfully" }
    } else {
      // Create new admin
      const { error } = await supabaseAdmin.from("admins").insert({
        email: "admin@example.com",
        password_hash: passwordHash,
        full_name: "Admin User",
      })

      if (error) throw error
      return { success: true, message: "Admin user created successfully" }
    }
  } catch (error) {
    console.error("Error creating/updating admin:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
