import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { verifyToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { amount, email, walletId } = body

    // Validate required fields
    if (!amount || !email) {
      return NextResponse.json({ error: "Amount and email are required" }, { status: 400 })
    }

    // Get user from custom JWT token
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const session = await verifyToken(sessionCookie.value)

    if (!session || session.role !== "lender") {
      return NextResponse.json({ error: "Unauthorized: Lender access required" }, { status: 403 })
    }

    const lenderId = session.id

    // Verify wallet belongs to this lender if walletId is provided
    if (walletId) {
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("id")
        .eq("id", walletId)
        .eq("lender_id", lenderId)
        .single()

      if (walletError) {
        console.error("Error verifying wallet ownership:", walletError)
        return NextResponse.json({ error: "Wallet verification failed" }, { status: 403 })
      }
    }

    // Get the Paystack secret key from environment variables
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY is not defined in environment variables")
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 })
    }

    // Convert amount to kobo (smallest currency unit in Nigeria)
    const amountInKobo = Math.round(amount * 100)

    // Generate a unique reference
    const reference = `tx_${Date.now()}_${Math.floor(Math.random() * 1000000)}`

    // Construct the callback URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || "http://localhost:3000"
    const callbackUrl = `${baseUrl}/api/paystack/verify`

    console.log("Initializing Paystack payment with:", {
      amount: amountInKobo,
      email,
      reference,
      callback_url: callbackUrl,
      metadata: { wallet_id: walletId, lender_id: lenderId },
    })

    // Initialize payment with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInKobo,
        email,
        reference,
        callback_url: callbackUrl,
        metadata: {
          wallet_id: walletId,
          lender_id: lenderId,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Paystack initialization failed:", errorText)
      return NextResponse.json({ error: "Failed to initialize payment with Paystack" }, { status: response.status })
    }

    const data = await response.json()
    console.log("Paystack initialization successful:", data)

    return NextResponse.json(data.data)
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "An error occurred while initializing payment" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
