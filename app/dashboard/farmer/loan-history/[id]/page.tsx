import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock, AlertCircle, FileText, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { getFarmerLoans } from "@/actions/farmer-actions"
import { getLoanContracts, getLoanRepayments } from "@/actions/loan-actions"
import { formatCurrency } from "@/lib/utils"

export default async function LoanDetailsPage({ params }: { params: { id: string } }) {
  const loansResponse = await getFarmerLoans()
  const contractsResponse = await getLoanContracts()

  // Ensure loans is an array
  const loans = Array.isArray(loansResponse.data) ? loansResponse.data : []
  const contracts = Array.isArray(contractsResponse.data) ? contractsResponse.data : []

  const loan = loans.find((l) => l.id === params.id)

  if (!loan) {
    notFound()
  }

  const contract = contracts.find((c) => c.loan_application_id === loan.id)

  // Get repayments if there's a contract
  let repayments = []
  if (contract) {
    const repaymentsResponse = await getLoanRepayments(contract.id)
    repayments = Array.isArray(repaymentsResponse.data) ? repaymentsResponse.data : []
  }

  const totalRepayments = repayments.length
  const paidRepayments = repayments.filter((r) => r.date_paid).length
  const progressPercentage = totalRepayments > 0 ? (paidRepayments / totalRepayments) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/farmer/loan-history">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Details</h1>
          <p className="text-muted-foreground">View details and repayment schedule for this loan</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Information</CardTitle>
            <CardDescription>Details about your loan application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{loan.purpose_category || "Loan Application"}</h3>
                <p className="text-sm text-muted-foreground">
                  Applied on {new Date(loan.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge
                className={
                  loan.status === "approved"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : loan.status === "rejected"
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-yellow-50 text-yellow-600 border-yellow-200"
                }
              >
                {loan.status}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Amount Requested</p>
                <p className="text-lg">{formatCurrency(loan.amount_requested || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Loan Duration</p>
                <p className="text-lg">{loan.loan_duration_days || 0} days</p>
              </div>
              <div>
                <p className="text-sm font-medium">Repayment Plan</p>
                <p className="text-lg">{loan.preferred_repayment_plan || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Interest Rate</p>
                <p className="text-lg">{loan.interest_rate || 0}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Repayment</p>
                <p className="text-lg">{formatCurrency(loan.estimated_total_repayment || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Application ID</p>
                <p className="text-lg text-muted-foreground">{loan.id.substring(0, 8)}</p>
              </div>
            </div>

            {loan.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm mt-1">{loan.description}</p>
                </div>
              </>
            )}

            {loan.rejection_reason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Rejection Reason</p>
                  <p className="text-sm mt-1">{loan.rejection_reason}</p>
                </div>
              </>
            )}

            {loan.collateral_document && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Collateral Document</p>
                  <a
                    href={loan.collateral_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm mt-1 text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              </>
            )}

            {loan.business_plan_url && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Business Plan</p>
                  <a
                    href={loan.business_plan_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm mt-1 text-blue-600 hover:underline"
                  >
                    View Business Plan
                  </a>
                </div>
              </>
            )}

            {loan.business_sales_book_url && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Sales Record</p>
                  <a
                    href={loan.business_sales_book_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm mt-1 text-blue-600 hover:underline"
                  >
                    View Sales Record
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {contract ? (
          <Card>
            <CardHeader>
              <CardTitle>Disbursement Details</CardTitle>
              <CardDescription>Information about your loan contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-green-100">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Contract {contract.contract_type || "Standard"}</p>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(contract.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Amount Disbursed</p>
                  <p className="text-lg">{formatCurrency(contract.amount_disbursed || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Interest Rate</p>
                  <p className="text-lg">{contract.interest_rate || 0}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-lg">{contract.status || "Active"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contract ID</p>
                  <p className="text-lg text-muted-foreground">{contract.id.substring(0, 8)}</p>
                </div>
              </div>

              {contract.vendor_id && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Store className="h-4 w-4 text-green-600" />
                      <p className="font-medium">Vendor Details</p>
                    </div>
                    <div className="pl-6">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Vendor:</span>{" "}
                        {contract.vendors?.name || "Not specified"}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {contract.vendors?.contact_address || "Not specified"}
                      </p>
                      {contract.vendors?.vendor_products && contract.vendors.vendor_products.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Products:</p>
                          <ul className="list-disc pl-5 text-sm">
                            {contract.vendors.vendor_products.map((product: any, index: number) => (
                              <li key={index}>
                                {product.product} - {product.product_category} ({formatCurrency(product.amount)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : loan.status === "approved" ? (
          <Card>
            <CardHeader>
              <CardTitle>Pending Disbursement</CardTitle>
              <CardDescription>Your loan has been approved and is awaiting disbursement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-yellow-100">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Awaiting Disbursement</p>
                  <p className="text-sm text-muted-foreground">
                    Your loan has been approved but funds have not yet been disbursed
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-center py-4">
                <Button asChild variant="outline">
                  <Link href="/dashboard/farmer/messages">Contact Lender</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Current status of your loan application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${loan.status === "rejected" ? "bg-red-100" : "bg-yellow-100"}`}>
                  {loan.status === "rejected" ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {loan.status === "rejected" ? "Application Rejected" : "Application Pending"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {loan.status === "rejected"
                      ? "Your loan application has been rejected"
                      : "Your application is being reviewed"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-center py-4">
                <Button asChild variant="outline">
                  <Link href="/dashboard/farmer/loans/apply">Apply for Another Loan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {contract && repayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Repayment Schedule</CardTitle>
            <CardDescription>Track your loan repayment progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Repayment Progress: {paidRepayments} of {totalRepayments} installments
                </span>
                <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Timeline visualization */}
            <div className="mt-6 pt-4">
              <h4 className="text-sm font-medium mb-3">Payment Timeline</h4>
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                <div className="relative flex justify-between">
                  {repayments.map((repayment, index) => {
                    const isPaid = !!repayment.date_paid
                    const isOverdue = !isPaid && new Date(repayment.due_date) < new Date()

                    return (
                      <div key={repayment.id} className="flex flex-col items-center">
                        <div
                          className={`z-10 flex items-center justify-center w-6 h-6 rounded-full ${
                            isPaid ? "bg-green-500" : isOverdue ? "bg-red-500" : "bg-yellow-500"
                          }`}
                        >
                          <span className="text-white text-xs">{index + 1}</span>
                        </div>
                        <div className="mt-1 text-xs">
                          {new Date(repayment.due_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-medium">Payment Details</h4>
              {repayments.map((repayment, index) => {
                const isPaid = !!repayment.date_paid
                const isOverdue = !isPaid && new Date(repayment.due_date) < new Date()
                const isUpcoming = !isPaid && !isOverdue

                return (
                  <div
                    key={repayment.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      isPaid ? "bg-green-50" : isOverdue ? "bg-red-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {isPaid ? (
                        <div className="rounded-full bg-green-100 p-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      ) : isOverdue ? (
                        <div className="rounded-full bg-red-100 p-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-yellow-100 p-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">Payment {index + 1}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Principal:</span>
                            {formatCurrency(
                              repayment.periodic_repayment_amount - (repayment.interest_amount || 0) || 0,
                            )}
                          </p>
                          {repayment.interest_amount > 0 && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Interest:</span>
                              {formatCurrency(repayment.interest_amount || 0)}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(repayment.due_date).toLocaleDateString()}
                        </p>
                        {repayment.date_paid && (
                          <p className="text-xs text-green-600">
                            Paid on: {new Date(repayment.date_paid).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isPaid && <Button size="sm">Make Payment</Button>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
