import { supabaseAdmin } from "@/lib/supabase-admin"

export async function createStorageBuckets() {
  try {
    // Create farmer-docs bucket if it doesn't exist
    const { data: farmerBucket, error: farmerError } = await supabaseAdmin.storage.getBucket("farmer-docs")

    if (!farmerBucket) {
      console.log("Creating farmer-docs bucket...")
      const { error } = await supabaseAdmin.storage.createBucket("farmer-docs", {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "application/pdf"],
      })

      if (error) {
        throw new Error(`Error creating farmer-docs bucket: ${error.message}`)
      }

      // Set up RLS policies for the farmer-docs bucket
      await setupFarmerBucketPolicies()

      console.log("farmer-docs bucket created successfully")
    } else {
      console.log("farmer-docs bucket already exists")
    }

    // Create lenders-docs bucket if it doesn't exist
    const { data: lenderBucket, error: lenderError } = await supabaseAdmin.storage.getBucket("lenders-docs")

    if (!lenderBucket) {
      console.log("Creating lenders-docs bucket...")
      const { error } = await supabaseAdmin.storage.createBucket("lenders-docs", {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "application/pdf"],
      })

      if (error) {
        throw new Error(`Error creating lenders-docs bucket: ${error.message}`)
      }

      // Set up RLS policies for the lenders-docs bucket
      await setupLenderBucketPolicies()

      console.log("lenders-docs bucket created successfully")
    } else {
      console.log("lenders-docs bucket already exists")
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating storage buckets:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

async function setupFarmerBucketPolicies() {
  // Allow admins to read all files
  await supabaseAdmin.storage.from("farmer-docs").createPolicy("Admin Read", {
    name: "Admin Read",
    definition: {
      role: "authenticated",
      match: {
        role: "admin",
      },
      operation: "SELECT",
    },
  })

  // Allow farmers to read their own files
  await supabaseAdmin.storage.from("farmer-docs").createPolicy("Farmer Read Own", {
    name: "Farmer Read Own",
    definition: {
      role: "authenticated",
      match: {
        role: "farmer",
        email: "${auth.email}",
      },
      operation: "SELECT",
    },
  })

  // Allow anyone to upload during registration (will be moved to proper folder later)
  await supabaseAdmin.storage.from("farmer-docs").createPolicy("Registration Upload", {
    name: "Registration Upload",
    definition: {
      role: "anon",
      operation: "INSERT",
    },
  })
}

async function setupLenderBucketPolicies() {
  // Allow admins to read all files
  await supabaseAdmin.storage.from("lenders-docs").createPolicy("Admin Read", {
    name: "Admin Read",
    definition: {
      role: "authenticated",
      match: {
        role: "admin",
      },
      operation: "SELECT",
    },
  })

  // Allow lenders to read their own files
  await supabaseAdmin.storage.from("lenders-docs").createPolicy("Lender Read Own", {
    name: "Lender Read Own",
    definition: {
      role: "authenticated",
      match: {
        role: "lender",
        email: "${auth.email}",
      },
      operation: "SELECT",
    },
  })

  // Allow anyone to upload during registration (will be moved to proper folder later)
  await supabaseAdmin.storage.from("lenders-docs").createPolicy("Registration Upload", {
    name: "Registration Upload",
    definition: {
      role: "anon",
      operation: "INSERT",
    },
  })
}
