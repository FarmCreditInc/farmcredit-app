import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Shield, Lock, Smartphone, AlertTriangle, Eye, Bell } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Account Security | Help Center | FarmCredit",
  description: "Learn how to keep your FarmCredit account secure and protect your information",
}

export default function AccountSecurityPage() {
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
              <span className="text-foreground">Account Security</span>
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
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Account Security</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Learn how to keep your FarmCredit account secure and protect your personal and financial information.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Why Account Security Matters</h2>
                <p>
                  Your FarmCredit account contains sensitive personal and financial information. Keeping your account
                  secure is essential to:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Protect your personal information from unauthorized access</li>
                  <li>Prevent unauthorized financial transactions</li>
                  <li>Maintain the integrity of your farming or lending profile</li>
                  <li>Ensure continued access to your account and services</li>
                </ul>

                <div className="rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                  <div className="flex items-start gap-4">
                    <Shield className="mt-1 h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="text-xl font-medium">Security Features We Provide</h3>
                      <p className="mt-2 text-muted-foreground">
                        FarmCredit implements several security measures to protect your account:
                      </p>
                      <ul className="mt-3 ml-6 list-disc space-y-2">
                        <li>Encrypted connections (HTTPS) for all communications</li>
                        <li>Secure password storage using industry-standard hashing</li>
                        <li>Email notifications for important account activities</li>
                        <li>Session timeouts after periods of inactivity</li>
                        <li>Regular security audits and updates</li>
                        <li>Fraud monitoring systems</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold">Security Best Practices</h2>
                <p>
                  While we implement robust security measures on our end, your actions are equally important in keeping
                  your account secure. Follow these best practices:
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-green-600" />
                        Password Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="ml-6 list-disc space-y-2 text-sm">
                        <li>Use a strong, unique password for your FarmCredit account</li>
                        <li>Change your password regularly (every 3-6 months)</li>
                        <li>Never share your password with anyone</li>
                        <li>Don't reuse passwords from other websites</li>
                        <li>Consider using a password manager</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        Device Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="ml-6 list-disc space-y-2 text-sm">
                        <li>Keep your devices updated with the latest security patches</li>
                        <li>Use antivirus software and keep it updated</li>
                        <li>Lock your devices when not in use</li>
                        <li>Be cautious when using public Wi-Fi networks</li>
                        <li>Clear your browser cache after using shared computers</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-green-600" />
                        Login Vigilance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="ml-6 list-disc space-y-2 text-sm">
                        <li>Always log out when finished, especially on shared devices</li>
                        <li>Check that you're on the correct website before logging in</li>
                        <li>Verify the website has a secure connection (https://)</li>
                        <li>Be alert to unusual login screens or requests</li>
                        <li>Review your recent account activity regularly</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-green-600" />
                        Stay Informed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="ml-6 list-disc space-y-2 text-sm">
                        <li>Keep your contact information up-to-date</li>
                        <li>Monitor your email for security notifications</li>
                        <li>Report suspicious activities immediately</li>
                        <li>Stay informed about common phishing techniques</li>
                        <li>Follow FarmCredit's security announcements</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <h2 className="text-2xl font-semibold">Recognizing Phishing Attempts</h2>
                <p>
                  Phishing is a common technique used by fraudsters to trick you into revealing your login credentials
                  or personal information. Be alert to these warning signs:
                </p>

                <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning Signs of Phishing</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 ml-6 list-disc space-y-1">
                      <li>Emails or messages with urgent requests for your login information</li>
                      <li>Communications with poor grammar or spelling errors</li>
                      <li>Emails from addresses that look similar to but slightly different from farmcredit.ng</li>
                      <li>Links that lead to suspicious websites</li>
                      <li>Requests for personal information we would never ask for via email</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg border p-6">
                  <h3 className="mb-4 text-xl font-medium">Important: How FarmCredit Will Contact You</h3>
                  <p className="mb-4">To help you identify legitimate communications from us:</p>
                  <ul className="ml-6 list-disc space-y-2">
                    <li>We will never ask for your password via email or phone</li>
                    <li>Official emails will always come from @farmcredit.ng domain</li>
                    <li>We will address you by your registered name</li>
                    <li>
                      Security notifications will direct you to log in to your account directly (not via email links)
                    </li>
                    <li>Our customer support team will verify your identity before discussing account details</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-semibold">What to Do If You Suspect a Security Breach</h2>
                <p>If you notice any suspicious activity or believe your account security has been compromised:</p>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>
                    <strong>Change your password immediately</strong> from a secure device
                  </li>
                  <li>
                    <strong>Contact our support team</strong> at{" "}
                    <a href="mailto:security@farmcredit.ng" className="text-green-600 hover:underline">
                      security@farmcredit.ng
                    </a>{" "}
                    or call{" "}
                    <a href="tel:+2348000000000" className="text-green-600 hover:underline">
                      +234 800 000 0000
                    </a>
                  </li>
                  <li>
                    <strong>Review your recent account activity</strong> for unauthorized changes or transactions
                  </li>
                  <li>
                    <strong>Check your email account security</strong> as it may also be compromised
                  </li>
                  <li>
                    <strong>Run a security scan</strong> on your devices for malware or viruses
                  </li>
                </ol>

                <div className="mt-8 rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                  <h3 className="mb-2 font-medium">Need Help?</h3>
                  <p className="text-sm">
                    For any security concerns or questions, please contact our security team at{" "}
                    <a href="mailto:security@farmcredit.ng" className="text-green-600 hover:underline">
                      security@farmcredit.ng
                    </a>{" "}
                    or call our dedicated security hotline at{" "}
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
