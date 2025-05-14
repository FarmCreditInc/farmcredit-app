import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackRepayment } from "@/actions/repayment-actions"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ success: false, error: "Payment reference not provided" }, { status: 400 })
    }

    console.log("API route: Verifying payment with reference:", reference)

    // Verify the payment
    const result = await verifyPaystackRepayment(reference)

    if (!result.success) {
      console.error("API route: Verification failed:", result.error, result.details)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
          isRetryable: result.isRetryable,
        },
        { status: 400 },
      )
    }

    console.log("API route: Verification successful:", result)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("API route: Verify repayment error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
        isRetryable: true,
      },
      { status: 500 },
    )
  }
}
