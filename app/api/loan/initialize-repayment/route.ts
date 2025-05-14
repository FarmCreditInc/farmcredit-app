import { type NextRequest, NextResponse } from "next/server"
import { initializeLoanRepayment } from "@/actions/repayment-actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get the email from the form data
    const email = formData.get("email") as string

    // Get the callback URL from the form data or construct it from the request
    let callbackUrl = formData.get("callbackUrl") as string
    if (!callbackUrl) {
      // Fallback to constructing from request
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
      callbackUrl = `${siteUrl}/dashboard/farmer/loan-payments/callback`
    }

    // Initialize the loan repayment
    const result = await initializeLoanRepayment(formData)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    // Get Paystack secret key from environment variables
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ success: false, error: "Paystack secret key not configured" }, { status: 500 })
    }

    // Initialize Paystack transaction
    // Note: amount includes the platform fee
    const amount = result.data.amount
    const reference = result.data.reference
    const platformFee = result.data.platformFee

    console.log("Initializing Paystack payment with reference:", reference)

    const paystackRequestBody = {
      email,
      amount: Math.round(amount * 100), // Paystack expects amount in kobo (smallest currency unit)
      reference,
      callback_url: callbackUrl,
      metadata: {
        contractId: result.data.contractId,
        platformFee: platformFee,
      },
    }

    console.log("Paystack request body:", JSON.stringify(paystackRequestBody, null, 2))

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackRequestBody),
    })

    const paystackData = await paystackResponse.json()
    console.log("Paystack initialization response:", JSON.stringify(paystackData, null, 2))

    if (!paystackData.status) {
      return NextResponse.json(
        { success: false, error: paystackData.message || "Failed to initialize Paystack payment" },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
      },
    })
  } catch (error) {
    console.error("Initialize repayment error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
