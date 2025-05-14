import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, User, UserCog, KeyRound, Shield, ChevronRight } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Account Management | Help Center | FarmCredit",
  description: "Learn how to manage your FarmCredit account, update your profile, and secure your information",
}

export default function AccountManagementPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6 md:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center text-sm text-muted-foreground">
              <Link href="/help-center" className="hover:text-foreground">
                Help Center
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Account Management</span>
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
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Account Management</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Learn how to manage your account, update your profile, and secure your information
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      Creating an Account
                    </CardTitle>
                    <CardDescription>Learn how to create and set up your FarmCredit account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step guide to creating your account, verifying your email, and completing your profile.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/help-center/account-management/creating-account">
                      <Button variant="ghost" className="text-green-600 p-0 hover:text-green-700 hover:bg-transparent">
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5 text-green-600" />
                      Updating Your Profile
                    </CardTitle>
                    <CardDescription>Keep your profile information current and accurate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Learn how to update your personal information, contact details, and profile settings.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/help-center/account-management/updating-profile">
                      <Button variant="ghost" className="text-green-600 p-0 hover:text-green-700 hover:bg-transparent">
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-green-600" />
                      Changing Your Password
                    </CardTitle>
                    <CardDescription>Update your password and recover access to your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Instructions for changing your password, creating strong passwords, and recovering your account.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/help-center/account-management/changing-password">
                      <Button variant="ghost" className="text-green-600 p-0 hover:text-green-700 hover:bg-transparent">
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Account Security
                    </CardTitle>
                    <CardDescription>Protect your account and personal information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Best practices for keeping your account secure, recognizing phishing attempts, and what to do if
                      you suspect a security breach.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/help-center/account-management/account-security">
                      <Button variant="ghost" className="text-green-600 p-0 hover:text-green-700 hover:bg-transparent">
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>

              <div className="mt-12 rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Related Topics</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/help-center/farmer-resources"
                          className="text-green-600 hover:underline flex items-center"
                        >
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Farmer Resources
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/help-center/lender-information"
                          className="text-green-600 hover:underline flex items-center"
                        >
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Lender Information
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/help-center/troubleshooting"
                          className="text-green-600 hover:underline flex items-center"
                        >
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Troubleshooting
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Contact Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Need more help with your account? Our support team is ready to assist you.
                    </p>
                    <Link href="/help-center#contact">
                      <Button size="sm" className="mt-2">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
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
