"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  GraduationCap,
  AlertTriangle,
  ExternalLink,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface LoanDetailsClientProps {
  loanData: any
}

export function LoanDetailsClient({ loanData }: LoanDetailsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<{ url: string; name: string } | null>(null)

  const { loan, farmerAddress, repayments, platformFee, summary } = loanData

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "defaulted":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const viewDocument = (url: string, name: string) => {
    if (!url) {
      toast({
        title: "Document not available",
        description: "This document is not available for viewing",
        variant: "destructive",
      })
      return
    }

    setCurrentDocument({ url, name })
    setShowDocumentDialog(true)
  }

  const goBack = () => {
    router.back()
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Approved Loans
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Loan Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Loan Summary</CardTitle>
                <CardDescription>Disbursed on {format(new Date(loan.created_at), "MMMM d, yyyy")}</CardDescription>
              </div>
              <Badge className={getStatusColor(loan.status)}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Loan Amount</h3>
                <p className="text-2xl font-bold">{formatCurrency(loan.amount_disbursed)}</p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Total Expected Repayment</h3>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalExpected)}</p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Interest Rate</h3>
                <p className="text-xl font-semibold">{(loan.interest_rate * 100).toFixed(1)}%</p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Loan Duration</h3>
                <p className="text-xl font-semibold">{loan.loan_application.loan_duration_days} days</p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Repaid Amount</h3>
                <p className="text-xl font-semibold">{formatCurrency(summary.totalPaid)}</p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Outstanding Balance</h3>
                <p className="text-xl font-semibold">{formatCurrency(summary.remainingBalance)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Repayment Progress</h3>
                <span className="text-sm font-medium">{summary.progressPercentage}%</span>
              </div>
              <Progress value={summary.progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(summary.totalPaid)}</span>
                <span>{formatCurrency(summary.totalExpected)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Time Remaining</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <p className={`text-lg font-semibold ${summary.isExpired ? "text-red-600" : ""}`}>
                    {summary.isExpired ? "Expired" : `${summary.daysRemaining} days remaining`}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Next Payment</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <p className="text-lg font-semibold">
                    {summary.nextPaymentDate
                      ? `${format(new Date(summary.nextPaymentDate), "MMM d, yyyy")} - ${formatCurrency(summary.nextPaymentAmount)}`
                      : "No upcoming payments"}
                  </p>
                </div>
              </div>
            </div>

            {summary.penalty > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Late Payment Penalty</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This loan is past due. A penalty of {formatCurrency(summary.penalty)} has been applied.
                  </p>
                </div>
              </div>
            )}

            {platformFee && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Platform Fee</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    A platform fee of {formatCurrency(platformFee.amount)} ({platformFee.fee_percentage}%) was applied
                    to this loan. Status:{" "}
                    <Badge variant="outline" className="ml-1">
                      {platformFee.status}
                    </Badge>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column - Farmer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Farmer Information</CardTitle>
            <CardDescription>Details about the borrower</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border">
                <AvatarImage
                  src={loan.loan_application.farmer.profile_url || "/placeholder.svg?height=64&width=64&query=farmer"}
                  alt={loan.loan_application.farmer.full_name}
                />
                <AvatarFallback>
                  {loan.loan_application.farmer.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{loan.loan_application.farmer.full_name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{loan.loan_application.farmer.email}</span>
                </div>
                {loan.loan_application.farmer.phone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{loan.loan_application.farmer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {loan.loan_application.farmer.gender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Gender</span>
                    <p className="font-medium">{loan.loan_application.farmer.gender}</p>
                  </div>
                </div>
              )}

              {loan.loan_application.farmer.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Date of Birth</span>
                    <p className="font-medium">
                      {format(new Date(loan.loan_application.farmer.date_of_birth), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {loan.loan_application.farmer.education_level && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Education</span>
                    <p className="font-medium">{loan.loan_application.farmer.education_level}</p>
                  </div>
                </div>
              )}

              {farmerAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-sm text-muted-foreground">Address</span>
                    <p className="font-medium">
                      {farmerAddress.street_address}, {farmerAddress.city}, {farmerAddress.state}
                      {farmerAddress.postal_code ? `, ${farmerAddress.postal_code}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {loan.loan_application.farmer.identification_type && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">ID Type</span>
                    <p className="font-medium">{loan.loan_application.farmer.identification_type}</p>
                  </div>
                </div>
              )}

              {loan.loan_application.farmer.identification_number && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">ID Number</span>
                    <p className="font-medium">{loan.loan_application.farmer.identification_number}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="application" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="application">Loan Application</TabsTrigger>
          <TabsTrigger value="repayments">Repayment Schedule</TabsTrigger>
          <TabsTrigger value="farm">Farm Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="application" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Application Details</CardTitle>
              <CardDescription>Information provided in the loan application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Purpose Category</h3>
                  <p className="font-medium">{loan.loan_application.purpose_category || "Not specified"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Amount Requested</h3>
                  <p className="font-medium">{formatCurrency(loan.loan_application.amount_requested || 0)}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Preferred Repayment Plan</h3>
                  <p className="font-medium">{loan.loan_application.preferred_repayment_plan || "Not specified"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Existing Loans</h3>
                  <p className="font-medium">{loan.loan_application.existing_loans ? "Yes" : "No"}</p>
                </div>
                {loan.loan_application.existing_loans && (
                  <>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-muted-foreground">Existing Loan Amount</h3>
                      <p className="font-medium">
                        {formatCurrency(loan.loan_application.total_existing_loan_amount || 0)}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-muted-foreground">Existing Loan Duration</h3>
                      <p className="font-medium">{loan.loan_application.existing_loan_duration_days || 0} days</p>
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Collateral Type</h3>
                  <p className="font-medium">{loan.loan_application.collateral_type || "None"}</p>
                </div>
              </div>

              {loan.loan_application.description && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-muted-foreground">Loan Description</h3>
                    <p className="text-sm">{loan.loan_application.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repayments" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Repayment Schedule</CardTitle>
              <CardDescription>Scheduled and completed repayments</CardDescription>
            </CardHeader>
            <CardContent>
              {repayments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No repayment schedule available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium text-sm">Due Date</th>
                        <th className="px-4 py-3 text-left font-medium text-sm">Amount</th>
                        <th className="px-4 py-3 text-left font-medium text-sm">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-sm">Payment Date</th>
                        <th className="px-4 py-3 text-left font-medium text-sm">Late Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repayments.map((repayment: any, index: number) => (
                        <tr key={repayment.id} className={`border-b ${index % 2 === 0 ? "bg-muted/20" : ""}`}>
                          <td className="px-4 py-3">
                            {repayment.due_date ? format(new Date(repayment.due_date), "MMM d, yyyy") : "N/A"}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {formatCurrency(repayment.periodic_repayment_amount || 0)}
                          </td>
                          <td className="px-4 py-3">
                            {repayment.date_paid ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                            ) : new Date(repayment.due_date) < new Date() ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {repayment.date_paid ? format(new Date(repayment.date_paid), "MMM d, yyyy") : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {repayment.fine_amount > 0 ? (
                              <div className="flex items-center gap-1">
                                <span className="text-red-600 font-medium">
                                  {formatCurrency(repayment.fine_amount)}
                                </span>
                                {repayment.fine_paid && (
                                  <Badge variant="outline" className="ml-1 text-xs">
                                    Paid
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farm" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
              <CardDescription>Information about the farmer's farm</CardDescription>
            </CardHeader>
            <CardContent>
              {!loan.loan_application.farm ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No farm details available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-muted-foreground">Farm Name</h3>
                      <p className="font-medium">{loan.loan_application.farm.name || "Unnamed Farm"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-muted-foreground">Farm Size</h3>
                      <p className="font-medium">
                        {loan.loan_application.farm.size || "N/A"} {loan.loan_application.farm.size_units || ""}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Irrigation</h3>
                      <p className="font-medium">{loan.loan_application.farm.uses_irrigation ? "Yes" : "No"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Fertilizer</h3>
                      <p className="font-medium">{loan.loan_application.farm.uses_fertilizer ? "Yes" : "No"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Machinery</h3>
                      <p className="font-medium">{loan.loan_application.farm.uses_machinery ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  {loan.loan_application.farm.photo && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Farm Photo</h3>
                      <div className="rounded-md overflow-hidden border">
                        <img
                          src={loan.loan_application.farm.photo || "/placeholder.svg"}
                          alt="Farm"
                          className="w-full h-auto max-h-[300px] object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Documents</CardTitle>
              <CardDescription>Documents related to this loan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loan.loan_application.business_plan_url && (
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-3 h-auto py-4 px-4"
                    onClick={() => viewDocument(loan.loan_application.business_plan_url, "Business Plan")}
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Business Plan</div>
                      <div className="text-xs text-muted-foreground">View document</div>
                    </div>
                  </Button>
                )}

                {loan.loan_application.business_sales_book_url && (
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-3 h-auto py-4 px-4"
                    onClick={() => viewDocument(loan.loan_application.business_sales_book_url, "Sales Records")}
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Sales Records</div>
                      <div className="text-xs text-muted-foreground">View document</div>
                    </div>
                  </Button>
                )}

                {loan.loan_application.collateral_document && (
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-3 h-auto py-4 px-4"
                    onClick={() => viewDocument(loan.loan_application.collateral_document, "Collateral Documentation")}
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Collateral Documentation</div>
                      <div className="text-xs text-muted-foreground">View document</div>
                    </div>
                  </Button>
                )}

                {loan.loan_application.farmer.id_document_url && (
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-3 h-auto py-4 px-4"
                    onClick={() => viewDocument(loan.loan_application.farmer.id_document_url, "ID Document")}
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">ID Document</div>
                      <div className="text-xs text-muted-foreground">View document</div>
                    </div>
                  </Button>
                )}

                {/* If no documents are available */}
                {!loan.loan_application.business_plan_url &&
                  !loan.loan_application.business_sales_book_url &&
                  !loan.loan_application.collateral_document &&
                  !loan.loan_application.farmer.id_document_url && (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-muted-foreground">No documents available for this loan</p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{currentDocument?.name}</DialogTitle>
            <DialogDescription>Viewing document for loan application</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {currentDocument?.url &&
              (currentDocument.url.endsWith(".pdf") ? (
                <iframe src={currentDocument.url} className="w-full h-[60vh]" title={currentDocument.name} />
              ) : (
                <div className="flex justify-center">
                  <img
                    src={currentDocument.url || "/placeholder.svg"}
                    alt={currentDocument.name}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                </div>
              ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => window.open(currentDocument?.url, "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
