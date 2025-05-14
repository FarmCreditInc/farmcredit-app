"use server"

import { createClient } from "@/lib/supabase-server"
import { getSession } from "@/lib/auth-utils"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitSupportTicket(formData: FormData) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: "You must be logged in to submit a support ticket" }
    }

    const supabase = createClient()

    // Get user type from form data
    const userType = (formData.get("userType") as string) || "farmer"

    // Get user details based on user type
    let userData: any = null

    if (userType === "farmer") {
      const { data: farmer } = await supabase.from("farmers").select("full_name, email").eq("id", session.id).single()
      userData = farmer
    } else if (userType === "lender") {
      const { data: lender } = await supabase.from("lenders").select("full_name, email").eq("id", session.id).single()
      userData = lender
    }

    if (!userData) {
      return { success: false, error: "User profile not found" }
    }

    // Extract form data
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const attachment = formData.get("attachment") as File

    // Validate inputs
    if (!category || !description) {
      return { success: false, error: "Please fill in all required fields" }
    }

    // Handle file upload if provided
    let attachmentUrl = ""
    if (attachment && attachment.size > 0) {
      const fileName = `support-tickets/${session.id}/${Date.now()}-${attachment.name}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("farmer-documents")
        .upload(fileName, attachment, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Error uploading attachment:", uploadError)
        return { success: false, error: "Failed to upload attachment" }
      }

      // Get public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("farmer-documents").getPublicUrl(fileName)

      attachmentUrl = urlData.publicUrl
    }

    // Store ticket in database
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: session.id,
        user_type: userType,
        category,
        description,
        attachment_url: attachmentUrl || null,
        status: "open",
      })
      .select()
      .single()

    if (ticketError) {
      console.error("Error creating support ticket:", ticketError)
      return { success: false, error: "Failed to create support ticket" }
    }

    // Send confirmation email to user
    const { data: userEmailData, error: userEmailError } = await resend.emails.send({
      from: "FarmCredit Support <no-reply@dataengineeringcommunity.com>",
      to: userData.email,
      subject: `Your Support Ticket Has Been Received - #${ticket.id}`,
      html: getSupportTicketConfirmationEmailTemplate(userData.full_name, category, description, ticket.id),
    })

    if (userEmailError) {
      console.error("Error sending confirmation email:", userEmailError)
      // Continue anyway to send admin notification
    }

    // Send email notification to admin
    const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
      from: "FarmCredit Support <no-reply@dataengineeringcommunity.com>",
      to: "chideraozigbo@gmail.com",
      subject: `New Support Ticket: ${userData.full_name} (${userType.charAt(0).toUpperCase() + userType.slice(1)})`,
      html: getAdminSupportTicketNotificationEmailTemplate(
        userData.full_name,
        userData.email,
        userType,
        category,
        description,
        attachmentUrl,
        ticket.id,
      ),
    })

    if (adminEmailError) {
      console.error("Error sending admin notification email:", adminEmailError)
      // Continue anyway as the ticket was created successfully
    }

    return {
      success: true,
      message: "Your support ticket has been submitted successfully. Our team will get back to you soon.",
    }
  } catch (error) {
    console.error("Error in submitSupportTicket:", error)
    return { success: false, error: "An unexpected error occurred. Please try again later." }
  }
}

// Email template styles (reusing the same styles from email-utils.ts)
const emailStyles = `
  body { 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    margin: 0; 
    padding: 0; 
    background-color: #f9f9f9; 
    color: #333; 
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    padding: 20px; 
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }
  .logo-container {
    text-align: center;
    padding: 25px 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #eaeaea;
  }
  .text-logo {
    font-size: 32px;
    font-weight: bold;
    color: #2e7d32;
    text-decoration: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    letter-spacing: -0.5px;
  }
  .header { 
    background-color: #2e7d32; 
    padding: 25px 20px; 
    text-align: center; 
    color: white; 
  }
  .content { 
    background-color: white; 
    padding: 35px 30px; 
  }
  .footer { 
    background-color: #f5f5f5;
    border-top: 1px solid #eaeaea;
    padding: 25px 20px;
    color: #666;
  }
  .footer-content {
    text-align: center;
    font-size: 14px;
    line-height: 1.6;
    color: #666;
  }
  .footer-links {
    margin: 15px 0;
    text-align: center;
  }
  .footer-links a {
    color: #2e7d32;
    text-decoration: none;
    margin: 0 10px;
    font-weight: 500;
  }
  .social-links {
    text-align: center;
    margin: 20px 0 10px;
  }
  .social-links a {
    display: inline-block;
    margin: 0 10px;
    color: #2e7d32;
    text-decoration: none;
    font-weight: 500;
  }
  h1 { 
    margin: 0; 
    font-size: 24px; 
    font-weight: 600;
  }
  p { 
    font-size: 16px; 
    line-height: 1.6; 
    margin: 15px 0; 
    color: #444;
  }
  .highlight { 
    color: #2e7d32; 
    font-weight: bold; 
  }
  .button { 
    display: inline-block; 
    background-color: #2e7d32; 
    color: white !important; 
    text-decoration: none; 
    padding: 14px 28px; 
    border-radius: 4px; 
    font-weight: 600; 
    margin: 20px 0; 
    text-align: center;
    font-size: 16px;
    transition: background-color 0.2s;
  }
  .button:hover {
    background-color: #266a2a;
  }
  .ticket-details { 
    background-color: #f9f9f9; 
    padding: 20px 25px; 
    border-radius: 6px; 
    margin: 25px 0; 
    border-left: 4px solid #2e7d32;
  }
  .ticket-id {
    font-family: monospace;
    font-size: 18px;
    font-weight: bold;
    color: #2e7d32;
    background-color: #f0f0f0;
    padding: 5px 10px;
    border-radius: 4px;
  }
  .divider {
    height: 1px;
    background-color: #eaeaea;
    margin: 15px 0;
  }
`

// Email template for support ticket confirmation
function getSupportTicketConfirmationEmailTemplate(
  name: string,
  category: string,
  description: string,
  ticketId: string,
) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket Confirmation</title>
    <style>
      ${emailStyles}
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-container">
        <div class="text-logo">FarmCredit</div>
      </div>
      <div class="header">
        <h1>Support Ticket Received</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thank you for contacting FarmCredit Support. We have received your support ticket and will respond as soon as possible.</p>
        
        <div class="ticket-details">
          <p><strong>Ticket ID:</strong> <span class="ticket-id">#${ticketId}</span></p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Description:</strong></p>
          <p>${description}</p>
        </div>
        
        <p>Our support team typically responds within 24-48 hours during business days. You will receive an email notification when we reply to your ticket.</p>
        
        <p>If you have any additional information to add to this ticket, please reply to this email or reference your ticket ID when contacting us.</p>
        
        <p>Best regards,<br>The FarmCredit Support Team</p>
      </div>
      <div class="footer">
        <div class="footer-content">
          <p>&copy; ${new Date().getFullYear()} FarmCredit. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
        <div class="footer-links">
          <a href="https://farmcredit.ng/help-center">Help Center</a>
          <a href="https://farmcredit.ng/contact">Contact Support</a>
        </div>
        <div class="social-links">
          <a href="https://facebook.com/farmcredit">Facebook</a>
          <a href="https://twitter.com/farmcredit">Twitter</a>
          <a href="https://instagram.com/farmcredit">Instagram</a>
        </div>
      </div>
    </div>
  </body>
  </html>
`
}

// Email template for admin notification
function getAdminSupportTicketNotificationEmailTemplate(
  name: string,
  email: string,
  userType: string,
  category: string,
  description: string,
  attachmentUrl: string,
  ticketId: string,
) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Support Ticket Notification</title>
    <style>
      ${emailStyles}
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-container">
        <div class="text-logo">FarmCredit</div>
      </div>
      <div class="header">
        <h1>New Support Ticket</h1>
      </div>
      <div class="content">
        <p>Hello Admin,</p>
        <p>A new support ticket has been submitted by a ${userType}.</p>
        
        <div class="ticket-details">
          <p><strong>Ticket ID:</strong> <span class="ticket-id">#${ticketId}</span></p>
          <p><strong>User:</strong> ${name} (${email})</p>
          <p><strong>User Type:</strong> ${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Description:</strong></p>
          <p>${description}</p>
          ${attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${attachmentUrl}" target="_blank">View Attachment</a></p>` : ""}
        </div>
        
        <p>Please review and respond to this ticket at your earliest convenience.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://farmcredit.ng/admin/support-tickets/${ticketId}" class="button">View Ticket</a>
        </div>
        
        <p>Best regards,<br>FarmCredit System</p>
      </div>
      <div class="footer">
        <div class="footer-content">
          <p>&copy; ${new Date().getFullYear()} FarmCredit. All rights reserved.</p>
          <p>You're receiving this email because you're listed as an admin on the FarmCredit platform.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
`
}
