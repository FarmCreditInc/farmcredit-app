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
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    education: "",
    state: "",
    lga: "",

    // Farm & Financial Info
    cropType: "",
    landSize: "",
    experience: "",
    previousLoan: "",
    income: "",

    // Assets & Practices
    fertilizer: false,
    irrigation: false,
    machinery: false,
    storage: false,
    cooperative: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const nextStep = () => {
    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const saveAndContinueLater = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("registration_drafts").insert([
        {
          user_email: formData.email,
          form_data: formData,
          step: step,
        },
      ])

      if (error) throw error

      toast({
        title: "Progress Saved",
        description: "Your registration progress has been saved. You can continue later.",
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Calculate a simple credit score based on form data
      let creditScore = 50 // Base score

      // Add points based on form data
      if (Number.parseInt(formData.experience) > 3) creditScore += 10
      if (Number.parseFloat(formData.landSize) > 2) creditScore += 5
      if (formData.previousLoan === "yes") creditScore += 5
      if (Number.parseInt(formData.income) > 500000) creditScore += 10
      if (formData.cooperative) creditScore += 10
      if (formData.irrigation) creditScore += 5
      if (formData.machinery) creditScore += 5

      // Cap at 100
      creditScore = Math.min(creditScore, 100)

      // Save to Supabase
      const { error } = await supabase.from("farmer_profiles").insert([
        {
          ...formData,
          credit_score: creditScore,
        },
      ])

      if (error) throw error

      toast({
        title: "Registration Complete",
        description: "Your farmer profile has been created successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education Level</Label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select education level</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="tertiary">Tertiary</option>
                </select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll send you updates and notifications about your application.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Your state"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lga">LGA</Label>
                <Input
                  id="lga"
                  name="lga"
                  value={formData.lga}
                  onChange={handleChange}
                  placeholder="Your LGA"
                  required
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cropType">Type of Crops/Livestock</Label>
              <Input
                id="cropType"
                name="cropType"
                value={formData.cropType}
                onChange={handleChange}
                placeholder="E.g., Cassava, Rice, Poultry"
                required
              />
              <p className="text-xs text-muted-foreground">List your primary crops or livestock.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="landSize">Size of Land (hectares)</Label>
                <Input
                  id="landSize"
                  name="landSize"
                  type="number"
                  step="0.1"
                  value={formData.landSize}
                  onChange={handleChange}
                  placeholder="Land size in hectares"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Years of farming experience"
                  required
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="previousLoan">Past Loan History</Label>
              <select
                id="previousLoan"
                name="previousLoan"
                value={formData.previousLoan}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Have you taken a loan before?</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <p className="text-xs text-muted-foreground">This helps us assess your credit history.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Income Estimate (₦/year)</Label>
              <Input
                id="income"
                name="income"
                type="number"
                value={formData.income}
                onChange={handleChange}
                placeholder="Your estimated annual income"
                required
              />
              <p className="text-xs text-muted-foreground">Provide your best estimate of your annual farm income.</p>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Farming Practices</Label>
              <p className="text-xs text-muted-foreground">Select all that apply to your farming operation.</p>

              <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fertilizer"
                    name="fertilizer"
                    checked={formData.fertilizer}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="fertilizer">Use of Fertilizer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="irrigation"
                    name="irrigation"
                    checked={formData.irrigation}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="irrigation">Irrigation System</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="machinery"
                    name="machinery"
                    checked={formData.machinery}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="machinery">Use of Machinery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="storage"
                    name="storage"
                    checked={formData.storage}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="storage">Storage Access</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cooperative"
                  name="cooperative"
                  checked={formData.cooperative}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="cooperative">Membership in Cooperatives or Associations</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Being part of a cooperative can significantly improve your credit score.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm font-medium">By submitting this form, you confirm that:</p>
              <ul className="list-disc pl-5 pt-2 text-sm text-muted-foreground space-y-1">
                <li>All information provided is accurate and complete</li>
                <li>You authorize us to verify your information</li>
                <li>You agree to our terms of service and privacy policy</li>
              </ul>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Farmer Registration</h1>
              <p className="text-muted-foreground">
                Complete this form to create your farmer profile and get your credit score.
              </p>
            </div>

            <div className="mb-8">
              <div className="relative">
                <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-muted">
                  <div
                    className="h-1 bg-green-600 transition-all duration-300"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  />
                </div>
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        step >= 1 ? "border-green-600 bg-green-600 text-white" : "border-muted bg-background"
                      }`}
                    >
                      {step > 1 ? "✓" : "1"}
                    </div>
                    <span className="mt-2 text-xs">Personal Info</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        step >= 2 ? "border-green-600 bg-green-600 text-white" : "border-muted bg-background"
                      }`}
                    >
                      {step > 2 ? "✓" : "2"}
                    </div>
                    <span className="mt-2 text-xs">Farm & Financial</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        step >= 3 ? "border-green-600 bg-green-600 text-white" : "border-muted bg-background"
                      }`}
                    >
                      {step > 3 ? "✓" : "3"}
                    </div>
                    <span className="mt-2 text-xs">Assets & Practices</span>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Personal Information"}
                  {step === 2 && "Farm & Financial Information"}
                  {step === 3 && "Assets & Farming Practices"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Please provide your basic personal details."}
                  {step === 2 && "Tell us about your farm and financial situation."}
                  {step === 3 && "Share information about your farming practices and assets."}
                </CardDescription>
              </CardHeader>
              <form onSubmit={step === 3 ? handleSubmit : undefined}>
                <CardContent>{renderStep()}</CardContent>
                <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
                  <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                      >
                        Previous
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveAndContinueLater}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      Save & Continue Later
                    </Button>
                  </div>
                  <Button
                    type={step === 3 ? "submit" : "button"}
                    onClick={step < 3 ? nextStep : undefined}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
                  >
                    {isLoading ? "Processing..." : step < 3 ? "Next" : "Submit"}
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
