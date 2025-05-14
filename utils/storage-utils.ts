/**
 * Generates a URL for a file in Supabase storage
 * @param publicUrl The public URL of the file (as stored in the database)
 * @returns A public URL that can be used to access files
 */
export async function getSignedUrl(publicUrl: string | null): Promise<string | null> {
  if (!publicUrl) return null

  try {
    // If it's already a public URL (contains 'photos/'), return it directly
    if (publicUrl.includes("photos/")) {
      return publicUrl
    }

    // If it's a placeholder or external URL, use it directly
    if (publicUrl.startsWith("/placeholder") || (publicUrl.startsWith("http") && !publicUrl.includes("supabase"))) {
      return publicUrl
    }

    // For backward compatibility, if it's in farmer-docs, use the API route
    if (publicUrl.includes("farmer-docs")) {
      // Use the API route to generate a signed URL
      const response = await fetch("/api/get-signed-profile-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicUrl }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to get signed URL")
      }

      return data.signedUrl
    }

    // For verification documents or other documents
    if (publicUrl.includes("private/") || publicUrl.includes("verification-docs/")) {
      // Use the API route to generate a signed URL
      const response = await fetch("/api/get-document-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: publicUrl }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.url) {
        throw new Error(data.error || "Failed to get signed URL")
      }

      return data.url
    }

    return publicUrl
  } catch (error) {
    console.error("Error getting URL:", error)
    return null
  }
}

/**
 * Gets a URL for a profile image
 * @param profileUrl The profile image URL (as stored in the database)
 * @returns A URL for the profile image, or a placeholder if not available
 */
export async function getProfileImageUrl(profileUrl: string | null | undefined): Promise<string | null> {
  if (!profileUrl) return null

  // If it's a blob URL (from local file selection), use it directly
  if (profileUrl.startsWith("blob:")) {
    return profileUrl
  }

  // If it's a placeholder or external URL, use it directly
  if (profileUrl.startsWith("/placeholder") || (profileUrl.startsWith("http") && !profileUrl.includes("supabase"))) {
    return profileUrl
  }

  // Otherwise, get a URL (signed if needed)
  return getSignedUrl(profileUrl)
}
