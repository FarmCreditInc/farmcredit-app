"use server"

import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { geocodeAddress, getGeopoliticalZone } from "@/utils/geocoding-utils"

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Register a farmer
export async function registerFarmer(formData: any) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Hash the password
    const hashedPassword = await hashPassword(formData.password)

    // Generate a unique ID for the farmer
    const farmerId = uuidv4()

    // Create address record first
    // Get coordinates from city and state
    let coordinates = null
    try {
      coordinates = await geocodeAddress(formData.city, formData.state, formData.country || "Nigeria")
    } catch (error) {
      console.error("Error geocoding address:", error)
      // Continue without coordinates
    }

    const { data: addressData, error: addressError } = await supabase
      .from("address")
      .insert({
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode || null,
        country: formData.country || "Nigeria",
        geopolitical_zone: formData.geopoliticalZone || getGeopoliticalZone(formData.state),
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
      })
      .select()

    if (addressError) {
      console.error("Error creating address:", addressError)
      return { success: false, error: "Failed to create address record" }
    }

    const addressId = addressData[0].id

    // Upload ID document if provided
    let idDocumentUrl = null
    if (formData.idDocument) {
      const fileExt = formData.idDocument.name.split(".").pop()
      const filePath = `id-documents/${farmerId}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, formData.idDocument)

      if (uploadError) {
        console.error("Error uploading ID document:", uploadError)
        return { success: false, error: "Failed to upload ID document" }
      }

      idDocumentUrl = filePath
    }

    // Create farmer record
    const { error: farmerError } = await supabase.from("farmers").insert({
      id: farmerId,
      email: formData.email,
      password_hash: hashedPassword,
      full_name: formData.fullName,
      gender: formData.gender,
      age: formData.age ? Number.parseInt(formData.age) : null,
      date_of_birth: formData.dateOfBirth || null,
      phone: formData.phone,
      address_id: addressId,
      education_level: formData.educationLevel || null,
      farming_experience: formData.farmingExperience ? Number.parseInt(formData.farmingExperience) : null,
      farm_size: formData.farmSize ? Number.parseFloat(formData.farmSize) : null,
      crop_types: formData.cropTypes || null,
      livestock_type: formData.livestockType || null,
      is_coop_member: formData.isCoopMember === "yes",
      uses_fertilizer: formData.usesFertilizer === "yes",
      uses_machinery: formData.usesMachinery === "yes",
      uses_irrigation: formData.usesIrrigation === "yes",
      identification_type: formData.identificationType || null,
      identification_number: formData.identificationNumber || null,
      id_document_url: idDocumentUrl,
      is_active: false,
      status: "pending",
      seen_guided_tour: false,
    })

    if (farmerError) {
      console.error("Error creating farmer:", farmerError)
      return { success: false, error: "Failed to create farmer account" }
    }

    // Create next of kin record if provided
    if (formData.nextOfKinName) {
      const { error: nextOfKinError } = await supabase.from("farmer_next_of_kin").insert({
        farmer_id: farmerId,
        full_name: formData.nextOfKinName,
        address: formData.nextOfKinAddress || null,
        phone_number: formData.nextOfKinPhone || null,
        relationship: formData.nextOfKinRelationship || null,
      })

      if (nextOfKinError) {
        console.error("Error creating next of kin:", nextOfKinError)
        // Continue without next of kin
      }
    }

    return { success: true, farmerId }
  } catch (error) {
    console.error("Error in registerFarmer:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Register a lender
export async function registerLender(formData: any) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Hash the password
    const hashedPassword = await hashPassword(formData.password)

    // Generate a unique ID for the lender
    const lenderId = uuidv4()

    // Create address record first if address fields are provided
    let addressId = null
    if (formData.streetAddress && formData.city && formData.state) {
      // Get coordinates from city and state
      let coordinates = null
      try {
        coordinates = await geocodeAddress(formData.city, formData.state, formData.country || "Nigeria")
      } catch (error) {
        console.error("Error geocoding address:", error)
        // Continue without coordinates
      }

      const { data: addressData, error: addressError } = await supabase
        .from("address")
        .insert({
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode || null,
          country: formData.country || "Nigeria",
          geopolitical_zone: formData.geopoliticalZone || getGeopoliticalZone(formData.state),
          latitude: coordinates?.latitude || null,
          longitude: coordinates?.longitude || null,
        })
        .select()

      if (addressError) {
        console.error("Error creating address:", addressError)
        return { success: false, error: "Failed to create address record" }
      }

      addressId = addressData[0].id
    }

    // Upload verification document if provided
    let verificationDocumentUrl = null
    if (formData.verificationDocument) {
      const fileExt = formData.verificationDocument.name.split(".").pop()
      const filePath = `verification-documents/${lenderId}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, formData.verificationDocument)

      if (uploadError) {
        console.error("Error uploading verification document:", uploadError)
        return { success: false, error: "Failed to upload verification document" }
      }

      verificationDocumentUrl = filePath
    }

    // Create lender record
    const { error: lenderError } = await supabase.from("lenders").insert({
      id: lenderId,
      email: formData.email,
      password_hash: hashedPassword,
      organization_name: formData.organizationName,
      contact_person_name: formData.contactPersonName,
      phone: formData.phone,
      organization_type: formData.organizationType,
      license_number: formData.licenseNumber || null,
      verification_document_url: verificationDocumentUrl,
      address_id: addressId,
      is_active: false,
      status: "pending",
      seen_guided_tour: false,
    })

    if (lenderError) {
      console.error("Error creating lender:", lenderError)
      return { success: false, error: "Failed to create lender account" }
    }

    return { success: true, lenderId }
  } catch (error) {
    console.error("Error in registerLender:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
