import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Upload, FileText, CheckCircle, AlertTriangle, ImageIcon } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Uploading Farm Documents | Farmer Resources | FarmCredit",
  description: "Learn how to properly upload and manage your farm documents on the FarmCredit platform",
}

export default function UploadingDocumentsPage() {
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
              <span className="text-foreground">Uploading Farm Documents</span>
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
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Uploading Farm Documents</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Learn how to properly upload and manage your farm documents on the FarmCredit platform.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Why Document Quality Matters</h2>
                <p>
                  High-quality, clear documents are essential for a successful loan application. Well-documented farms
                  are:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>More likely to receive loan approval</li>
                  <li>Processed faster by our review team</li>
                  <li>More attractive to potential lenders</li>
                  <li>Less likely to require additional information requests</li>
                </ul>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 text-xl font-medium">Types of Documents You'll Need</h3>
                  <div className="flex items-start gap-4">
                    <FileText className="mt-1 h-6 w-6 text-green-600" />
                    <div>
                      <p className="mb-4">
                        The FarmCredit platform requires several types of documents to verify your identity, farm
                        ownership, and farming activities:
                      </p>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Identity Documents</h4>
                          <ul className="ml-6 list-disc">
                            <li>
                              Government-issued ID (National ID, voter's card, driver's license, or international
                              passport)
                            </li>
                            <li>Recent passport-sized photograph</li>
                            <li>Proof of address (utility bill, bank statement, etc.)</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium">Farm Ownership/Lease Documents</h4>
                          <ul className="ml-6 list-disc">
                            <li>Land title documents or certificate of occupancy</li>
                            <li>Lease agreement (if you're renting the farmland)</li>
                            <li>Survey plan or farm boundaries documentation</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium">Farm Operation Documents</h4>
                          <ul className="ml-6 list-disc">
                            <li>Farm business registration (if applicable)</li>
                            <li>Previous harvest records or sales receipts</li>
                            <li>Inventory of farm assets (equipment, livestock, etc.)</li>
                            <li>Farm photographs (current crops, livestock, equipment, etc.)</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium">Financial Documents</h4>
                          <ul className="ml-6 list-disc">
                            <li>Bank statements (last 3-6 months)</li>
                            <li>Income and expense records</li>
                            <li>Previous loan documentation (if applicable)</li>
                            <li>Business plan or proposal for loan usage</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold mt-8">How to Upload Documents</h2>
                <div className="flex items-start gap-4">
                  <Upload className="mt-1 h-6 w-6 text-green-600" />
                  <div>
                    <p className="mb-4">Follow these steps to upload your documents to the FarmCredit platform:</p>
                    <ol className="ml-6 list-decimal space-y-4">
                      <li>
                        <strong>Log in to your FarmCredit account</strong> and navigate to your dashboard
                      </li>
                      <li>
                        <strong>Go to the "Documents" section</strong> in your farmer profile
                      </li>
                      <li>
                        <strong>Select the document type</strong> you want to upload from the dropdown menu
                      </li>
                      <li>
                        <strong>Click the "Upload" button</strong> and select the file from your device
                      </li>
                      <li>
                        <strong>Add a description</strong> if required (e.g., "Land lease agreement for rice farm")
                      </li>
                      <li>
                        <strong>Click "Submit"</strong> to complete the upload
                      </li>
                      <li>
                        <strong>Verify the upload status</strong> - You'll see a confirmation message when the upload is
                        successful
                      </li>
                    </ol>
                    <p className="mt-4 text-sm text-muted-foreground">
                      You can upload multiple documents for each category. For example, you might have several farm
                      photos showing different aspects of your operation.
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold mt-8">Document Requirements and Tips</h2>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium">File Format Requirements</h3>
                    </div>
                    <ul className="ml-10 list-disc text-sm">
                      <li>Accepted file formats: PDF, JPG, PNG, JPEG</li>
                      <li>Maximum file size: 5MB per document</li>
                      <li>Minimum resolution for images: 1200 x 800 pixels</li>
                      <li>Scanned documents should be at least 300 DPI</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <ImageIcon className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium">Farm Photo Guidelines</h3>
                    </div>
                    <ul className="ml-10 list-disc text-sm">
                      <li>Include photos that clearly show your crops, livestock, or farming activities</li>
                      <li>Take photos in good lighting conditions (preferably daylight)</li>
                      <li>Include wide shots showing the scale of your farm</li>
                      <li>Include close-up shots showing the quality of your crops or livestock</li>
                      <li>Include photos of any significant equipment or infrastructure</li>
                      <li>Ensure photos are recent (taken within the last 3 months)</li>
                    </ul>
                  </div>

                  <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Common Document Issues to Avoid</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 ml-6 list-disc space-y-1">
                        <li>Blurry or low-resolution images</li>
                        <li>Dark or poorly lit photos</li>
                        <li>Incomplete documents with missing pages</li>
                        <li>Expired identification documents</li>
                        <li>Documents with information cut off or not visible</li>
                        <li>Files that are too large and fail to upload</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>

                <h2 className="text-2xl font-semibold mt-8">Managing Your Documents</h2>
                <p>After uploading your documents, you can manage them in the Documents section of your profile:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    <strong>View uploaded documents</strong> - See all documents you've uploaded, organized by category
                  </li>
                  <li>
                    <strong>Check document status</strong> - Documents may be marked as "Pending Review," "Verified," or
                    "Rejected"
                  </li>
                  <li>
                    <strong>Replace documents</strong> - If a document is rejected or outdated, you can upload a new
                    version
                  </li>
                  <li>
                    <strong>Delete documents</strong> - Remove documents that are no longer relevant (note: some
                    verified documents cannot be deleted)
                  </li>
                  <li>
                    <strong>Download documents</strong> - Save copies of your uploaded documents for your records
                  </li>
                </ul>

                <div className="rounded-lg bg-green-50 p-6 dark:bg-green-950/20 mt-6">
                  <h3 className="mb-2 font-medium">Document Verification Process</h3>
                  <p className="text-sm mb-4">
                    After you upload documents, our team will review them to verify their authenticity and completeness.
                    This process typically takes 1-3 business days. You'll receive notifications about the status of
                    your documents.
                  </p>
                  <p className="text-sm">
                    If a document is rejected, you'll receive feedback explaining why and instructions on what you need
                    to provide instead.
                  </p>
                </div>

                <div className="mt-8 rounded-lg bg-green-50 p-6 dark:bg-green-950/20">
                  <h3 className="mb-2 font-medium">Need Help?</h3>
                  <p className="text-sm">
                    If you encounter any issues while uploading documents, please contact our support team at{" "}
                    <a href="mailto:documents@farmcredit.ng" className="text-green-600 hover:underline">
                      documents@farmcredit.ng
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
