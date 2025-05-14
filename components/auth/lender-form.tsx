"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"

const formSchema = z.object({
  organizationName: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  contactPersonName: z.string().min(2, {
    message: "Contact person name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  organizationType: z.string().min(1, {
    message: "Please select an organization type.",
  }),
  licenseNumber: z.string().optional(),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  bio: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function LenderForm({ userId }: { userId?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      contactPersonName: "",
      email: "",
      phone: "",
      organizationType: "",
      licenseNumber: "",
      address: "",
      city: "",
      state: "",
      bio: "",
    },
  })

  // Fetch lender data if userId is provided
  useEffect(() => {
    const fetchLenderData = async () => {
      if (!userId) return

      setIsLoadingData(true)
      try {
        // Get user email from auth
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(userError.message)
        }

        if (!userData.user) {
          throw new Error("User not found")
        }

        // Get lender data from database
        const { data: lenderData, error: lenderError } = await supabase
          .from("lenders")
          .select(`
            *,
            address:address_id (
              street_address,
              city,
              state
            )
          `)
          .eq("id", userId)
          .single()

        if (lenderError) {
          throw new Error(lenderError.message)
        }

        // Prefill form with lender data
        form.reset({
          organizationName: lenderData.organization_name || "",
          contactPersonName: lenderData.contact_person_name || "",
          email: userData.user.email || "",
          phone: lenderData.phone || "",
          organizationType: lenderData.organization_type || "",
          licenseNumber: lenderData.license_number || "",
          address: lenderData.address?.street_address || "",
          city: lenderData.address?.city || "",
          state: lenderData.address?.state || "",
          bio: lenderData.bio || "",
        })
      } catch (error) {
        console.error("Error fetching lender data:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchLenderData()
  }, [userId, form, supabase, toast])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register-lender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId: userId, // Pass userId if updating existing lender
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to register")
      }

      toast({
        title: userId ? "Profile updated" : "Registration successful",
        description: userId
          ? "Your profile has been updated successfully."
          : "Your registration has been submitted for approval.",
      })

      // Redirect to confirmation page or dashboard
      if (userId) {
        router.push("/dashboard/lender")
      } else {
        router.push("/auth/confirmation")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{userId ? "Update Your Profile" : "Lender Registration"}</CardTitle>
        <CardDescription>
          {userId
            ? "Update your organization and contact information"
            : "Register as a lender to provide financing to farmers"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Organization Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  {...form.register("organizationName")}
                  placeholder="Your organization name"
                />
                {form.formState.errors.organizationName && (
                  <p className="text-sm text-destructive">{form.formState.errors.organizationName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationType">Organization Type *</Label>
                <Select
                  onValueChange={(value) => form.setValue("organizationType", value)}
                  defaultValue={form.getValues("organizationType")}
                >
                  <SelectTrigger id="organizationType">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="microfinance">Microfinance Institution</SelectItem>
                    <SelectItem value="cooperative">Cooperative</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                    <SelectItem value="government">Government Agency</SelectItem>
                    <SelectItem value="private">Private Investor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.organizationType && (
                  <p className="text-sm text-destructive">{form.formState.errors.organizationType.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number (if applicable)</Label>
                <Input
                  id="licenseNumber"
                  {...form.register("licenseNumber")}
                  placeholder="Your organization's license number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                <Input
                  id="contactPersonName"
                  {...form.register("contactPersonName")}
                  placeholder="Full name of contact person"
                />
                {form.formState.errors.contactPersonName && (
                  <p className="text-sm text-destructive">{form.formState.errors.contactPersonName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="Your email address"
                  disabled={!!userId} // Disable email field if updating existing profile
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" {...form.register("phone")} placeholder="Your phone number" />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input id="address" {...form.register("address")} placeholder="Your street address" />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...form.register("city")} placeholder="Your city" />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" {...form.register("state")} placeholder="Your state" />
                {form.formState.errors.state && (
                  <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / About Your Organization</Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              placeholder="Tell us about your organization and its mission"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {userId ? "Updating..." : "Submitting..."}
              </>
            ) : userId ? (
              "Update Profile"
            ) : (
              "Submit Registration"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
