import { supabaseAdmin } from "@/lib/supabase-admin"

export async function getSignedDocumentUrl(filePath: string): Promise<string | null> {
  try {
    console.log("Getting signed URL for:", filePath)

    // Extract bucket name and file path from the URL or direct path
    let bucket: string
    let path: string

    if (filePath.includes("supabase.co")) {
      // It's a Supabase URL, extract the bucket and path
      const url = new URL(filePath)
      const pathParts = url.pathname.split("/")

      // Find the bucket name in the path
      // Format: /storage/v1/object/public/BUCKET_NAME/PATH
      const publicIndex = pathParts.indexOf("public")
      const signIndex = pathParts.indexOf("sign")

      let bucketIndex = -1
      if (publicIndex !== -1) {
        bucketIndex = publicIndex + 1
      } else if (signIndex !== -1) {
        bucketIndex = signIndex + 1
      }

      if (bucketIndex !== -1 && bucketIndex < pathParts.length) {
        bucket = pathParts[bucketIndex]
        path = pathParts.slice(bucketIndex + 1).join("/")
        console.log(`Extracted from URL - Bucket: ${bucket}, Path: ${path}`)
      } else {
        throw new Error("Could not parse bucket and path from URL")
      }
    } else if (filePath.includes("/")) {
      // It's a direct path with bucket/path format
      const parts = filePath.split("/")
      bucket = parts[0]
      path = parts.slice(1).join("/")
      console.log(`Using direct path - Bucket: ${bucket}, Path: ${path}`)
    } else {
      throw new Error("Invalid file path format")
    }

    // Generate a signed URL with 60 minutes expiration
    console.log(`Generating signed URL for bucket: ${bucket}, path: ${path}`)
    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 60)

    if (error) {
      console.error("Error creating signed URL:", error)
      throw error
    }

    if (!data || !data.signedUrl) {
      throw new Error("No signed URL returned from Supabase")
    }

    console.log("Successfully generated signed URL:", data.signedUrl)
    return data.signedUrl
  } catch (error) {
    console.error("Error in getSignedDocumentUrl:", error)
    throw error
  }
}
