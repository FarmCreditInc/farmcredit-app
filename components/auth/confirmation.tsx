"use client"

import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ConfirmationProps {
  role?: "farmer" | "lender"
}

export function Confirmation({ role = "user" }: ConfirmationProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Application Received!</CardTitle>
          <CardDescription>Thank you for registering as a {role} on FarmCredit</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Your application has been received and is currently under review by our team.</p>
          <p className="mb-4">
            The review process typically takes 1-3 business days. You will receive an email notification once your
            account is approved.
          </p>
          <p>If you have any questions in the meantime, please don't hesitate to contact our support team.</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 flex-wrap">
          <Button asChild variant="default">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about-us">Learn About Us</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
