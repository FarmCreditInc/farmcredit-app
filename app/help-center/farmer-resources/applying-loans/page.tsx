import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, FileText, Calendar, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Applying for Loans | Farmer Resources | FarmCredit",
  description: "Learn how to apply for agricultural loans through the FarmCredit platform",
}

export default function ApplyingLoansPage() {
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
              <Link href="/help-center/farmer-resources" className="hover:text-foreground">
                Farmer Resources
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Applying for Loans</span>
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
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Applying for Loans</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  A comprehensive guide to applying for agricultural loans through the FarmCredit platform.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Loan Options Available</h2>
                <p>
                  FarmCredit offers various loan types designed specifically for Nigerian farmers. Understanding the
                  different options will help you choose the one that best fits your needs:
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">Working Capital Loans</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Short-term financing for day-to-day operations like purchasing seeds, fertilizers, and paying
                        labor.
                      </p>
                      <ul className="text-sm ml-5 list-disc space-y-1">
                        <li>Loan amounts: ₦50,000 - ₦500,000</li>
                        <li>Terms: 3-12 months</li>
                        <li>Interest rates: 5-15% (varies by risk profile)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">Equipment Financing</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Medium-term loans for purchasing farming equipment, machinery, or vehicles.
                      </p>
                      <ul className="text-sm ml-5 list-disc space-y-1">
                        <li>Loan amounts: ₦200,000 - ₦2,000,000</li>
                        <li>Terms: 1-3 years</li>
                        <li>Interest rates: 8-18% (varies by risk profile)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">Farm Expansion Loans</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Longer-term financing for expanding your farm, purchasing land, or building infrastructure.
                      </p>
                      <ul className="text-sm ml-5 list-disc space-y-1">
                        <li>Loan amounts: ₦500,000 - ₦5,000,000</li>
                        <li>Terms: 2-5 years</li>
                        <li>Interest rates: 10-20% (varies by risk profile)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">Emergency Loans</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Quick access to funds for unexpected challenges like pest outbreaks or equipment breakdowns.
                      </p>
                      <ul className="text-sm ml-5 list-disc space-y-1">
                        <li>Loan amounts: ₦50,000 - ₦300,000</li>
                        <li>Terms: 1-6 months</li>
                        <li>Interest rates: 10-18% (varies by risk profile)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <h2 className="text-2xl font-semibold mt-8">Eligibility Requirements</h2>
                <p>Before applying, ensure you meet these basic eligibility criteria:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Nigerian citizen or legal resident aged 18-45 years</li>
                  <li>Active farming operation with at least 6 months of history</li>
                  <li>Valid identification (National ID, voter's card, driver's license, or international passport)</li>
                  <li>Proof of farm ownership or valid lease agreement</li>
                  <li>Bank account in your name</li>
                  <li>Completed FarmCredit profile with verified information</li>
                  <li>Good standing on any previous loans (if applicable)</li>
                </ul>

                <div className="rounded-lg border bg-card p-6 mt-6">
                  <h3 className="mb-4 text-xl font-medium">Application Process</h3>
                  <div className="flex items-start gap-4">
                    <FileText className="mt-1 h-6 w-6 text-green-600" />
                    <div>
                      <ol className="ml-6 list-decimal space-y-4">
                        <li>
                          <strong>Complete your farmer profile</strong> - Ensure all sections of your FarmCredit profile
                          are complete and up-to-date, including farm details, production history, and financial
                          information.
                        </li>
                        <li>
                          <strong>Access the loan application</strong> - Log in to your dashboard and navigate to the
                          "Loans" section, then click on "Apply for Loan."
                        </li>
                        <li>
                          <strong>Select loan type</strong> - Choose the type of loan that best fits your needs from the
                          available options.
                        </li>
                        <li>
                          <strong>Complete the application form</strong> - Provide details about your loan request,
                          including the amount needed, purpose, and repayment plan.
                        </li>
                        <li>
                          <strong>Upload required documents</strong> - Attach any additional documents requested, such
                          as farm photos, business plans, or financial records.
                        </li>
                        <li>
                          <strong>Review and submit</strong> - Carefully review all information before submitting your
                          application.
                        </li>
                        <li>
                          <strong>Application review</strong> - Our team will review your application, which typically
                          takes 3-5 business days.
                        </li>
                        <li>
                          <strong>Approval and disbursement</strong> - If approved, you'll receive notification and
                          funds will be disbursed to your registered bank account.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold mt-8">Required Documents</h2>
                <p>Prepare these documents before starting your application:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Valid government-issued ID (front and back)</li>
                  <li>Recent passport-sized photograph</li>
                  <li>Proof of farm ownership or lease agreement</li>
                  <li>Recent photographs of your farm (showing crops, livestock, or facilities)</li>
                  <li>Bank statements for the past 3-6 months</li>
                  <li>Records of previous harvests or sales (if available)</li>
                  <li>Simple business plan or proposal for how the loan will be used</li>
                  <li>Any existing loan documentation (if applicable)</li>
                </ul>

                <Alert className="mt-6 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Document Quality Matters</AlertTitle>
                  <AlertDescription>
                    Ensure all documents are clear, legible, and complete. Poor quality documents can delay your
                    application or lead to rejection.
                  </AlertDescription>
                </Alert>

                <h2 className="text-2xl font-semibold mt-8">Application Timeline</h2>
                <div className="flex items-start gap-4">
                  <Calendar className="mt-1 h-6 w-6 text-green-600" />
                  <div>
                    <p className="mb-4">
                      Understanding the typical timeline for loan applications can help you plan accordingly:
                    </p>
                    <ul className="space-y-3">
                      <li>
                        <strong>Application submission:</strong> 15-30 minutes (depending on document readiness)
                      </li>
                      <li>
                        <strong>Initial review:</strong> 1-2 business days
                      </li>
                      <li>
                        <strong>Detailed assessment:</strong> 2-3 additional business days
                      </li>
                      <li>
                        <strong>Verification calls or visits:</strong> May add 1-2 days (if needed)
                      </li>
                      <li>
                        <strong>Final decision:</strong> 3-5 business days from submission
                      </li>
                      <li>
                        <strong>Fund disbursement:</strong> 1-2 business days after approval
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Total time from application to funding typically ranges from 5-10 business days, depending on the
                      completeness of your application and responsiveness to any additional information requests.
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold mt-8">Tips for a Successful Application</h2>
                <div className="rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="mt-1 h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-medium">Increase Your Chances of Approval</h3>
                      <ul className="mt-3 ml-6 list-disc space-y-2">
                        <li>Complete your profile 100% before applying</li>
                        <li>Maintain accurate and up-to-date farm records</li>
                        <li>Be realistic about the loan amount you request</li>
                        <li>Clearly explain how the loan will improve your farm's productivity or profitability</li>
                        <li>Include photos that clearly show your farming activities</li>
                        <li>Be transparent about any existing loans or financial obligations</li>
                        <li>Respond promptly to any requests for additional information</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold mt-8">After You Apply</h2>
                <p>Once your application is submitted:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Monitor your dashboard and email for updates on your application status</li>
                  <li>Be prepared to answer follow-up questions from our assessment team</li>
                  <li>You may receive a verification call or farm visit as part of the review process</li>
                  <li>If approved, review the loan terms carefully before accepting</li>
                  <li>
                    If declined, you'll receive feedback on why and guidance on how to improve future applications
                  </li>
                </ul>

                <div className="mt-8 rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-1 h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="mb-2 font-medium">Need Help?</h3>
                      <p className="text-sm">
                        If you have questions about the loan application process or need assistance, please contact our
                        support team at{" "}
                        <a href="mailto:loans@farmcredit.ng" className="text-green-600 hover:underline">
                          loans@farmcredit.ng
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
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
