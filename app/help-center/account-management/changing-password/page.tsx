import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, KeyRound, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Changing Your Password | Help Center | FarmCredit",
  description: "Learn how to change your password and keep your FarmCredit account secure",
}

export default function ChangingPasswordPage() {
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
              <span className="text-foreground">Changing Your Password</span>
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
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Changing Your Password</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Learn how to change your password and keep your FarmCredit account secure.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Why Change Your Password Regularly?</h2>
                <p>
                  Regularly changing your password is an important security practice that helps protect your account
                  from unauthorized access. We recommend changing your password:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>At least once every 3-6 months</li>
                  <li>If you suspect someone else might know your password</li>
                  <li>After using your account on a public or shared computer</li>
                  <li>If you receive a security alert about unusual account activity</li>
                </ul>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 text-xl font-medium">How to Change Your Password</h3>
                  <div className="flex items-start gap-4">
                    <KeyRound className="mt-1 h-6 w-6 text-green-600" />
                    <div>
                      <ol className="ml-6 list-decimal space-y-4">
                        <li>
                          <strong>Log in to your FarmCredit account</strong> using your current email and password
                        </li>
                        <li>
                          <strong>Click on your profile picture or initials</strong> in the top-right corner of the
                          screen
                        </li>
                        <li>
                          <strong>Select "Settings"</strong> from the dropdown menu
                        </li>
                        <li>
                          <strong>Navigate to the "Security" tab</strong> or "Password" section
                        </li>
                        <li>
                          <strong>Enter your current password</strong> for verification
                        </li>
                        <li>
                          <strong>Enter your new password twice</strong> to confirm it
                        </li>
                        <li>
                          <strong>Click "Update Password"</strong> to save your changes
                        </li>
                      </ol>
                      <p className="mt-4 text-sm text-muted-foreground">
                        After successfully changing your password, you'll receive a confirmation email notifying you of
                        the change.
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold">Forgot Your Password?</h2>
                <p>If you can't remember your current password, you can reset it using these steps:</p>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>
                    Go to the{" "}
                    <Link href="/auth/login" className="text-green-600 hover:underline">
                      login page
                    </Link>
                  </li>
                  <li>Click on the "Forgot Password?" link below the login form</li>
                  <li>Enter the email address associated with your account</li>
                  <li>Check your email for a password reset link (check your spam folder if you don't see it)</li>
                  <li>Click the link and follow the instructions to create a new password</li>
                </ol>

                <div className="rounded-lg bg-amber-50 p-6 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-1 h-5 w-5 text-amber-600" />
                    <div>
                      <h3 className="font-medium text-amber-800 dark:text-amber-400">Password Reset Link Expiration</h3>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        Password reset links are valid for 24 hours. If your link expires, you'll need to request a new
                        one.
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold">Creating a Strong Password</h2>
                <p>
                  A strong password is your first line of defense against unauthorized access to your account. Follow
                  these guidelines to create a secure password:
                </p>

                <div className="rounded-lg border p-6">
                  <div className="flex items-start gap-4">
                    <ShieldAlert className="mt-1 h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-medium">Password Requirements</h3>
                      <ul className="mt-3 ml-6 list-disc space-y-2">
                        <li>At least 8 characters long (12+ characters is even better)</li>
                        <li>Include at least one uppercase letter (A-Z)</li>
                        <li>Include at least one lowercase letter (a-z)</li>
                        <li>Include at least one number (0-9)</li>
                        <li>Include at least one special character (!, @, #, $, etc.)</li>
                        <li>Avoid using easily guessable information (birthdays, names, etc.)</li>
                        <li>Don't reuse passwords from other websites</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
                    <h3 className="mb-2 font-medium text-red-700 dark:text-red-400">Weak Password Examples</h3>
                    <ul className="ml-5 list-disc text-sm text-red-600 dark:text-red-300">
                      <li>password123</li>
                      <li>qwerty</li>
                      <li>12345678</li>
                      <li>farmcredit</li>
                      <li>your name or birthday</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
                    <h3 className="mb-2 font-medium text-green-700 dark:text-green-400">Strong Password Examples</h3>
                    <ul className="ml-5 list-disc text-sm text-green-600 dark:text-green-300">
                      <li>Tr@v3l*Farm2023!</li>
                      <li>H@rv3st_T1me_N0w</li>
                      <li>Gr0w!ngCr0ps&Seeds</li>
                      <li>F@rm3r2023_N1geria</li>
                      <li>L3nd!ng_M0n3y_S@fely</li>
                    </ul>
                  </div>
                </div>

                <Alert className="mt-6 border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/20 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Password Manager Tip</AlertTitle>
                  <AlertDescription>
                    Consider using a password manager to generate and store strong, unique passwords for all your
                    accounts. This way, you only need to remember one master password.
                  </AlertDescription>
                </Alert>

                <div className="mt-8 rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                  <h3 className="mb-2 font-medium">Need Help?</h3>
                  <p className="text-sm">
                    If you encounter any issues while changing your password, please contact our support team at{" "}
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
