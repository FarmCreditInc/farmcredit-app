import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-4">Application Received</h1>

        <p className="mb-6 text-muted-foreground">
          Thank you for your application. Our team will review your information and get back to you shortly. This
          process typically takes 1-3 business days.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/">Go Home</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/about-us">Learn About Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
