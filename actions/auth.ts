"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Create a Supabase client for server components
const createServerClient = () => {
  const cookieStore = cookies()
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name, options) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

export async function signUpFarmer(formData: FormData) {
  const supabase = createServerClient()

  // Extract form data
  const fullName = formData.get("fullName") as string
  const gender = formData.get("gender") as string
  const age = Number.parseInt(formData.get("age") as string)
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const state = formData.get("state") as string
  const lga = formData.get("lga") as string
  const educationLevel = formData.get("educationLevel") as string
  const farmingExperience = Number.parseInt(formData.get("farmingExperience") as string)
  const farmSize = Number.parseFloat(formData.get("farmSize") as string)
  const cropTypes = formData.get("cropTypes") as string
  const livestockType = formData.get("livestockType") as string
  const isCoopMember = formData.get("isCoopMember") === "yes"
  const usesFertilizer = formData.get("usesFertilizer") === "on"
  const usesMachinery = formData.get("usesMachinery") === "on"
  const usesIrrigation = formData.get("usesIrrigation") === "on"
  const password = formData.get("password") as string
  const idDocument = formData.get("idDocument") as File

  try {
    // Upload ID document to Supabase Storage
    let idDocumentUrl = null
    if (idDocument && idDocument.size > 0) {
      const fileName = `${Date.now()}_${idDocument.name}`
      const { data: fileData, error: fileError } = await supabase.storage
        .from("farmer_docs")
        .upload(fileName, idDocument)

      if (fileError) {
        throw new Error(`Error uploading document: ${fileError.message}`)
      }

      // Get public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("farmer_docs").getPublicUrl(fileName)

      idDocumentUrl = urlData.publicUrl
    }

    // Insert user data into pending_users table
    const { data, error } = await supabase.from("pending_users").insert([
      {
        role: "farmer",
        full_name: fullName,
        gender,
        age,
        email,
        phone,
        state,
        lga,
        education_level: educationLevel,
        farming_experience: farmingExperience,
        farm_size: farmSize,
        crop_types: cropTypes,
        livestock_type: livestockType || null,
        is_coop_member: isCoopMember,
        uses_fertilizer: usesFertilizer,
        uses_machinery: usesMachinery,
        uses_irrigation: usesIrrigation,
        id_document_url: idDocumentUrl,
        password, // This will be hashed when creating the actual auth user
      },
    ])

    if (error) {
      throw new Error(`Error creating user: ${error.message}`)
    }

    // Redirect to confirmation page
    redirect("/auth/confirmation")
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function signUpLender(formData: FormData) {
  const supabase = createServerClient()

  // Extract form data
  const organizationName = formData.get("organizationName") as string
  const contactPersonName = formData.get("contactPersonName") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const organizationType = formData.get("organizationType") as string
  const licenseNumber = formData.get("licenseNumber") as string
  const password = formData.get("password") as string
  const verificationDocument = formData.get("verificationDocument") as File

  try {
    // Upload verification document to Supabase Storage
    let verificationDocumentUrl = null
    if (verificationDocument && verificationDocument.size > 0) {
      const fileName = `${Date.now()}_${verificationDocument.name}`
      const { data: fileData, error: fileError } = await supabase.storage
        .from("lender_docs")
        .upload(fileName, verificationDocument)

      if (fileError) {
        throw new Error(`Error uploading document: ${fileError.message}`)
      }

      // Get public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("lender_docs").getPublicUrl(fileName)

      verificationDocumentUrl = urlData.publicUrl
    }

    // Insert user data into pending_users table
    const { data, error } = await supabase.from("pending_users").insert([
      {
        role: "lender",
        organization_name: organizationName,
        contact_person_name: contactPersonName,
        email,
        phone,
        organization_type: organizationType,
        license_number: licenseNumber || null,
        verification_document_url: verificationDocumentUrl,
        password, // This will be hashed when creating the actual auth user
      },
    ])

    if (error) {
      throw new Error(`Error creating user: ${error.message}`)
    }

    // Redirect to confirmation page
    redirect("/auth/confirmation")
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function loginUser(formData: FormData) {
  const supabase = createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(`Error signing in: ${error.message}`)
    }

    // Check if user exists in the correct role table
    const tableName = role === "farmer" ? "farmers" : "lenders"
    const { data: userData, error: userError } = await supabase.from(tableName).select("*").eq("email", email).single()

    if (userError || !userData) {
      // Sign out if user doesn't exist in the correct role table
      await supabase.auth.signOut()
      throw new Error(`No ${role} account found with this email`)
    }

    // Redirect to the appropriate dashboard
    revalidatePath("/")
    redirect(role === "farmer" ? "/dashboard" : "/lender-dashboard")
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function approveUser(userId: string) {
  try {
    // Get user data from pending_users
    const { data: userData, error: userError } = await supabaseAdmin
      .from("pending_users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      throw new Error("User not found")
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    })

    if (authError) {
      throw new Error(`Error creating auth user: ${authError.message}`)
    }

    // Insert user data into the appropriate table based on role
    if (userData.role === "farmer") {
      const { error: insertError } = await supabaseAdmin.from("farmers").insert([
        {
          auth_id: authData.user.id,
          full_name: userData.full_name,
          gender: userData.gender,
          age: userData.age,
          email: userData.email,
          phone: userData.phone,
          state: userData.state,
          lga: userData.lga,
          education_level: userData.education_level,
          farming_experience: userData.farming_experience,
          farm_size: userData.farm_size,
          crop_types: userData.crop_types,
          livestock_type: userData.livestock_type,
          is_coop_member: userData.is_coop_member,
          uses_fertilizer: userData.uses_fertilizer,
          uses_machinery: userData.uses_machinery,
          uses_irrigation: userData.uses_irrigation,
          id_document_url: userData.id_document_url,
        },
      ])

      if (insertError) {
        throw new Error(`Error inserting farmer data: ${insertError.message}`)
      }
    } else if (userData.role === "lender") {
      const { error: insertError } = await supabaseAdmin.from("lenders").insert([
        {
          auth_id: authData.user.id,
          organization_name: userData.organization_name,
          contact_person_name: userData.contact_person_name,
          email: userData.email,
          phone: userData.phone,
          organization_type: userData.organization_type,
          license_number: userData.license_number,
          verification_document_url: userData.verification_document_url,
        },
      ])

      if (insertError) {
        throw new Error(`Error inserting lender data: ${insertError.message}`)
      }
    }

    // Delete user from pending_users
    const { error: deleteError } = await supabaseAdmin.from("pending_users").delete().eq("id", userId)

    if (deleteError) {
      throw new Error(`Error deleting pending user: ${deleteError.message}`)
    }

    // TODO: Send approval email to user

    revalidatePath("/admin/pending-users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function rejectUser(userId: string) {
  try {
    // Get user data to get file URLs
    const { data: userData, error: userError } = await supabaseAdmin
      .from("pending_users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      throw new Error("User not found")
    }

    // Delete uploaded files if they exist
    if (userData.role === "farmer" && userData.id_document_url) {
      const fileName = userData.id_document_url.split("/").pop()
      if (fileName) {
        await supabaseAdmin.storage.from("farmer_docs").remove([fileName])
      }
    } else if (userData.role === "lender" && userData.verification_document_url) {
      const fileName = userData.verification_document_url.split("/").pop()
      if (fileName) {
        await supabaseAdmin.storage.from("lender_docs").remove([fileName])
      }
    }

    // Delete user from pending_users
    const { error: deleteError } = await supabaseAdmin.from("pending_users").delete().eq("id", userId)

    if (deleteError) {
      throw new Error(`Error deleting pending user: ${deleteError.message}`)
    }

    // TODO: Send rejection email to user

    revalidatePath("/admin/pending-users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
