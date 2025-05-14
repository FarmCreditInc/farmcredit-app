"use server"

import { revalidatePath } from "next/cache"

type ContactFormData = {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactForm(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // Validate form data
    if (!name || !email || !subject || !message) {
      return {
        success: false,
        message: "All fields are required",
      }
    }

    if (!email.includes("@")) {
      return {
        success: false,
        message: "Please enter a valid email address",
      }
    }

    // In a real application, you would:
    // 1. Store the message in a database
    // 2. Send an email notification
    // 3. Create a support ticket

    // For now, we'll simulate a successful submission
    console.log("Contact form submission:", { name, email, subject, message })

    // Wait for 1 second to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Revalidate the help center page
    revalidatePath("/help-center")

    return {
      success: true,
      message: "Your message has been sent. We will get back to you within 24 hours.",
    }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return {
      success: false,
      message: "An error occurred while submitting your message. Please try again later.",
    }
  }
}
