"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  Percent,
  Shield,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  BarChart3,
  Landmark,
  FileText,
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function LoanDetailsClient({ loanData }: { loanData: any }) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isExpired, setIsExpired] = useState(false)

  const { loan, repayments } = loanData

  // Calculate total paid amount
  const totalPaid = repayments.filter((r: any) => r.date_paid).reduce((sum: number, r: any) => sum + (r.amount || 0), 0)

  // Calculate total expected amount
  const totalExpected = loan.amount_disbursed * (1 + loan.interest_rate)

  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.round((totalPaid / totalExpected) * 100))

  // Calculate deadline based on loan creation date + loan_duration_days
  const calculateDeadline = () => {
    const createdAt = new Date(loan.created_at)
    const durationDays = loan.loan_application.loan_duration_days
    const deadline = new Date(createdAt)
    deadline.setDate(deadline.getDate() + durationDays)
    return deadline
  }

  const deadline = calculateDeadline()

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const timeDiff = deadline.getTime() - now.getTime()

      if (timeDiff <= 0) {
        setTimeLeft("Expired")
        setIsExpired(true)
        return
      }

      // Calculate days, hours, minutes
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      setIsExpired(false)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [deadline])

  // Calculate penalty if past deadline
  const calculatePenalty = () => {
    if (!isExpired) return 0

    const now = new Date()
    const daysLate = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))
    const penaltyRate = 0.001 // 0.1% per day
    const remainingAmount = totalExpected - totalPaid
    return remainingAmount * penaltyRate * daysLate
  }

  const penalty = calculatePenalty()
  const remainingAmount = totalExpected - totalPaid

  // Calculate repayment statistics
  const paidOnTime = repayments.filter((r: any) => r.date_paid && new Date(r.date_paid) <= new Date(r.due_date)).length

  const paidLate = repayments.filter((r: any) => r.date_paid && new Date(r.date_paid) > new Date(r.due_date)).length

  const totalPaidRepayments = paidOnTime + paidLate
  const onTimePercentage = totalPaidRepayments > 0 ? Math.round((paidOnTime / totalPaidRepayments) * 100) : 0

  // Find next payment
  const nextPayment = repayments
    .filter((r: any) => !r.date_paid)
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Loans
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Loan Summary</CardTitle>
            <CardDescription>Details about the loan and repayment progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(loan.amount_disbursed || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-2xl font-bold flex items-center">
                  {(loan.interest_rate * 100).toFixed(1)}
                  <Percent className="h-5 w-5 ml-1" />
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Borrower</p>
                <p className="font-medium">{loan.loan_application.farmer.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loan Date</p>
                <p className="font-medium">{formatDate(loan.created_at)}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Repayment Progress</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {formatCurrency(totalPaid)} of {formatCurrency(totalExpected)}
                </span>
                <span className="text-sm font-medium">{progressPercentage}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Payment Deadline</h3>

              <div className="rounded-md border overflow-hidden">
                <div className="bg-muted p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">Payment Due By</span>
                    </div>
                    <Badge variant={isExpired ? "destructive" : "outline"}>{isExpired ? "Overdue" : "Active"}</Badge>
                  </div>

                  <div className="mt-2 text-2xl font-bold">{formatDate(deadline)}</div>

                  <div className="mt-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className={`${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
                      {isExpired ? "Overdue - Late penalties apply" : `Time remaining: ${timeLeft}`}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-card">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Remaining Balance</span>
                      <span className="font-semibold">{formatCurrency(remainingAmount)}</span>
                    </div>

                    {isExpired && (
                      <div className="flex justify-between items-center text-destructive">
                        <span className="text-sm flex items-center">
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Late Payment Penalty
                        </span>
                        <span className="font-medium">{formatCurrency(penalty)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center font-bold">
                      <span>Total Due</span>
                      <span>{formatCurrency(remainingAmount + penalty)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              <span>Loan ID: {loan.id.substring(0, 8)}</span>
            </div>
            <div className="flex items-center text-sm text-primary">
              <Shield className="h-4 w-4 mr-1" />
              <span>Secured Loan</span>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {repayments.filter((r: any) => r.date_paid).length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {repayments
                    .filter((r: any) => r.date_paid)
                    .sort((a: any, b: any) => new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime())
                    .map((repayment: any) => (
                      <div key={repayment.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-medium">{formatDate(repayment.date_paid)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Payment ID: {repayment.id.substring(0, 8)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(repayment.amount || 0)}</div>
                          {new Date(repayment.date_paid) > new Date(repayment.due_date) && (
                            <div className="text-xs text-destructive">Late payment</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">No payments received yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment history will appear here once the borrower makes payments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Borrower Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={loan.loan_application.farmer.profile_url || "/placeholder.svg"}
                    alt={loan.loan_application.farmer.full_name}
                  />
                  <AvatarFallback>
                    {loan.loan_application.farmer.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{loan.loan_application.farmer.full_name}</p>
                  <p className="text-sm text-muted-foreground">Farmer</p>
                </div>
              </div>

              {loan.loan_application.farmer.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{loan.loan_application.farmer.email}</span>
                </div>
              )}

              {loan.loan_application.farmer.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{loan.loan_application.farmer.phone}</span>
                </div>
              )}

              {loan.loan_application.farmer.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{loan.loan_application.farmer.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {nextPayment && (
            <Alert variant="default" className="bg-primary/10 border-primary/20 text-foreground">
              <Calendar className="h-4 w-4" />
              <AlertTitle>Next Payment Due</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <div className="font-medium">{formatDate(nextPayment.due_date)}</div>
                  <div className="font-bold mt-1">{formatCurrency(nextPayment.amount)}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <Tabs defaultValue="repayments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="repayments">Repayment Schedule</TabsTrigger>
          <TabsTrigger value="details">Loan Details</TabsTrigger>
          <TabsTrigger value="farm">Farm Information</TabsTrigger>
          <TabsTrigger value="analytics">Repayment Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="repayments" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Repayment Schedule</CardTitle>
              <CardDescription>Complete schedule of all repayments for this loan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Due Date</th>
                      <th className="py-3 px-4 text-left">Amount</th>
                      <th className="py-3 px-4 text-left">Principal</th>
                      <th className="py-3 px-4 text-left">Interest</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repayments.map((repayment: any) => (
                      <tr key={repayment.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{formatDate(repayment.due_date)}</td>
                        <td className="py-3 px-4">{formatCurrency(repayment.amount)}</td>
                        <td className="py-3 px-4">{formatCurrency(repayment.principal_component || 0)}</td>
                        <td className="py-3 px-4">{formatCurrency(repayment.interest_component || 0)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              repayment.date_paid
                                ? new Date(repayment.date_paid) <= new Date(repayment.due_date)
                                  ? "success"
                                  : "warning"
                                : new Date(repayment.due_date) < new Date()
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {repayment.date_paid
                              ? new Date(repayment.date_paid) <= new Date(repayment.due_date)
                                ? "Paid On Time"
                                : "Paid Late"
                              : new Date(repayment.due_date) < new Date()
                                ? "Overdue"
                                : "Pending"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{repayment.date_paid ? formatDate(repayment.date_paid) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Detailed information about this loan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Purpose</h3>
                    <p className="text-lg font-semibold capitalize">
                      {loan.loan_application.purpose_category ||
                        loan.loan_application.purpose ||
                        "Agricultural Financing"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Loan Status</h3>
                    <Badge className="mt-1">{loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Loan Term</h3>
                    <p className="text-lg font-semibold">{loan.loan_application.loan_duration_days || 12} days</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Disbursement Date</h3>
                    <p className="text-lg font-semibold">{formatDate(loan.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Amount Disbursed</h3>
                    <p className="text-lg font-semibold">{formatCurrency(loan.amount_disbursed)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Expected Repayment</h3>
                    <p className="text-lg font-semibold">{formatCurrency(totalExpected)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Received</h3>
                    <p className="text-lg font-semibold">{formatCurrency(totalPaid)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Remaining Balance</h3>
                    <p className="text-lg font-semibold">{formatCurrency(remainingAmount)}</p>
                  </div>
                </div>
              </div>
              {loan.loan_application.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Loan Description</h3>
                  <p className="text-sm">{loan.loan_application.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farm" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Farm Information</CardTitle>
              <CardDescription>Details about the borrower's farm</CardDescription>
            </CardHeader>
            <CardContent>
              {loan.loan_application.farm ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Farm Name</h3>
                      <p className="text-lg font-semibold">{loan.loan_application.farm.name || "N/A"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Farm Size</h3>
                      <p className="text-lg font-semibold">{loan.loan_application.farm.size || "N/A"} hectares</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                      <p className="text-lg font-semibold">{loan.loan_application.farm.location || "N/A"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Primary Crop</h3>
                      <p className="text-lg font-semibold">{loan.loan_application.farm.primary_crop || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Number of Harvests</h3>
                      <p className="text-lg font-semibold">{loan.loan_application.farm.number_of_harvests || "N/A"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Irrigation</h3>
                      <p className="text-lg font-semibold">
                        {loan.loan_application.farm.uses_irrigation ? "Yes" : "No"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Fertilizer</h3>
                      <p className="text-lg font-semibold">
                        {loan.loan_application.farm.uses_fertilizer ? "Yes" : "No"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Machinery</h3>
                      <p className="text-lg font-semibold">
                        {loan.loan_application.farm.uses_machinery ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">No farm information available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The borrower has not provided detailed farm information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Repayment Performance</CardTitle>
                <CardDescription>Analysis of borrower's payment behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">On-Time Payment Rate</span>
                      <span className="text-sm font-medium">{onTimePercentage}%</span>
                    </div>
                    <Progress value={onTimePercentage} className="h-2" />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Paid on time: {paidOnTime}</span>
                      <span>Paid late: {paidLate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Total Paid</span>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center mb-2">
                        <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Completion</span>
                      </div>
                      <p className="text-xl font-bold">{progressPercentage}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
                <CardDescription>Breakdown of loan financials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center">
                      <Landmark className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Principal</p>
                        <p className="text-xs text-muted-foreground">Original loan amount</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(loan.amount_disbursed)}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center">
                      <Percent className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Interest</p>
                        <p className="text-xs text-muted-foreground">Total interest amount</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(totalExpected - loan.amount_disbursed)}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Total Repayment</p>
                        <p className="text-xs text-muted-foreground">Principal + Interest</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(totalExpected)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
