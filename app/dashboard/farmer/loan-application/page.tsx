"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, ArrowRight, Check, FileText, Calculator, AlertCircle, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { submitLoanApplication, getExistingLoanInfo } from "@/actions/loan-actions"
import { getFarms } from "@/actions/farm-actions"
import { formatCurrency } from "@/lib/utils"

export const dynamic = "force-dynamic"

// Constants for interest calculation
const BASE_RATE = 5 // 5% base rate
const RATE_INCREMENT = 2 // 2% increment per 30 days
const MIN_DAYS = 7 // Minimum loan duration in days
const MAX_DAYS = 365 // Maximum loan duration in days

// Step 1: Loan Details Schema
const loanDetailsSchema = z.object({
  purpose_category: z.string().min(1, "Please select a purpose category"),
  amount_requested: z.coerce
    .number()
    .min(1000, "Minimum loan amount is ₦1,000")
    .max(10000000, "Maximum loan amount is ₦10,000,000"),
  loan_duration_days: z.coerce
    .number()
    .min(MIN_DAYS, `Minimum duration is ${MIN_DAYS} days`)
    .max(MAX_DAYS, `Maximum duration is ${MAX_DAYS} days`),
  preferred_repayment_plan: z.string().min(1, "Please select a repayment plan"),
  loan_description: z.string().min(25, "Description must be at least 25 characters"),
})

// Add a type for Farm
type Farm = {
  id: string
  name: string
  size: number
  size_units: string
  location: string
  created_at: string
}

// Step 2: Farm Details Schema
const farmDetailsSchema = z.object({
  farm_id: z.string().min(1, "Please select a farm"),
})

// Step 3: Documents Schema
const documentsSchema = z.object({
  business_plan: z.instanceof(File).optional(),
  collateral_document: z.instanceof(File).optional(),
  sales_record: z.instanceof(File).optional(),
  farm_photos: z.instanceof(File).optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

// Combined schema type
type LoanApplicationFormValues = z.infer<typeof loanDetailsSchema> &
  z.infer<typeof farmDetailsSchema> &
  z.infer<typeof documentsSchema>

// Type for existing loan info
type ExistingLoanInfo = {
  existing_loans: boolean
  total_existing_loan_amount: number
  existing_loan_duration_days: number
}

export default function LoanApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [existingLoanInfo, setExistingLoanInfo] = useState<ExistingLoanInfo | null>(null)
  const [isLoadingLoanInfo, setIsLoadingLoanInfo] = useState(true)
  const [farms, setFarms] = useState<Farm[]>([])
  const [isLoadingFarms, setIsLoadingFarms] = useState(true)
  const [interestRate, setInterestRate] = useState(BASE_RATE)
  const [totalRepayment, setTotalRepayment] = useState(0)

  // Fetch existing loan information
  useEffect(() => {
    async function fetchExistingLoanInfo() {
      try {
        setIsLoadingLoanInfo(true)
        const result = await getExistingLoanInfo()
        if (result.success) {
          setExistingLoanInfo(result.data)
        } else {
          console.error("Error fetching existing loan info:", result.error)
          toast({
            title: "Error",
            description: "Could not fetch your existing loan information. Some fields may not be accurate.",
            variant: "destructive",
          })
          // Set default values
          setExistingLoanInfo({
            existing_loans: false,
            total_existing_loan_amount: 0,
            existing_loan_duration_days: 0,
          })
        }
      } catch (error) {
        console.error("Error in fetchExistingLoanInfo:", error)
        // Set default values
        setExistingLoanInfo({
          existing_loans: false,
          total_existing_loan_amount: 0,
          existing_loan_duration_days: 0,
        })
      } finally {
        setIsLoadingLoanInfo(false)
      }
    }

    fetchExistingLoanInfo()
  }, [toast])

  // Add a function to fetch farms after the useEffect for fetching loan info
  useEffect(() => {
    async function fetchFarms() {
      if (step === 2) {
        try {
          setIsLoadingFarms(true)
          // Assuming the user ID is available in the session
          const result = await getFarms("current", 1, 100) // Get all farms for pagination
          if (result.success) {
            setFarms(result.data || [])
          } else {
            console.error("Error fetching farms:", result.error)
            toast({
              title: "Error",
              description: "Could not fetch your farms. Please try again.",
              variant: "destructive",
            })
            setFarms([])
          }
        } catch (error) {
          console.error("Error in fetchFarms:", error)
          setFarms([])
        } finally {
          setIsLoadingFarms(false)
        }
      }
    }

    fetchFarms()
  }, [step, toast])

  // Form for Step 1: Loan Details
  const loanDetailsForm = useForm<z.infer<typeof loanDetailsSchema>>({
    resolver: zodResolver(loanDetailsSchema),
    defaultValues: {
      purpose_category: "",
      amount_requested: 50000,
      loan_duration_days: 30,
      preferred_repayment_plan: "",
      loan_description: "",
    },
  })

  // Watch for changes in amount and duration to calculate interest
  const amount = loanDetailsForm.watch("amount_requested")
  const durationDays = loanDetailsForm.watch("loan_duration_days")

  // Calculate interest rate and total repayment whenever amount or duration changes
  useEffect(() => {
    try {
      // Ensure amount and durationDays are numbers
      const numericAmount = Number(amount) || 0
      const numericDays = Number(durationDays) || 0

      // Calculate interest rate based on duration
      const calculatedInterestRate = BASE_RATE + (numericDays / 30) * RATE_INCREMENT
      const roundedInterestRate = Math.round(calculatedInterestRate * 100) / 100
      setInterestRate(roundedInterestRate)

      // Calculate total repayment
      const interestAmount = numericAmount * (roundedInterestRate / 100)
      const calculatedTotalRepayment = numericAmount + interestAmount

      // Ensure we're setting a valid number
      setTotalRepayment(isNaN(calculatedTotalRepayment) ? 0 : calculatedTotalRepayment)

      console.log("Calculation:", {
        amount: numericAmount,
        days: numericDays,
        interestRate: roundedInterestRate,
        interestAmount,
        totalRepayment: calculatedTotalRepayment,
      })
    } catch (error) {
      console.error("Error calculating loan details:", error)
      setInterestRate(BASE_RATE)
      setTotalRepayment(0)
    }
  }, [amount, durationDays])

  // Form for Step 2: Farm Details
  const farmDetailsForm = useForm<z.infer<typeof farmDetailsSchema>>({
    resolver: zodResolver(farmDetailsSchema),
    defaultValues: {
      farm_id: "",
    },
  })

  // Form for Step 3: Documents
  const documentsForm = useForm<z.infer<typeof documentsSchema>>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      terms_accepted: false,
    },
  })

  // Handle step 1 submission
  const onSubmitLoanDetails = (data: z.infer<typeof loanDetailsSchema>) => {
    console.log("Loan Details:", data)
    setStep(2)
  }

  // Handle step 2 submission
  const onSubmitFarmDetails = (data: z.infer<typeof farmDetailsSchema>) => {
    console.log("Farm Details:", data)
    setStep(3)
  }

  // Handle step 3 submission (final submission)
  const onSubmitDocuments = async (data: z.infer<typeof documentsSchema>) => {
    setIsSubmitting(true)

    try {
      // Combine all form data
      const loanDetails = loanDetailsForm.getValues()
      const farmDetails = farmDetailsForm.getValues()

      // Create FormData object for file uploads
      const formData = new FormData()

      // Add loan details
      Object.entries(loanDetails).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })

      // Add farm ID
      formData.append("farm_id", farmDetails.farm_id)

      // Add calculated interest rate and total repayment
      formData.append("interest_rate", interestRate.toString())
      formData.append("estimated_total_repayment", totalRepayment.toString())

      // Add files
      if (data.business_plan) {
        formData.append("business_plan", data.business_plan)
      }

      if (data.collateral_document) {
        formData.append("collateral_document", data.collateral_document)
      }

      if (data.sales_record) {
        formData.append("sales_record", data.sales_record)
      }

      if (data.farm_photos) {
        formData.append("farm_photos", data.farm_photos)
      }

      formData.append("terms_accepted", data.terms_accepted.toString())

      // Show a toast notification that we're calculating credit score
      toast({
        title: "Calculating Credit Score",
        description: "Please wait while we calculate your credit score...",
      })

      // Submit the application
      const result = await submitLoanApplication(formData)

      if (result.success) {
        // Show credit score toast if available
        if (result.creditScore) {
          toast({
            title: "Credit Score Updated",
            description: `Your credit score has been calculated: ${result.creditScore}`,
          })
        }

        toast({
          title: "Application Submitted",
          description: "Your loan application has been submitted successfully.",
        })
        router.push("/dashboard/farmer/loan-history")
      } else {
        throw new Error(result.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle file upload progress
  const updateUploadProgress = (fieldName: string, progress: number) => {
    setUploadProgress((prev) => ({
      ...prev,
      [fieldName]: progress,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/farmer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Application</h1>
          <p className="text-muted-foreground">Complete the form below to apply for a loan</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {step} of 3</span>
          <span>{step === 1 ? "Loan Details" : step === 2 ? "Farm Selection" : "Documents & Submission"}</span>
        </div>
        <Progress value={(step / 3) * 100} className="h-2" />
      </div>

      {/* Existing Loan Information Card */}
      {existingLoanInfo && existingLoanInfo.existing_loans && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Existing Loans Detected</AlertTitle>
          <AlertDescription>
            <p>You currently have active unpaid loans:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Total outstanding amount: {formatCurrency(existingLoanInfo.total_existing_loan_amount)}</li>
              <li>Loan duration: {existingLoanInfo.existing_loan_duration_days} days</li>
            </ul>
            <p className="mt-2">This information will be considered during the review of your application.</p>
          </AlertDescription>
        </Alert>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
            <CardDescription>Provide details about your loan request</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loanDetailsForm}>
              <form onSubmit={loanDetailsForm.handleSubmit(onSubmitLoanDetails)} className="space-y-6">
                <FormField
                  control={loanDetailsForm.control}
                  name="purpose_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Purpose</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a purpose for your loan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Seeds">Seeds</SelectItem>
                          <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                          <SelectItem value="Pesticides">Pesticides</SelectItem>
                          <SelectItem value="Farming Equipment">Farming Equipment</SelectItem>
                          <SelectItem value="Irrigation Systems">Irrigation Systems</SelectItem>
                          <SelectItem value="Animal Feed">Animal Feed</SelectItem>
                          <SelectItem value="Veterinary Supplies">Veterinary Supplies</SelectItem>
                          <SelectItem value="Agrochemicals">Agrochemicals</SelectItem>
                          <SelectItem value="Harvesting Tools">Harvesting Tools</SelectItem>
                          <SelectItem value="Storage Solutions">Storage Solutions</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loanDetailsForm.control}
                  name="amount_requested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Enter the amount you wish to borrow (₦1,000 - ₦10,000,000)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loanDetailsForm.control}
                  name="loan_duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Duration (days)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input type="number" {...field} />
                          <Slider
                            min={MIN_DAYS}
                            max={MAX_DAYS}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{MIN_DAYS} days</span>
                            <span>{MAX_DAYS} days</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interest Rate and Total Repayment Display */}
                <div className="space-y-4 border rounded-md p-4 bg-green-50 dark:bg-green-950/30">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-400">Loan Calculation</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium">Interest Rate</div>
                      <div className="mt-1 p-2 border rounded-md bg-background">
                        <span className="text-sm font-semibold">{interestRate.toFixed(2)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Base rate: {BASE_RATE}% + {RATE_INCREMENT}% per 30 days
                      </p>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Total Repayment</div>
                      <div className="mt-1 p-2 border rounded-md bg-background">
                        <span className="text-sm font-semibold">{formatCurrency(totalRepayment)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Principal + Interest</p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={loanDetailsForm.control}
                  name="preferred_repayment_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Repayment Plan</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="monthly" />
                            </FormControl>
                            <FormLabel className="font-normal">Monthly Payments</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="quarterly" />
                            </FormControl>
                            <FormLabel className="font-normal">Quarterly Payments</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="harvest_based" />
                            </FormControl>
                            <FormLabel className="font-normal">Harvest-Based Payments</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loanDetailsForm.control}
                  name="loan_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about how you plan to use the loan and how it will benefit your farming business"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Minimum 25 characters required</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Read-only fields for existing loan information */}
                <div className="space-y-4 border rounded-md p-4 bg-muted/30">
                  <h3 className="text-sm font-medium">Existing Loan Information</h3>
                  <p className="text-sm text-muted-foreground">
                    This information is automatically calculated from your active loan contracts and will be included in
                    your application.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium">Active Loans</div>
                      <div className="mt-1 p-2 border rounded-md bg-background">
                        {isLoadingLoanInfo ? (
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        ) : (
                          <span className="text-sm font-medium">{existingLoanInfo?.existing_loans ? "Yes" : "No"}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Total Outstanding Amount</div>
                      <div className="mt-1 p-2 border rounded-md bg-background">
                        {isLoadingLoanInfo ? (
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        ) : (
                          <span className="text-sm font-medium">
                            {formatCurrency(existingLoanInfo?.total_existing_loan_amount || 0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-sm font-medium">Average Loan Duration</div>
                      <div className="mt-1 p-2 border rounded-md bg-background">
                        {isLoadingLoanInfo ? (
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        ) : (
                          <span className="text-sm font-medium">
                            {existingLoanInfo?.existing_loan_duration_days || 0} days
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Farm Selection</CardTitle>
            <CardDescription>Select the farm for this loan application</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFarms ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : farms.length === 0 ? (
              <div className="space-y-4">
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Farms Found</AlertTitle>
                  <AlertDescription>
                    <p>You need to add at least one farm before you can apply for a loan.</p>
                    <p className="mt-2">
                      Please add a farm record first, then return to complete your loan application.
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button asChild>
                    <Link href="/dashboard/farmer/farms">Add a Farm</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...farmDetailsForm}>
                <form onSubmit={farmDetailsForm.handleSubmit(onSubmitFarmDetails)} className="space-y-6">
                  <FormField
                    control={farmDetailsForm.control}
                    name="farm_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Farm</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a farm for this loan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {farms.map((farm) => (
                              <SelectItem key={farm.id} value={farm.id}>
                                {farm.name} ({farm.size} {farm.size_units})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>This loan will be associated with the selected farm</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous Step
                    </Button>
                    <Button type="submit" disabled={farms.length === 0}>
                      Next Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents & Submission</CardTitle>
            <CardDescription>Upload required documents and submit your application</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...documentsForm}>
              <form onSubmit={documentsForm.handleSubmit(onSubmitDocuments)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Required Documents</h3>

                  <FormField
                    control={documentsForm.control}
                    name="business_plan"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <div className="space-y-1 w-full">
                          <FormLabel>Business Plan</FormLabel>
                          <FormDescription>Upload a document outlining your farming business plan</FormDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <FormControl>
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    onChange(file)
                                    updateUploadProgress("business_plan", 0)
                                  }
                                }}
                                {...fieldProps}
                              />
                            </FormControl>
                          </div>
                          {uploadProgress.business_plan !== undefined &&
                            uploadProgress.business_plan < 100 &&
                            uploadProgress.business_plan > 0 && (
                              <Progress value={uploadProgress.business_plan} className="h-1 mt-2" />
                            )}
                          {value && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Selected: {value instanceof File ? value.name : "File selected"}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={documentsForm.control}
                    name="collateral_document"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <div className="space-y-1 w-full">
                          <FormLabel>Collateral Documentation</FormLabel>
                          <FormDescription>
                            Upload documents related to your collateral (land title, equipment, etc.)
                          </FormDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <FormControl>
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    onChange(file)
                                    updateUploadProgress("collateral_document", 0)
                                  }
                                }}
                                {...fieldProps}
                              />
                            </FormControl>
                          </div>
                          {uploadProgress.collateral_document !== undefined &&
                            uploadProgress.collateral_document < 100 &&
                            uploadProgress.collateral_document > 0 && (
                              <Progress value={uploadProgress.collateral_document} className="h-1 mt-2" />
                            )}
                          {value && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Selected: {value instanceof File ? value.name : "File selected"}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Optional Documents</h3>

                  <FormField
                    control={documentsForm.control}
                    name="sales_record"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <div className="space-y-1 w-full">
                          <FormLabel>Sales Records</FormLabel>
                          <FormDescription>Upload your farm's sales records (if available)</FormDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <FormControl>
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    onChange(file)
                                    updateUploadProgress("sales_record", 0)
                                  }
                                }}
                                {...fieldProps}
                              />
                            </FormControl>
                          </div>
                          {uploadProgress.sales_record !== undefined &&
                            uploadProgress.sales_record < 100 &&
                            uploadProgress.sales_record > 0 && (
                              <Progress value={uploadProgress.sales_record} className="h-1 mt-2" />
                            )}
                          {value && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Selected: {value instanceof File ? value.name : "File selected"}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={documentsForm.control}
                    name="farm_photos"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <div className="space-y-1 w-full">
                          <FormLabel>Farm Photos</FormLabel>
                          <FormDescription>Upload photos of your farm</FormDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <FormControl>
                              <Input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    onChange(file)
                                    updateUploadProgress("farm_photos", 0)
                                  }
                                }}
                                {...fieldProps}
                              />
                            </FormControl>
                          </div>
                          {uploadProgress.farm_photos !== undefined &&
                            uploadProgress.farm_photos < 100 &&
                            uploadProgress.farm_photos > 0 && (
                              <Progress value={uploadProgress.farm_photos} className="h-1 mt-2" />
                            )}
                          {value && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Selected: {value instanceof File ? value.name : "File selected"}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={documentsForm.control}
                  name="terms_accepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormDescription>
                          I agree to the terms and conditions of FarmCredit's loan program. I confirm that all
                          information provided is accurate and complete.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous Step
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        Submit Application
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-muted/50 flex flex-col items-start space-y-4">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-green-100 p-2">
                <Calculator className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Loan Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(loanDetailsForm.getValues().amount_requested || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {loanDetailsForm.getValues().loan_duration_days || 0} days
                </p>
                <p className="text-sm text-muted-foreground">Interest Rate: {interestRate.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground">Total Repayment: {formatCurrency(totalRepayment)}</p>
                <p className="text-sm text-muted-foreground">
                  Purpose: {loanDetailsForm.getValues().purpose_category || "Not specified"}
                </p>
                {existingLoanInfo?.existing_loans && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Note: You have existing loans totaling {formatCurrency(existingLoanInfo.total_existing_loan_amount)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-green-100 p-2">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you need assistance with your application, please contact our support team.
                </p>
                <Button variant="link" className="h-auto p-0 text-green-600" asChild>
                  <Link href="/dashboard/farmer/support">Contact Support</Link>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
