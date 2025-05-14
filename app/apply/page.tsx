"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export default function LoanApplication() {
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    duration: "6",
    additionalInfo: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a loan application.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("loan_applications").insert([
        {
          user_id: user.id,
          amount: Number.parseFloat(formData.amount),
          purpose: formData.purpose,
          duration: Number.parseInt(formData.duration),
          additional_info: formData.additionalInfo,
          status: "pending",
        },
      ])

      if (error) throw error

      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    router.push("/")
    return <div className="flex h-screen items-center justify-center">Redirecting...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Loan Application</h1>
              <p className="text-muted-foreground">Complete this form to apply for agricultural financing.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>Provide information about the loan you're requesting.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount Requested (₦)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter amount in Naira"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Based on your credit score, you're eligible for up to ₦300,000.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose of Loan</Label>
                    <select
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select purpose</option>
                      <option value="seeds">Seeds and Fertilizers</option>
                      <option value="equipment">Farm Equipment</option>
                      <option value="expansion">Farm Expansion</option>
                      <option value="livestock">Livestock Purchase</option>
                      <option value="storage">Storage Facilities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Loan Duration (months)</Label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="18">18 months</option>
                      <option value="24">24 months</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      placeholder="Provide any additional details about your loan request"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="mb-2 font-medium">Loan Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span>₦{formData.amount ? Number.parseInt(formData.amount).toLocaleString() : "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{formData.duration} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Interest Rate:</span>
                        <span>5% - 12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Time:</span>
                        <span>3-5 business days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
                  >
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
