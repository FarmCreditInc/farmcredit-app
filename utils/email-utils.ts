import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// List of admin email addresses
const PRIMARY_ADMIN_EMAIL = "chideraozigbo@gmail.com"
const BCC_ADMIN_EMAILS = ["frankfelixai@gmail.com", "amandinancy16@gmail.com", "tobye070@gmail.com"]

// Email configuration constants
const EMAIL_SENDER = "no-reply@dataengineeringcommunity.com"
const EMAIL_DISPLAY_NAME = "FarmCredit"
const EMAIL_FROM = `${EMAIL_DISPLAY_NAME} <${EMAIL_SENDER}>`

// Function to send acknowledgment email to users after registration
export async function sendAcknowledgmentEmail(
  recipientEmail: string,
  recipientName: string,
  role: "farmer" | "lender",
) {
  try {
    console.log(`Sending acknowledgment email to ${role} ${recipientName} at ${recipientEmail}`)

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: `Your ${role.charAt(0).toUpperCase() + role.slice(1)} Registration Received`,
      html: getAcknowledgmentEmailTemplate(recipientName, role),
    })

    if (error) {
      console.error(`Error sending acknowledgment email to ${recipientEmail}:`, error)
      throw new Error(`Failed to send acknowledgment email: ${error.message}`)
    }

    console.log(`Acknowledgment email sent successfully to ${recipientEmail}, message ID: ${data?.id}`)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error in sendAcknowledgmentEmail:", error)
    throw error
  }
}

// Function to send approval email to users
export async function sendApprovalEmail(recipientEmail: string, recipientName: string, role: "farmer" | "lender") {
  try {
    console.log(`Sending approval email to ${role} ${recipientName} at ${recipientEmail}`)

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: `Your ${role.charAt(0).toUpperCase() + role.slice(1)} Account Has Been Approved!`,
      html: getApprovalEmailTemplate(recipientName, role),
    })

    if (error) {
      console.error(`Error sending approval email to ${recipientEmail}:`, error)
      throw new Error(`Failed to send approval email: ${error.message}`)
    }

    console.log(`Approval email sent successfully to ${recipientEmail}, message ID: ${data?.id}`)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error in sendApprovalEmail:", error)
    throw error
  }
}

// Function to send rejection email to users
export async function sendRejectionEmail(
  recipientEmail: string,
  recipientName: string,
  role: "farmer" | "lender",
  reason: string,
) {
  try {
    console.log(`Sending rejection email to ${role} ${recipientName} at ${recipientEmail}`)

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: `Important Information About Your ${role.charAt(0).toUpperCase() + role.slice(1)} Application`,
      html: getRejectionEmailTemplate(recipientName, role, reason),
    })

    if (error) {
      console.error(`Error sending rejection email to ${recipientEmail}:`, error)
      throw new Error(`Failed to send rejection email: ${error.message}`)
    }

    console.log(`Rejection email sent successfully to ${recipientEmail}, message ID: ${data?.id}`)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error in sendRejectionEmail:", error)
    throw error
  }
}

// Function to send notification emails to admins about new registrations
export async function sendAdminNotificationEmail(userName: string, userEmail: string, role: "farmer" | "lender") {
  try {
    // Format the current time
    const registrationTime = new Date().toLocaleString("en-NG", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Africa/Lagos",
    })

    console.log(`Sending admin notification email about new ${role} registration: ${userName} (${userEmail})`)
    console.log(`Primary admin recipient: ${PRIMARY_ADMIN_EMAIL}`)
    console.log(`BCC admin recipients: ${BCC_ADMIN_EMAILS.join(", ")}`)

    // Send email to primary admin with BCC to other admins
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [PRIMARY_ADMIN_EMAIL],
      bcc: BCC_ADMIN_EMAILS,
      subject: `New ${role.charAt(0).toUpperCase() + role.slice(1)} Registration Needs Approval`,
      html: getAdminNotificationEmailTemplate(userName, userEmail, role, registrationTime),
    })

    if (error) {
      console.error(`Error sending admin notification email:`, error)
      throw new Error(`Failed to send admin notification email: ${error.message}`)
    }

    console.log(`Admin notification email sent successfully, message ID: ${data?.id}`)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error in sendAdminNotificationEmail:", error)
    throw error
  }
}

// Send contract email to both lender and farmer
export async function sendContractEmail(
  lenderEmail: string,
  lenderName: string,
  farmerEmail: string,
  farmerName: string,
  contractId: string,
  loanAmount: number,
  loanPurpose: string,
  contractPdfBuffer: Buffer,
) {
  try {
    console.log("========== CONTRACT EMAIL DETAILS ==========")
    console.log(`Contract ID: ${contractId}`)
    console.log(`Lender: ${lenderName} <${lenderEmail}>`)
    console.log(`Farmer: ${farmerName} <${farmerEmail}>`)
    console.log(`Loan Amount: ${loanAmount}`)
    console.log(`Loan Purpose: ${loanPurpose}`)
    console.log(`PDF Size: ${contractPdfBuffer.length} bytes`)
    console.log("===========================================")

    // Format the contract ID for display
    const contractReference = contractId.substring(0, 8)

    // Format the current time
    const contractTime = new Date().toLocaleString("en-NG", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Africa/Lagos",
    })

    // Send email to lender
    console.log(`SENDING CONTRACT EMAIL TO LENDER: ${lenderEmail}`)
    const lenderEmailResult = await resend.emails.send({
      from: EMAIL_FROM,
      to: lenderEmail,
      subject: `Loan Contract Agreement - Reference #${contractReference}`,
      html: getContractEmailTemplate("lender", lenderName, farmerName, contractReference, loanAmount, loanPurpose),
      attachments: [
        {
          filename: `loan-contract-${contractReference}.pdf`,
          content: contractPdfBuffer.toString("base64"),
        },
      ],
    })

    if (lenderEmailResult.error) {
      console.error(`Error sending contract email to lender ${lenderEmail}:`, lenderEmailResult.error)
      throw new Error(`Failed to send contract email to lender: ${lenderEmailResult.error.message}`)
    }

    console.log(`Contract email sent successfully to lender ${lenderEmail}, message ID: ${lenderEmailResult.data?.id}`)

    // Send email to farmer
    console.log(`SENDING CONTRACT EMAIL TO FARMER: ${farmerEmail}`)
    const farmerEmailResult = await resend.emails.send({
      from: EMAIL_FROM,
      to: farmerEmail,
      subject: `Your Loan Contract Agreement - Reference #${contractReference}`,
      html: getContractEmailTemplate("farmer", farmerName, lenderName, contractReference, loanAmount, loanPurpose),
      attachments: [
        {
          filename: `loan-contract-${contractReference}.pdf`,
          content: contractPdfBuffer.toString("base64"),
        },
      ],
    })

    if (farmerEmailResult.error) {
      console.error(`Error sending contract email to farmer ${farmerEmail}:`, farmerEmailResult.error)
      throw new Error(`Failed to send contract email to farmer: ${farmerEmailResult.error.message}`)
    }

    console.log(`Contract email sent successfully to farmer ${farmerEmail}, message ID: ${farmerEmailResult.data?.id}`)

    console.log("========== CONTRACT EMAILS SENT SUCCESSFULLY ==========")
    console.log(`Lender Email: ${lenderEmail}, Message ID: ${lenderEmailResult.data?.id}`)
    console.log(`Farmer Email: ${farmerEmail}, Message ID: ${farmerEmailResult.data?.id}`)
    console.log("======================================================")

    return {
      success: true,
      lenderMessageId: lenderEmailResult.data?.id,
      farmerMessageId: farmerEmailResult.data?.id,
    }
  } catch (error) {
    console.error("Error in sendContractEmail:", error)
    throw error
  }
}

// Common email styles
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
  .steps, .benefits, .help { 
    background-color: #f9f9f9; 
    padding: 20px 25px; 
    border-radius: 6px; 
    margin: 25px 0; 
    border-left: 4px solid #2e7d32;
  }
  .steps ol, .benefits ul { 
    margin: 15px 0 15px 25px; 
    padding: 0; 
  }
  .steps li, .benefits li { 
    margin-bottom: 12px; 
    line-height: 1.5;
  }
  .reason { 
    background-color: #f9f9f9; 
    padding: 20px 25px; 
    border-left: 4px solid #2e7d32; 
    margin: 25px 0; 
    border-radius: 6px;
  }
  .details { 
    background-color: #f9f9f9; 
    padding: 20px 25px; 
    border-left: 4px solid #2e7d32; 
    margin: 25px 0; 
    border-radius: 6px;
  }
  .action-required { 
    color: #2e7d32; 
    font-weight: bold; 
  }
  .button-container {
    text-align: center;
    margin: 30px 0;
  }
  .divider {
    height: 1px;
    background-color: #eaeaea;
    margin: 15px 0;
  }
  .contract-details {
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 20px;
    margin: 20px 0;
  }
  .contract-details p {
    margin: 10px 0;
  }
  .contract-reference {
    font-family: monospace;
    background-color: #f0f0f0;
    padding: 3px 6px;
    border-radius: 3px;
    font-weight: bold;
  }
  .amount {
    font-weight: bold;
    color: #2e7d32;
  }
`

// Email template for acknowledgment emails
function getAcknowledgmentEmailTemplate(name: string, role: "farmer" | "lender") {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Received</title>
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
        <h1>Registration Received</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thank you for registering as a <span class="highlight">${role}</span> on the FarmCredit platform. We have received your application and it is currently under review.</p>
        
        <div class="steps">
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Our admin team will review your application and verification documents</li>
            <li>You will receive an email notification once your account is approved</li>
            <li>After approval, you can log in and access all platform features</li>
          </ol>
        </div>
        
        <p>The review process typically takes 1-3 business days. We appreciate your patience.</p>
        <p>If you have any questions in the meantime, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The FarmCredit Team</p>
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

// Email template for approval emails
function getApprovalEmailTemplate(name: string, role: "farmer" | "lender") {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved</title>
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
        <h1>Account Approved!</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Great news! Your application to join FarmCredit as a <span class="highlight">${role}</span> has been approved.</p>
        
        <p>You can now log in to your account and access all the features of the FarmCredit platform.</p>
        
        <div class="button-container">
          <a href="https://farmcredit.ng/auth/login" class="button">Log In to Your Account</a>
        </div>
        
        <div class="benefits">
          <p><strong>As a ${role}, you now have access to:</strong></p>
          <ul>
            ${
              role === "farmer"
                ? `
                <li>Apply for agricultural loans with favorable terms</li>
                <li>Access educational resources and farming guides</li>
                <li>Connect with financial institutions and agricultural experts</li>
                <li>Track your loan applications and repayments</li>
              `
                : `
                <li>Access a pool of verified farmers seeking financial support</li>
                <li>Review detailed farmer profiles and agricultural projects</li>
                <li>Manage loan applications and track repayments</li>
                <li>Generate reports on your lending portfolio</li>
              `
            }
          </ul>
        </div>
        
        <p>If you have any questions or need assistance, our support team is always here to help.</p>
        <p>Welcome to the FarmCredit community!</p>
        <p>Best regards,<br>The FarmCredit Team</p>
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

// Email template for rejection emails
function getRejectionEmailTemplate(name: string, role: "farmer" | "lender", reason: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
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
        <h1>Application Status Update</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thank you for your interest in joining FarmCredit as a ${role}.</p>
        <p>After careful review of your application, we regret to inform you that we are unable to approve your account at this time.</p>
        
        <div class="reason">
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        
        <div class="help">
          <p><strong>What can you do next?</strong></p>
          <p>You are welcome to submit a new application with updated information and documentation that addresses the concerns mentioned above.</p>
        </div>
        
        <div class="button-container">
          <a href="https://farmcredit.ng/auth/signup" class="button">Apply Again</a>
        </div>
        
        <p>If you have any questions or need further clarification, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The FarmCredit Team</p>
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

// Email template for admin notification emails
function getAdminNotificationEmailTemplate(
  userName: string,
  userEmail: string,
  role: "farmer" | "lender",
  registrationTime: string,
) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Registration Notification</title>
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
        <h1>New ${role.charAt(0).toUpperCase() + role.slice(1)} Registration</h1>
      </div>
      <div class="content">
        <p>Hello Admin,</p>
        <p><span class="action-required">ACTION REQUIRED:</span> A new <span class="highlight">${role}</span> has registered on the FarmCredit platform and is awaiting your review.</p>
        
        <div class="details">
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Registration Time:</strong> ${registrationTime}</p>
        </div>
        
        <p>Please review this application at your earliest convenience. The applicant has been notified that their registration is under review.</p>
        
        <div class="button-container">
          <a href="https://farmcredit.ng/auth/login/admin" class="button">Review Application</a>
        </div>
        
        <p>Thank you for your prompt attention to this matter.</p>
        <p>Best regards,<br>FarmCredit System</p>
      </div>
      <div class="footer">
        <div class="footer-content">
          <p>&copy; ${new Date().getFullYear()} FarmCredit. All rights reserved.</p>
          <p>You're receiving this email because you're listed as an admin on the FarmCredit platform.</p>
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

// Email template for contract emails
function getContractEmailTemplate(
  recipient: "farmer" | "lender",
  recipientName: string,
  otherPartyName: string,
  contractReference: string,
  loanAmount: number,
  loanPurpose: string,
) {
  const isLender = recipient === "lender"
  const otherPartyRole = isLender ? "farmer" : "lender"

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loan Contract Agreement</title>
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
        <h1>Loan Contract Agreement</h1>
      </div>
      <div class="content">
        <p>Hello ${recipientName},</p>
        
        <p>Your loan contract has been successfully generated and is attached to this email. This contract formalizes the loan agreement between you (as the <span class="highlight">${recipient}</span>) and ${otherPartyName} (as the <span class="highlight">${otherPartyRole}</span>).</p>
        
        <div class="contract-details">
          <p><strong>Contract Reference:</strong> <span class="contract-reference">${contractReference}</span></p>
          <p><strong>Loan Amount:</strong> <span class="amount">₦${loanAmount.toLocaleString()}</span></p>
          <p><strong>Purpose:</strong> ${loanPurpose}</p>
          <p><strong>Date Issued:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="steps">
          <p><strong>Next Steps:</strong></p>
          <ol>
            ${
              isLender
                ? `
                <li>Review the attached contract thoroughly</li>
                <li>Print and sign the contract</li>
                <li>The funds will be disbursed according to the terms in the contract</li>
                <li>Keep this contract for your records</li>
              `
                : `
                <li>Review the attached contract thoroughly</li>
                <li>Print and sign the contract</li>
                <li>Expect the funds to be disbursed according to the terms in the contract</li>
                <li>Keep this contract for your records</li>
              `
            }
          </ol>
        </div>
        
        <p>The attached PDF contains the complete loan agreement with all terms and conditions. Please review it carefully and keep it for your records.</p>
        
        <div class="button-container">
          <a href="https://farmcredit.ng/dashboard/${recipient}" class="button">Go to Dashboard</a>
        </div>
        
        <p>If you have any questions about this contract or need assistance, please contact our support team.</p>
        
        <p>Thank you for using FarmCredit for your agricultural financing needs.</p>
        
        <p>Best regards,<br>The FarmCredit Team</p>
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
