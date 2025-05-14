"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Calculator, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { applyForLoan } from "@/actions/farmer-actions"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export const dynamic = "force-dynamic"

const loanFormSchema = z.object({
  amount: z.coerce
    .number()
    .min(10000, "Minimum loan amount is ₦10,000")
    .max(1000000, "Maximum loan amount is ₦1,000,000"),
  duration: z.coerce.number().min(1, "Minimum duration is 1 month").max(36, "Maximum duration is 36 months"),
  purpose: z
    .string()
    .min(5, "Purpose must be at least 5 characters")
    .max(100, "Purpose must be at most 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be at most 500 characters"),
  businessPlan: z.instanceof(File).optional(),
})

type LoanFormValues = z.infer<typeof loanFormSchema>

export default function LoanApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      amount: 50000,
      duration: 6,
      purpose: "",
      description: "",
    },
  })

  const amount = form.watch("amount")
  const duration = form.watch("duration")

  // Simple loan calculator
  const interestRate = 0.05 // 5% flat rate
  const monthlyPayment = amount ? (amount + amount * interestRate * duration) / duration : 0

  async function onSubmit(data: LoanFormValues) {
    setIsSubmitting(true)
    try {
      await applyForLoan(data)
      toast({
        title: "Loan application submitted",
        description: "Your loan application has been submitted successfully.",
      })
      router.push("/dashboard/farmer/loans")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your loan application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/farmer/loans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>
          <p className="text-muted-foreground">Fill out the form below to apply for a loan</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Application Form</CardTitle>
            <CardDescription>Provide details about your loan request</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Enter an amount between ₦10,000 and ₦1,000,000</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Duration (months)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={1}
                            max={36}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">1 month</span>
                            <span className="font-medium">{field.value} months</span>
                            <span className="text-sm text-muted-foreground">36 months</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
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
                          <SelectItem value="Farm Equipment">Farm Equipment</SelectItem>
                          <SelectItem value="Seeds and Fertilizer">Seeds and Fertilizer</SelectItem>
                          <SelectItem value="Irrigation System">Irrigation System</SelectItem>
                          <SelectItem value="Land Acquisition">Land Acquisition</SelectItem>
                          <SelectItem value="Farm Expansion">Farm Expansion</SelectItem>
                          <SelectItem value="Livestock Purchase">Livestock Purchase</SelectItem>
                          <SelectItem value="Storage Facility">Storage Facility</SelectItem>
                          <SelectItem value="Transportation">Transportation</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessPlan"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Business Plan (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                onChange(file)
                              }
                            }}
                            {...fieldProps}
                          />
                          <Button type="button" variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>Upload a business plan document (PDF, DOC, or DOCX)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Loan Calculator
            </CardTitle>
            <CardDescription>Estimate your monthly repayments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Loan Summary</h3>
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Principal Amount:</span>
                  <span className="font-medium">₦{amount?.toLocaleString() || 0}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Loan Duration:</span>
                  <span className="font-medium">{duration || 0} months</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Interest Rate:</span>
                  <span className="font-medium">5% (flat)</span>
                </div>
                <div className="mt-4 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Repayment:</span>
                    <span className="font-medium">
                      ₦{((amount || 0) + (amount || 0) * interestRate * (duration || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Payment:</span>
                    <span className="text-lg font-bold text-green-600">
                      ₦{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Eligibility Criteria</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Must be a verified farmer on the platform</li>
                <li>Must have completed your profile</li>
                <li>Must have uploaded required documents</li>
                <li>Must have a valid bank account</li>
                <li>Must have a good credit history (if applicable)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Loan Terms</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>5% flat interest rate</li>
                <li>No early repayment penalties</li>
                <li>First payment due 30 days after disbursement</li>
                <li>Loan approval typically takes 3-5 business days</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-2 border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">Need help with your application?</p>
            <Button variant="link" className="h-auto p-0 text-green-600" asChild>
              <Link href="/dashboard/farmer/support">Contact our support team</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
