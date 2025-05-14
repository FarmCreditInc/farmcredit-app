import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, UserCog, Upload, Save, AlertCircle } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Updating Your Profile | Help Center | FarmCredit",
  description: "Learn how to update and manage your FarmCredit profile information",
}

export default function UpdatingProfilePage() {
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
              <span className="text-foreground">Updating Your Profile</span>
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
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Updating Your Profile</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Keep your FarmCredit profile up-to-date to ensure you get the most out of our platform.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Why Keep Your Profile Updated?</h2>
                <p>Maintaining an accurate and complete profile is essential for several reasons:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Ensures you receive relevant communications and opportunities</li>
                  <li>Improves your chances of loan approval (for farmers)</li>
                  <li>Helps lenders find your farm projects (for farmers)</li>
                  <li>Provides access to personalized resources and recommendations</li>
                  <li>Maintains the security of your account</li>
                </ul>

                <div className="relative mt-8 overflow-hidden rounded-lg border">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-50 dark:from-green-950/30 dark:to-green-900/20"></div>
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      <UserCog className="mt-1 h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="text-xl font-medium">How to Access Your Profile Settings</h3>
                        <ol className="mt-4 ml-6 list-decimal space-y-3">
                          <li>
                            <strong>Log in to your FarmCredit account</strong> using your email and password
                          </li>
                          <li>
                            <strong>Click on your profile picture or initials</strong> in the top-right corner of the
                            screen
                          </li>
                          <li>
                            <strong>Select "Settings"</strong> from the dropdown menu
                          </li>
                          <li>You'll now be in the profile settings area where you can make changes</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold">What You Can Update</h2>
                <p>Your FarmCredit profile contains several sections that you can update:</p>

                <div className="space-y-6">
                  <div className="rounded-lg border p-6">
                    <h3 className="mb-4 text-xl font-medium">Personal Information</h3>
                    <ul className="ml-6 list-disc space-y-2">
                      <li>
                        <strong>Name:</strong> Update your first and last name
                      </li>
                      <li>
                        <strong>Contact Information:</strong> Update your phone number and alternative email
                      </li>
                      <li>
                        <strong>Address:</strong> Update your physical address and location
                      </li>
                      <li>
                        <strong>Profile Picture:</strong> Upload or change your profile photo
                      </li>
                    </ul>
                    <div className="mt-4 rounded-md bg-muted p-4">
                      <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">Profile Picture Requirements:</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Upload a clear, professional photo of yourself. The file should be less than 5MB in size and in
                        JPG, PNG, or GIF format. Square images work best.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-6">
                    <h3 className="mb-4 text-xl font-medium">Farmer-Specific Information</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      If you have a farmer account, you can update these additional details:
                    </p>
                    <ul className="ml-6 list-disc space-y-2">
                      <li>
                        <strong>Farm Details:</strong> Location, size, and type of farm
                      </li>
                      <li>
                        <strong>Crops/Livestock:</strong> Update what you're currently growing or raising
                      </li>
                      <li>
                        <strong>Production History:</strong> Add recent harvest data and yields
                      </li>
                      <li>
                        <strong>Farm Photos:</strong> Upload new images of your farm and operations
                      </li>
                      <li>
                        <strong>Business Plan:</strong> Update your farming goals and plans
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border p-6">
                    <h3 className="mb-4 text-xl font-medium">Lender-Specific Information</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      If you have a lender account, you can update these additional details:
                    </p>
                    <ul className="ml-6 list-disc space-y-2">
                      <li>
                        <strong>Investment Preferences:</strong> Types of farms or projects you prefer to fund
                      </li>
                      <li>
                        <strong>Investment Capacity:</strong> Update your available funding amount
                      </li>
                      <li>
                        <strong>Risk Tolerance:</strong> Adjust your risk preference settings
                      </li>
                      <li>
                        <strong>Organization Details:</strong> Update information about your company or organization
                      </li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold">Saving Your Changes</h2>
                <div className="flex items-start gap-4">
                  <Save className="mt-1 h-6 w-6 text-green-600" />
                  <div>
                    <p>
                      After making changes to your profile, be sure to click the "Save Changes" or "Update" button at
                      the bottom of each section. Changes are not automatically saved until you confirm them.
                    </p>
                    <p className="mt-2">
                      You'll receive a confirmation message once your changes have been successfully saved.
                    </p>
                  </div>
                </div>

                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    Some profile changes may require verification or review by our team before they take effect,
                    especially changes to critical information like your name or bank details.
                  </AlertDescription>
                </Alert>

                <div className="mt-8 rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                  <h3 className="mb-2 font-medium">Need Help?</h3>
                  <p className="text-sm">
                    If you encounter any issues while updating your profile, please contact our support team at{" "}
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
