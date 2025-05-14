"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarClock, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { LoanRepaymentButton } from "@/components/dashboard/loan-repayment-button"
import { formatDistanceToNow, format, isPast } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Wallet, FileText, CreditCard, ShieldCheck } from "lucide-react"

interface LoanRepaymentClientProps {
  loans: any[]
  userEmail: string
}

export function LoanRepaymentClient({ loans, userEmail }: LoanRepaymentClientProps) {
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleRepayClick = (loan: any) => {
    setSelectedLoan(loan)
    setIsDialogOpen(true)
  }

  if (!loans || loans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">No active loans found</h3>
            <p className="text-muted-foreground mt-2">You don't have any active loans that require repayment.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="history">Repayment History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {loans.map((loan) => (
            <Card key={loan.contract.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{loan.contract.loan_application.purpose_category}</CardTitle>
                    <CardDescription className="mt-1">Lender: {loan.contract.lender.organization_name}</CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      ₦{Number(loan.contract.amount_disbursed).toLocaleString()}
                    </span>
                    <p className="text-xs text-muted-foreground">{loan.contract.interest_rate}% interest</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Repayment Progress</span>
                      <span>{Math.round(loan.progressPercentage)}% Complete</span>
                    </div>
                    <Progress value={loan.progressPercentage} className="h-2" />
                  </div>

                  {loan.nextDueRepayment && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 ${isPast(new Date(loan.nextDueRepayment.due_date)) ? "text-red-500" : "text-amber-500"}`}
                        >
                          {isPast(new Date(loan.nextDueRepayment.due_date)) ? (
                            <AlertTriangle className="h-5 w-5" />
                          ) : (
                            <CalendarClock className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {isPast(new Date(loan.nextDueRepayment.due_date)) ? "Overdue Payment" : "Next Payment Due"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {isPast(new Date(loan.nextDueRepayment.due_date))
                              ? `Due ${formatDistanceToNow(new Date(loan.nextDueRepayment.due_date))} ago`
                              : `Due in ${formatDistanceToNow(new Date(loan.nextDueRepayment.due_date))}`}{" "}
                            ({format(new Date(loan.nextDueRepayment.due_date), "PPP")})
                          </p>

                          {loan.nextDueRepayment.daysOverdue > 0 && (
                            <div className="mt-1 text-xs text-red-600">
                              <span className="font-medium">
                                Penalty: ₦{loan.nextDueRepayment.penalty.toLocaleString()}
                              </span>
                              <span> ({loan.nextDueRepayment.daysOverdue} days overdue)</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            ₦{Number(loan.nextDueRepayment.periodic_repayment_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleRepayClick(loan)}
                  className="w-full"
                  variant={
                    loan.nextDueRepayment && isPast(new Date(loan.nextDueRepayment.due_date))
                      ? "destructive"
                      : "default"
                  }
                >
                  {loan.nextDueRepayment && isPast(new Date(loan.nextDueRepayment.due_date))
                    ? "Pay Overdue Amount"
                    : "Repay Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Repayment History</CardTitle>
              <CardDescription>View all your past and upcoming loan repayments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {loans.map((loan) => (
                  <div key={`history-${loan.contract.id}`} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{loan.contract.loan_application.purpose_category}</h3>
                      <span className="text-sm text-muted-foreground">
                        Lender: {loan.contract.lender.organization_name}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {loan.repayments.map((repayment: any, index: number) => (
                        <div
                          key={repayment.id}
                          className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="mt-1">
                            {repayment.date_paid ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : isPast(new Date(repayment.due_date)) ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Payment {index + 1}
                              {repayment.date_paid ? (
                                <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  Paid
                                </span>
                              ) : isPast(new Date(repayment.due_date)) ? (
                                <span className="ml-2 text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                  Overdue
                                </span>
                              ) : (
                                <span className="ml-2 text-xs font-normal text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                  Upcoming
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due: {format(new Date(repayment.due_date), "PPP")}
                              {repayment.date_paid && (
                                <span className="ml-2">Paid: {format(new Date(repayment.date_paid), "PPP")}</span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">
                              ₦{Number(repayment.periodic_repayment_amount).toLocaleString()}
                            </span>
                            {!repayment.date_paid && isPast(new Date(repayment.due_date)) && (
                              <p className="text-xs text-red-600">+ Penalty</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Repayment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Loan Repayment
            </DialogTitle>
            <DialogDescription>Complete your loan payment securely through our payment gateway</DialogDescription>
          </DialogHeader>

          {selectedLoan && selectedLoan.nextDueRepayment && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Payment Summary
                </h4>
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Loan Purpose:</span>
                      <span className="font-medium">{selectedLoan.contract.loan_application.purpose_category}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Lender:</span>
                      <span className="font-medium">{selectedLoan.contract.lender.organization_name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Principal + Interest:</span>
                      <span className="font-medium">
                        ₦{Number(selectedLoan.nextDueRepayment.periodic_repayment_amount).toLocaleString()}
                      </span>
                    </div>

                    {selectedLoan.nextDueRepayment.penalty > 0 && (
                      <div className="flex justify-between items-center text-sm text-destructive">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Late Payment Penalty:
                        </span>
                        <span className="font-medium">₦{selectedLoan.nextDueRepayment.penalty.toLocaleString()}</span>
                      </div>
                    )}

                    <Separator />
                    <div className="flex justify-between items-center pt-1 font-medium">
                      <span>Total Amount Due:</span>
                      <span className="text-lg text-primary">
                        ₦
                        {(
                          Number(selectedLoan.nextDueRepayment.periodic_repayment_amount) +
                          selectedLoan.nextDueRepayment.penalty
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment Method
                </h4>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Secure Payment via Paystack</p>
                      <p className="text-xs text-muted-foreground">
                        You'll be redirected to our secure payment gateway to complete this transaction
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedLoan.nextDueRepayment.daysOverdue > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        This payment is overdue by {selectedLoan.nextDueRepayment.daysOverdue} days
                      </p>
                      <p className="text-xs mt-1">
                        A late payment penalty of ₦{selectedLoan.nextDueRepayment.penalty.toLocaleString()} has been
                        applied. Timely payments help maintain your credit score.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="sm:flex-1">
              Cancel
            </Button>

            {selectedLoan && selectedLoan.nextDueRepayment && (
              <LoanRepaymentButton
                contractId={selectedLoan.contract.id}
                repaymentId={selectedLoan.nextDueRepayment.id}
                amount={Number(selectedLoan.nextDueRepayment.periodic_repayment_amount)}
                penalty={selectedLoan.nextDueRepayment.penalty || 0}
                email={userEmail}
                onSuccess={() => setIsDialogOpen(false)}
                onError={(error) => console.error("Payment error:", error)}
              />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
