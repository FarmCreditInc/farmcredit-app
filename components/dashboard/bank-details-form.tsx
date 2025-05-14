"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase-browser"

const bankDetailsSchema = z.object({
  bank_name: z.string().min(2, { message: "Bank name is required" }),
  bank_account_number: z
    .string()
    .min(10, { message: "Account number must be at least 10 digits" })
    .max(10, { message: "Account number must be 10 digits" }),
  bank_account_name: z.string().min(2, { message: "Account name is required" }),
  bvn: z.string().min(11, { message: "BVN must be 11 digits" }).max(11, { message: "BVN must be 11 digits" }),
})

type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>

interface BankDetailsFormProps {
  userId: string
  existingDetails?: {
    id: string
    bank_name: string
    bank_account_number: string
    bank_account_name: string
    bvn: string
  } | null
}

export function BankDetailsForm({ userId, existingDetails }: BankDetailsFormProps) {
  console.log("BankDetailsForm props:", { userId, existingDetails })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bank_name: existingDetails?.bank_name || "",
      bank_account_number: existingDetails?.bank_account_number || "",
      bank_account_name: existingDetails?.bank_account_name || "",
      bvn: existingDetails?.bvn || "",
    },
  })

  useEffect(() => {
    if (existingDetails) {
      console.log("Setting form values from existingDetails:", existingDetails)
      form.reset({
        bank_name: existingDetails.bank_name || "",
        bank_account_number: existingDetails.bank_account_number || "",
        bank_account_name: existingDetails.bank_account_name || "",
        bvn: existingDetails.bvn || "",
      })
    }
  }, [existingDetails, form])

  async function onSubmit(data: BankDetailsFormValues) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      if (!userId) {
        throw new Error("User ID not found. Please refresh the page and try again.")
      }

      // Use the API endpoint instead of direct Supabase calls
      const response = await fetch("/api/dashboard/update-bank-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmerId: userId,
          bankDetails: data,
          mode: existingDetails ? "edit" : "add",
          paymentDetailsId: existingDetails?.id || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save bank details")
      }

      setSuccess(true)
      router.refresh()

      // Switch to the bank-details tab after successful submission
      setTimeout(() => {
        document.querySelector('[data-value="bank-details"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      }, 1500)
    } catch (err: any) {
      console.error("Error saving bank details:", err)
      setError(err.message || "Failed to save bank details. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Your bank details have been saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your bank name" {...field} />
                </FormControl>
                <FormDescription>Enter the full name of your bank (e.g., First Bank of Nigeria)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bank_account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your 10-digit account number" {...field} />
                </FormControl>
                <FormDescription>Your 10-digit bank account number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bank_account_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter account holder name" {...field} />
                </FormControl>
                <FormDescription>The name registered with your bank account</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bvn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BVN (Bank Verification Number)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your 11-digit BVN" {...field} />
                </FormControl>
                <FormDescription>Your 11-digit Bank Verification Number (BVN)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : existingDetails ? "Update Bank Details" : "Save Bank Details"}
          </Button>
        </form>
      </Form>

      <div className="rounded-md bg-blue-50 p-4 mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Why we need your bank details</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Your bank details are required for loan disbursements and repayments. We ensure your information is
                securely stored and only used for transaction purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
