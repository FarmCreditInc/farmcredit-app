import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Leaf, FileText, BarChart, CheckCircle, ChevronRight } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Farmer Resources | Help Center | FarmCredit",
  description: "Resources specifically designed for farmers to maximize their success on the FarmCredit platform",
}

export default function FarmerResourcesPage() {
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
              <span className="text-foreground">Farmer Resources</span>
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
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Farmer Resources</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Resources specifically designed for farmers to maximize their success on our platform
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      Applying for Loans
                    </CardTitle>
                    <CardDescription>Learn how to apply for agricultural loans through our platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      A comprehensive guide to the loan application process, eligibility requirements, and tips for
                      success.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/help-center/farmer-resources/applying-loans">
                      <Button variant="ghost" className="text-green-600 p-0 hover:text-green-700 hover:bg-transparent">
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Uploading Farm Documents
                    </CardTitle>
                    <CardDescription>How to properly upload and manage your farm documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Guidelines for document quality, required formats, and tips for effective documentation of your
                      farm.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/help-center/farmer-resources/uploading-documents">
                      <Button variant="ghost" className="text-green-600 p-0 hover:text-green-700 hover:bg-transparent">
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-green-600" />
                      Tracking Application Status
                    </CardTitle>
                    <CardDescription>Monitor the progress of your loan applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Learn how to check your application status, understand different status indicators, and what to
                      expect at each stage.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/help-center/farmer-resources/tracking-status">
                      <Button variant="ghost" className="text-green-600 p-0 hover:text-green-700 hover:bg-transparent">
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Farm Verification Process
                    </CardTitle>
                    <CardDescription>Understanding how we verify your farming operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Details about our verification process, what to expect during farm visits, and how to prepare for
                      verification.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/help-center/farmer-resources/verification-process">
                      <Button variant="ghost" className="text-green-600 p-0 hover:text-green-700 hover:bg-transparent">
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>

              <div className="mt-12 rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                <h2 className="text-xl font-semibold mb-4">Additional Farmer Resources</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Educational Resources</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/education-hub" className="text-green-600 hover:underline flex items-center">
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Education Hub
                        </Link>
                      </li>
                      <li>
                        <Link href="/farming-guides" className="text-green-600 hover:underline flex items-center">
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Farming Guides
                        </Link>
                      </li>
                      <li>
                        <Link href="/financial-tips" className="text-green-600 hover:underline flex items-center">
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Financial Tips
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Tools & Calculators</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/financial-calculator" className="text-green-600 hover:underline flex items-center">
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Loan Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/crop-calendar" className="text-green-600 hover:underline flex items-center">
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Crop Calendar
                        </Link>
                      </li>
                      <li>
                        <Link href="/market-prices" className="text-green-600 hover:underline flex items-center">
                          <ChevronRight className="mr-1 h-3 w-3" />
                          Market Price Tracker
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Farmer Success Stories</h2>
                <p className="mb-4">
                  Learn from other farmers who have successfully used FarmCredit to grow their agricultural businesses.
                </p>
                <Link href="/success-stories">
                  <Button>View Success Stories</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
