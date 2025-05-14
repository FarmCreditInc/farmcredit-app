"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Loader2,
  CheckCircle,
  FileText,
  Download,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  HelpCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoanApprovalConfirmationDialog } from "./loan-approval-confirmation-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface LoanApplicationDetailsProps {
  loanApplication: any
}

export function LoanApplicationDetails({ loanApplication }: LoanApplicationDetailsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<{ url: string; type: string; name: string } | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [showCreditScoreInfo, setShowCreditScoreInfo] = useState(false)
  const router = useRouter()

  // Fetch wallet balance when component mounts
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        // First, get the current user to get the lender ID
        const userResponse = await fetch("/api/lenders/current")
        const userData = await userResponse.json()

        if (!userResponse.ok) {
          console.error("Error fetching current user:", userData.error)
          toast({
            title: "Error fetching user data",
            description: userData.error || "Failed to fetch user data",
            variant: "destructive",
          })
          return
        }

        const lenderId = userData.data?.id

        if (!lenderId) {
          console.error("Lender ID not found in user data")
          toast({
            title: "Error fetching wallet balance",
            description: "Lender ID not found in user data",
            variant: "destructive",
          })
          return
        }

        // Now fetch the wallet with the lender ID
        const response = await fetch(`/api/lender/wallet?lenderId=${lenderId}`)
        const data = await response.json()

        if (response.ok && data) {
          setWalletBalance(data.balance || 0)
        } else {
          console.error("Error fetching wallet balance:", data.error)
          toast({
            title: "Error fetching wallet balance",
            description: data.error || "Failed to fetch wallet balance",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error)
        toast({
          title: "Error fetching wallet balance",
          description: "An unexpected error occurred while fetching your wallet balance",
          variant: "destructive",
        })
      }
    }

    fetchWalletBalance()
  }, [])

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    funded: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-purple-100 text-purple-800 border-purple-200",
    defaulted: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "PPP")
  }

  // Function to determine credit score rating
  const getCreditScoreRating = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "bg-green-100 text-green-800 border-green-200" }
    if (score >= 650) return { label: "Good", color: "bg-blue-100 text-blue-800 border-blue-200" }
    if (score >= 550) return { label: "Fair", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    if (score >= 450) return { label: "Poor", color: "bg-orange-100 text-orange-800 border-orange-200" }
    return { label: "Very Poor", color: "bg-red-100 text-red-800 border-red-200" }
  }

  const handleApprove = async () => {
    setShowApprovalDialog(true)
  }

  const handleConfirmApproval = async (platformFee: number) => {
    setIsApproving(true)
    try {
      console.log("Starting loan approval process...")

      const response = await fetch("/api/lender/approve-loan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanApplicationId: loanApplication.id,
          platformFee,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Loan approval API error:", result.error)
        throw new Error(result.error || "Failed to approve loan application")
      }

      console.log("Loan approval successful:", result)

      // Close the approval dialog
      setShowApprovalDialog(false)

      // Show success toast
      toast({
        title: "Loan application approved",
        description: "Redirecting to contract processing page...",
        variant: "default",
      })

      // Redirect to the contract processing page
      router.push(`/dashboard/lender/contract-processing/${result.data.contractId}`)
    } catch (error) {
      console.error("Error in loan approval process:", error)

      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "An unknown error occurred during approval",
        variant: "destructive",
      })

      setIsApproving(false)
    }
  }

  const viewDocument = async (documentType: string) => {
    try {
      const response = await fetch(
        `/api/get-document-url?type=loan&id=${loanApplication.id}&documentType=${documentType}`,
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to get document URL")
      }

      setCurrentDocument({
        url: result.url,
        type: documentType,
        name:
          documentType === "business_plan"
            ? "Business Plan"
            : documentType === "financial_statements"
              ? "Financial Statements"
              : "Collateral Documentation",
      })
      setShowDocumentDialog(true)
    } catch (error) {
      console.error("Error getting document URL:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to retrieve document",
        variant: "destructive",
      })
    }
  }

  const goBack = () => {
    router.back()
  }

  const creditScore = loanApplication.farmers?.credit_score || 0
  const creditRating = getCreditScoreRating(creditScore)

  // Get farmer's address information
  const farmerAddress = loanApplication.farmers?.address || {}
  const farmerCity = farmerAddress?.city || "N/A"
  const farmerState = farmerAddress?.state || "N/A"

  // Check if we should show the vendor tab
  const hasVendorData =
    loanApplication.status === "approved" && loanApplication.loan_contract && loanApplication.loan_contract.vendor

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={goBack} className="mb-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16 border">
                <AvatarImage
                  src={loanApplication.farmers?.profile_url || "/placeholder.svg?height=64&width=64&query=farmer"}
                  alt={loanApplication.farmers?.full_name || "Farmer"}
                />
                <AvatarFallback>
                  {loanApplication.farmers?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2) || "F"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Loan Application #{loanApplication.id.substring(0, 8)}</CardTitle>
                <CardDescription>Submitted on {formatDate(loanApplication.created_at)}</CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <Badge
                className={`${statusColors[loanApplication.status]} px-3 py-1 text-xs sm:text-sm capitalize self-start sm:self-auto`}
              >
                {loanApplication.status}
              </Badge>
              <div className="flex items-center gap-2">
                <Badge className={creditRating.color}>
                  Credit Score: {creditScore} - {creditRating.label}
                </Badge>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Credit Score Information</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium leading-none">FarmCredit Credit Score System</h4>
                      <p className="text-sm text-muted-foreground">
                        Our credit scoring system evaluates farmers based on multiple factors to determine their
                        creditworthiness.
                      </p>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Score Ranges:</h5>
                        <div className="grid gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">750-850:</span>
                            <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">650-749:</span>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">550-649:</span>
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Fair</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">450-549:</span>
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Poor</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">300-449:</span>
                            <Badge className="bg-red-100 text-red-800 border-red-200">Very Poor</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Factors Considered:</h5>
                        <ul className="text-sm space-y-1 list-disc pl-4">
                          <li>Farming experience (years)</li>
                          <li>Previous loan repayment history</li>
                          <li>Farm productivity and yield records</li>
                          <li>Farm size and assets</li>
                          <li>Crop diversity and seasonal planning</li>
                          <li>Financial record keeping</li>
                          <li>Market access and contracts</li>
                        </ul>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="loan" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
              <TabsTrigger value="loan">Loan Details</TabsTrigger>
              <TabsTrigger value="farmer">Farmer Details</TabsTrigger>
              <TabsTrigger value="farm">Farm Details</TabsTrigger>
              {hasVendorData && <TabsTrigger value="vendor">Vendor Details</TabsTrigger>}
            </TabsList>

            <TabsContent value="loan" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Loan Amount</h3>
                  <p className="text-lg font-semibold">{formatCurrency(loanApplication.amount_requested)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Loan Term</h3>
                  <p className="text-lg font-semibold">{loanApplication.loan_duration_days} days</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Interest Rate</h3>
                  <p className="text-lg font-semibold">{loanApplication.interest_rate}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Purpose Category</h3>
                  <p className="text-lg font-semibold capitalize">{loanApplication.purpose_category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Estimated Total Repayment</h3>
                  <p className="text-lg font-semibold">{formatCurrency(loanApplication.estimated_total_repayment)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Preferred Repayment Plan</h3>
                  <p className="text-lg font-semibold">{loanApplication.preferred_repayment_plan}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Existing Loans</h3>
                  <p className="text-lg font-semibold">{loanApplication.existing_loans ? "Yes" : "No"}</p>
                </div>
                {loanApplication.existing_loans && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Existing Loan Amount</h3>
                    <p className="text-lg font-semibold">
                      {formatCurrency(loanApplication.total_existing_loan_amount)}
                    </p>
                  </div>
                )}
                {loanApplication.existing_loans && loanApplication.existing_loan_duration_days && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Existing Loan Duration</h3>
                    <p className="text-lg font-semibold">{loanApplication.existing_loan_duration_days} days</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Collateral Document</h3>
                  <p className="text-lg font-semibold">
                    {loanApplication.collateral_document ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold text-lg"
                        onClick={() => window.open(loanApplication.collateral_document, "_blank")}
                      >
                        View Document
                      </Button>
                    ) : (
                      "None"
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Loan Description</h3>
                <p className="text-sm">{loanApplication.description || "No description provided"}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {loanApplication.business_plan_url && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto py-3"
                      onClick={() => window.open(loanApplication.business_plan_url, "_blank")}
                    >
                      <FileText className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Business Plan</div>
                        <div className="text-xs text-muted-foreground">View document</div>
                      </div>
                    </Button>
                  )}

                  {loanApplication.business_sales_book_url && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto py-3"
                      onClick={() => window.open(loanApplication.business_sales_book_url, "_blank")}
                    >
                      <FileText className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Sales Records</div>
                        <div className="text-xs text-muted-foreground">View document</div>
                      </div>
                    </Button>
                  )}

                  {loanApplication.collateral_document && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto py-3"
                      onClick={() => window.open(loanApplication.collateral_document, "_blank")}
                    >
                      <FileText className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Collateral Documentation</div>
                        <div className="text-xs text-muted-foreground">View document</div>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="farmer" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Farmer Name</h3>
                  <p className="text-lg font-semibold">{loanApplication.farmers?.full_name || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-semibold">{loanApplication.farmers?.email || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-semibold">{loanApplication.farmers?.phone || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                      {farmerCity}, {farmerState}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Farming Experience</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                      {loanApplication.farmers?.farming_experience || "N/A"} years
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Credit Score</h3>
                  <div className="flex items-center gap-2">
                    <Badge className={creditRating.color}>
                      {creditScore} - {creditRating.label}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <HelpCircle className="h-4 w-4" />
                            <span className="sr-only">Credit Score Information</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click for more information about our credit scoring system</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="farm" className="space-y-4 mt-4">
              {loanApplication.farms ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Farm Name</h3>
                      <p className="text-lg font-semibold">{loanApplication.farms?.name || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Farm Size</h3>
                      <p className="text-lg font-semibold">{loanApplication.farms?.size || "N/A"} hectares</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-semibold">{loanApplication.farms?.location || "N/A"}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Number of Harvests</h3>
                      <p className="text-lg font-semibold">{loanApplication.farms?.number_of_harvests || "N/A"}</p>
                    </div>
                    {loanApplication.farms?.latitude && loanApplication.farms?.longitude && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Coordinates</h3>
                        <p className="text-lg font-semibold">
                          {loanApplication.farms?.latitude}, {loanApplication.farms?.longitude}
                        </p>
                      </div>
                    )}
                    {loanApplication.farms?.soil_type && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Soil Type</h3>
                        <p className="text-lg font-semibold">{loanApplication.farms?.soil_type}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Fertilizer</h3>
                      <p className="text-lg font-semibold">{loanApplication.farms?.uses_fertilizer ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Machinery</h3>
                      <p className="text-lg font-semibold">{loanApplication.farms?.uses_machinery ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Uses Irrigation</h3>
                      <p className="text-lg font-semibold">{loanApplication.farms?.uses_irrigation ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Secondary Crops</h3>
                    <p className="text-sm">{loanApplication.farms?.secondary_crops || "None"}</p>
                  </div>

                  {loanApplication.farms?.description && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Farm Description</h3>
                        <p className="text-sm">{loanApplication.farms?.description}</p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No farm details available for this application</p>
                </div>
              )}
            </TabsContent>

            {hasVendorData && (
              <TabsContent value="vendor" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Vendor Name</h3>
                    <p className="text-lg font-semibold">{loanApplication.loan_contract.vendor.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Contact Address</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-semibold">{loanApplication.loan_contract.vendor.contact_address}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Vendor Products</h3>
                  {loanApplication.loan_contract.vendor.vendor_products &&
                  loanApplication.loan_contract.vendor.vendor_products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {loanApplication.loan_contract.vendor.vendor_products.map((product: any) => (
                        <Card key={product.id} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">{product.product}</h4>
                                <Badge>{product.product_category}</Badge>
                              </div>
                              <p className="text-sm font-semibold">{formatCurrency(product.amount)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No products available</p>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>

        {loanApplication.status === "pending" && (
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleApprove} disabled={isApproving} className="w-full sm:w-auto">
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Application
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{currentDocument?.name}</DialogTitle>
            <DialogDescription>
              Viewing document for loan application #{loanApplication.id.substring(0, 8)}
            </DialogDescription>
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
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Score Information Dialog */}
      <Dialog open={showCreditScoreInfo} onOpenChange={setShowCreditScoreInfo}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>FarmCredit Credit Score System</DialogTitle>
            <DialogDescription>Understanding how our credit scoring works</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Our credit scoring system evaluates farmers based on multiple factors to determine their creditworthiness.
              Scores range from 300 to 850, with higher scores indicating lower risk.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Score Ranges:</h4>
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <span>750-850:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>650-749:</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>550-649:</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Fair</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>450-549:</span>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">Poor</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>300-449:</span>
                  <Badge className="bg-red-100 text-red-800 border-red-200">Very Poor</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Factors Considered:</h4>
              <ul className="space-y-1 list-disc pl-4">
                <li>Farming experience (years)</li>
                <li>Previous loan repayment history</li>
                <li>Farm productivity and yield records</li>
                <li>Farm size and assets</li>
                <li>Crop diversity and seasonal planning</li>
                <li>Financial record keeping</li>
                <li>Market access and contracts</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loan Approval Confirmation Dialog */}
      <LoanApprovalConfirmationDialog
        isOpen={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        onConfirm={handleConfirmApproval}
        loanApplication={loanApplication}
        walletBalance={walletBalance}
      />
    </div>
  )
}
