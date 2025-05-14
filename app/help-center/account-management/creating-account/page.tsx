import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, User, Shield, KeyRound, CheckCircle } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Creating an Account | Help Center | FarmCredit",
  description: "Learn how to create and set up your FarmCredit account",
}

export default function CreatingAccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6 md:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center text-sm text-muted-foreground">
              <Link href="/help-center" className="hover:text-foreground">
                Help Center
              </Link>
              <span className="mx-2">/</span>
              <Link href="/help-center/account-management" className="hover:text-foreground">
                Account Management
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Creating an Account</span>
            </div>

            {/* Back button */}
            <Link href="/help-center">
              <Button variant="ghost" className="mb-6 flex items-center gap-1 p-0 hover:bg-transparent">
                <ChevronLeft className="h-4 w-4" />
                Back to Help Center
              </Button>
            </Link>

            {/* Main content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Creating an Account</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Learn how to create and set up your FarmCredit account in a few simple steps.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Getting Started</h2>
                <p>
                  Creating an account on FarmCredit is the first step towards accessing financial resources for your
                  farming business. Our registration process is designed to be straightforward while collecting the
                  necessary information to serve you better.
                </p>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 text-xl font-medium">Step-by-Step Account Creation</h3>
                  <ol className="ml-6 list-decimal space-y-4">
                    <li>
                      <strong>Visit the FarmCredit website</strong> - Navigate to{" "}
                      <Link href="/" className="text-green-600 hover:underline">
                        farmcredit.ng
                      </Link>{" "}
                      and click on the "Sign Up" button in the top right corner.
                    </li>
                    <li>
                      <strong>Choose your role</strong> - Select whether you're registering as a Farmer or a Lender.
                      This determines the type of account you'll create and the features you'll have access to.
                    </li>
                    <li>
                      <strong>Fill in your personal information</strong> - Provide your full name, email address, phone
                      number, and create a secure password. Make sure to use an email address you check regularly, as
                      we'll send important notifications there.
                    </li>
                    <li>
                      <strong>Verify your email</strong> - Check your email inbox for a verification link from
                      FarmCredit. Click the link to verify your email address. If you don't see the email, check your
                      spam folder.
                    </li>
                    <li>
                      <strong>Complete your profile</strong> - After verification, you'll be prompted to complete your
                      profile with additional information specific to your role (farmer or lender).
                    </li>
                  </ol>
                </div>

                <h2 className="text-2xl font-semibold">Account Requirements</h2>
                <p>
                  To create a FarmCredit account, you'll need to meet the following requirements and have these items
                  ready:
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <User className="mt-1 h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-medium">Valid Identification</h3>
                        <p className="text-sm text-muted-foreground">
                          A government-issued ID such as a National ID card, driver's license, or international
                          passport.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <Shield className="mt-1 h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-medium">Active Email Address</h3>
                        <p className="text-sm text-muted-foreground">
                          An email address you regularly check for account verification and communications.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <KeyRound className="mt-1 h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-medium">Strong Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Create a password with at least 8 characters, including uppercase, lowercase, numbers, and
                          special characters.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <CheckCircle className="mt-1 h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-medium">Phone Number</h3>
                        <p className="text-sm text-muted-foreground">
                          A valid Nigerian phone number for account verification and security purposes.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h2 className="text-2xl font-semibold">Additional Information for Farmers</h2>
                <p>
                  If you're registering as a farmer, you'll need to provide additional information about your farming
                  activities:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Farm location and size</li>
                  <li>Types of crops or livestock</li>
                  <li>Farming experience</li>
                  <li>Current farming challenges</li>
                  <li>Financial needs and goals</li>
                </ul>

                <h2 className="text-2xl font-semibold">Additional Information for Lenders</h2>
                <p>
                  If you're registering as a lender, you'll need to provide additional information about your investment
                  interests:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Investment capacity</li>
                  <li>Preferred farming sectors</li>
                  <li>Investment goals and timeline</li>
                  <li>Risk tolerance</li>
                </ul>

                <div className="rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                  <h3 className="mb-2 font-medium">Need Help?</h3>
                  <p className="text-sm">
                    If you encounter any issues during the registration process, please contact our support team at{" "}
                    <a href="mailto:support@farmcredit.ng" className="text-green-600 hover:underline">
                      support@farmcredit.ng
                    </a>{" "}
                    or call{" "}
                    <a href="tel:+2348000000000" className="text-green-600 hover:underline">
                      +234 800 000 0000
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
