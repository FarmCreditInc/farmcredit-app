"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Loader2, Upload, AlertTriangle, Eye, EyeOff, FileText, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createBrowserClient } from "@/lib/supabase-browser"
import { toast } from "react-hot-toast"
import { getProfileImageUrl } from "@/utils/storage-utils"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// Profile form schema
const profileFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: z.string().optional(),
  age: z.coerce.number().min(18, "You must be at least 18 years old").optional(),
  date_of_birth: z.string().optional(),
  street_address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().optional(),
  country: z.string().default("Nigeria"),
  geopolitical_zone: z.string().optional(),
  education_level: z.string().optional(),
  farming_experience: z.coerce.number().min(0).optional(),
  is_coop_member: z.boolean().optional(),
  identification_type: z.string().optional(),
  identification_number: z.string().optional(),
  other_sources_of_income: z.string().optional(),
})

// Password form schema
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Next of kin form schema
const nextOfKinFormSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  relationship: z.string().min(2, "Relationship is required"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
})

interface SettingsClientProps {
  initialFarmerData: any | null
  initialNextOfKinData: any | null
  userId: string
  userEmail: string
}

export default function SettingsClient({
  initialFarmerData,
  initialNextOfKinData,
  userId,
  userEmail,
}: SettingsClientProps) {
  const router = useRouter()
  const { toast: uiToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(initialFarmerData?.profile_url || null)
  const [signedProfileUrl, setSignedProfileUrl] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(initialFarmerData?.id_document_url || null)
  const [nextOfKin, setNextOfKin] = useState<any>(initialNextOfKinData)
  const [loadingDocument, setLoadingDocument] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const tabParam = searchParams.get("tab")

  const supabase = createBrowserClient()

  // Get user data
  const [userData, setUserData] = useState<any>(initialFarmerData)
  const [isLoadingUserData, setIsLoadingUserData] = useState(false)

  // Nigerian states for the dropdown
  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ]

  // State to geopolitical zone mapping
  const stateToZoneMapping: Record<string, string> = {
    abia: "South East",
    adamawa: "North East",
    "akwa ibom": "South South",
    anambra: "South East",
    bauchi: "North East",
    bayelsa: "South South",
    benue: "North Central",
    borno: "North East",
    "cross river": "South South",
    delta: "South South",
    ebonyi: "South East",
    edo: "South South",
    ekiti: "South West",
    enugu: "South East",
    fct: "North Central",
    gombe: "North East",
    imo: "South East",
    jigawa: "North West",
    kaduna: "North West",
    kano: "North West",
    katsina: "North West",
    kebbi: "North West",
    kogi: "North Central",
    kwara: "North Central",
    lagos: "South West",
    nasarawa: "North Central",
    niger: "North Central",
    ogun: "South West",
    ondo: "South West",
    osun: "South West",
    oyo: "South West",
    plateau: "North Central",
    rivers: "South South",
    sokoto: "North West",
    taraba: "North East",
    yobe: "North East",
    zamfara: "North West",
  }

  // Geopolitical zones
  const geopoliticalZones = ["North Central", "North East", "North West", "South East", "South South", "South West"]

  // Format date of birth if it exists
  const formatDateOfBirth = (dateString: string | null | undefined) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    } catch (error) {
      console.error("Error formatting date:", error)
      return ""
    }
  }

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: initialFarmerData?.full_name || "",
      email: initialFarmerData?.email || "",
      phone: initialFarmerData?.phone || "",
      gender: initialFarmerData?.gender || "",
      age: initialFarmerData?.age || undefined,
      date_of_birth: formatDateOfBirth(initialFarmerData?.date_of_birth) || "",
      street_address: initialFarmerData?.address?.street_address || "",
      city: initialFarmerData?.address?.city || "",
      state: initialFarmerData?.address?.state || "",
      postal_code: initialFarmerData?.address?.postal_code || "",
      country: initialFarmerData?.address?.country || "Nigeria",
      geopolitical_zone: initialFarmerData?.address?.geopolitical_zone || "",
      education_level: initialFarmerData?.education_level || "",
      farming_experience: initialFarmerData?.farming_experience || undefined,
      is_coop_member: initialFarmerData?.is_coop_member || false,
      identification_type: initialFarmerData?.identification_type || "",
      identification_number: initialFarmerData?.identification_number || "",
      other_sources_of_income: initialFarmerData?.other_sources_of_income || "",
    },
  })

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Next of kin form
  const nextOfKinForm = useForm<z.infer<typeof nextOfKinFormSchema>>({
    resolver: zodResolver(nextOfKinFormSchema),
    defaultValues: {
      full_name: initialNextOfKinData?.full_name || "",
      relationship: initialNextOfKinData?.relationship || "",
      phone_number: initialNextOfKinData?.phone_number || "",
      address: initialNextOfKinData?.address || "",
    },
  })

  // Function to handle document viewing
  async function handleViewDocument() {
    if (!idDocumentUrl) {
      uiToast({
        title: "No document",
        description: "No document was uploaded for this farmer",
        variant: "destructive",
      })
      return
    }

    setLoadingDocument(true)

    try {
      console.log("Requesting signed URL for document:", idDocumentUrl)

      // Use the get-document-url API route instead of the admin route
      const response = await fetch("/api/get-document-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: idDocumentUrl }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to retrieve document")
      }

      console.log("Successfully retrieved signed URL")

      // Open the document in a new tab
      window.open(data.url, "_blank")
    } catch (error) {
      console.error("Error retrieving document:", error)
      uiToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to retrieve document",
        variant: "destructive",
      })
    } finally {
      setLoadingDocument(false)
    }
  }

  // Update geopolitical zone when state changes
  useEffect(() => {
    const state = profileForm.getValues("state")
    if (state && stateToZoneMapping[state.toLowerCase()]) {
      profileForm.setValue("geopolitical_zone", stateToZoneMapping[state.toLowerCase()])
    }
  }, [profileForm.watch("state"), profileForm])

  // Calculate age whenever date of birth changes
  useEffect(() => {
    const dob = profileForm.getValues("date_of_birth")
    if (dob) {
      const birthDate = new Date(dob)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      profileForm.setValue("age", age)
    }
  }, [profileForm.watch("date_of_birth"), profileForm])

  // Add this effect to generate signed URLs when profileImageUrl changes
  useEffect(() => {
    const loadSignedUrl = async () => {
      if (profileImageUrl) {
        // If it's a blob URL (from local file selection), use it directly
        if (profileImageUrl.startsWith("blob:")) {
          setSignedProfileUrl(profileImageUrl)
          return
        }

        // Otherwise, generate a signed URL
        try {
          const signedUrl = await getProfileImageUrl(profileImageUrl)
          setSignedProfileUrl(signedUrl)
        } catch (error) {
          console.error("Error getting signed profile URL:", error)
          // Continue without signed URL
        }
      } else {
        setSignedProfileUrl(null)
      }
    }

    loadSignedUrl()
  }, [profileImageUrl])

  // Compare form data with original data to find changes
  const getChangedFields = (formData: any, originalData: any) => {
    const changedFields: Record<string, any> = {}

    // Loop through form data and compare with original data
    Object.keys(formData).forEach((key) => {
      // Skip email as it can't be changed
      if (key === "email") return

      // Handle special cases for numbers and booleans
      if (typeof formData[key] === "number" && formData[key] !== originalData[key]) {
        changedFields[key] = formData[key]
      }
      // Handle boolean values
      else if (typeof formData[key] === "boolean" && formData[key] !== originalData[key]) {
        changedFields[key] = formData[key]
      }
      // Handle string values - check if they're different and not empty
      else if (typeof formData[key] === "string" && formData[key] && formData[key] !== originalData[key]) {
        changedFields[key] = formData[key]
      }
    })

    return changedFields
  }

  // Handle profile form submission
  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsLoading(true)

    try {
      if (!userData || !userId) {
        throw new Error("User data not found")
      }

      // Get only the fields that have changed
      const changedFields = getChangedFields(data, userData)

      // Extract address fields
      const addressFields = {
        street_address: data.street_address,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        geopolitical_zone: data.geopolitical_zone,
      }

      // Remove address fields from changedFields
      delete changedFields.street_address
      delete changedFields.city
      delete changedFields.state
      delete changedFields.postal_code
      delete changedFields.country
      delete changedFields.geopolitical_zone

      // If there's a profile image, add it to the changes
      let profileUrl = userData?.profile_url

      if (Object.keys(changedFields).length === 0 && !profileImage) {
        uiToast({
          title: "No changes detected",
          description: "No changes were made to your profile.",
        })
        setIsLoading(false)
        return
      }

      console.log("Updating profile with changed fields:", changedFields)

      if (profileImage) {
        try {
          // Use the API route to upload the image to bypass RLS
          const formData = new FormData()
          formData.append("file", profileImage)
          formData.append("userId", userId)
          formData.append("userEmail", userEmail)

          console.log("Uploading profile image via API route")

          const uploadResponse = await fetch("/api/upload-profile-image", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            throw new Error(errorData.error || "Failed to upload profile image")
          }

          const uploadResult = await uploadResponse.json()
          profileUrl = uploadResult.url

          console.log("Profile image uploaded successfully:", profileUrl)
          setProfileImageUrl(profileUrl)

          // Add profile_url to changed fields
          changedFields.profile_url = profileUrl
        } catch (uploadError) {
          console.error("Error in profile image upload:", uploadError)
          throw new Error(`Failed to upload profile image: ${uploadError.message}`)
        }
      }

      // Always add updated_at to the changed fields
      changedFields.updated_at = new Date().toISOString()

      // Update address if it exists
      if (userData.address_id) {
        const { error: addressError } = await supabase
          .from("address")
          .update({
            ...addressFields,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userData.address_id)

        if (addressError) {
          console.error("Error updating address:", addressError)
          throw new Error(`Failed to update address: ${addressError.message}`)
        }
      } else {
        // Create new address
        const { data: newAddress, error: addressError } = await supabase
          .from("address")
          .insert({
            ...addressFields,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        // Add address_id to changed fields
        changedFields.address_id = newAddress.id
      }

      // Update user profile using the API route to bypass RLS
      const response = await fetch("/api/update-farmer-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmerId: userId,
          profileData: changedFields,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      // Refresh user data
      const { data: refreshedData, error: refreshError } = await supabase
        .from("farmers")
        .select("*, address:address_id(*)")
        .eq("id", userId)
        .single()

      if (refreshError) {
        throw refreshError
      }

      setUserData(refreshedData)

      // Show toast notification
      toast.success("Profile updated successfully")

      uiToast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")

      uiToast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle next of kin form submission
  const onNextOfKinSubmit = async (data: z.infer<typeof nextOfKinFormSchema>) => {
    setIsLoading(true)

    try {
      if (!userId) {
        throw new Error("User data not found")
      }

      console.log("Updating next of kin with data:", data)

      // Check if next of kin details already exist
      if (nextOfKin) {
        // Compare to find only changed fields
        const changedFields: Record<string, any> = {}

        Object.keys(data).forEach((key) => {
          if (data[key] !== nextOfKin[key]) {
            changedFields[key] = data[key]
          }
        })

        if (Object.keys(changedFields).length === 0) {
          uiToast({
            title: "No changes detected",
            description: "No changes were made to next of kin details.",
          })
          setIsLoading(false)
          return
        }

        // Always add updated_at
        changedFields.updated_at = new Date().toISOString()

        // Update existing next of kin details with only changed fields
        const { error } = await supabase.from("farmer_next_of_kin").update(changedFields).eq("id", nextOfKin.id)

        if (error) {
          throw error
        }
      } else {
        // Insert new next of kin details
        const { error } = await supabase.from("farmer_next_of_kin").insert({
          farmer_id: userId,
          full_name: data.full_name,
          relationship: data.relationship,
          phone_number: data.phone_number,
          address: data.address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) {
          throw error
        }
      }

      // Refresh next of kin details
      const { data: refreshedData, error: refreshError } = await supabase
        .from("farmer_next_of_kin")
        .select("*")
        .eq("farmer_id", userId)
        .single()

      if (refreshError && refreshError.code !== "PGRST116") {
        throw refreshError
      }

      if (refreshedData) {
        setNextOfKin(refreshedData)
      }

      // Show toast notification
      toast.success("Next of kin details updated successfully")

      uiToast({
        title: "Next of kin updated",
        description: "Your next of kin details have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating next of kin:", error)
      toast.error("Failed to update next of kin details")

      uiToast({
        title: "Error",
        description: "Failed to update next of kin details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password form submission
  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsLoading(true)

    try {
      console.log("Updating password")

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) {
        throw error
      }

      // Show toast notification
      toast.success("Password updated successfully")

      uiToast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })

      passwordForm.reset()
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("Failed to update password")

      uiToast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      setProfileImageUrl(URL.createObjectURL(file))
    }
  }

  // If there's no data and we're not in a loading state, show an error
  if (!userData && !isLoadingUserData) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 border rounded-lg shadow-sm">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">Failed to load user data. Please try refreshing the page.</p>
          <div className="flex flex-col gap-4">
            <Button onClick={() => router.refresh()} className="mx-auto">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/farmer">Return to Dashboard</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue={tabParam || "profile"} className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="next-of-kin">Next of Kin</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information and farm details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col items-center space-y-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-muted">
                  {signedProfileUrl ? (
                    <Image
                      src={signedProfileUrl || "/placeholder.svg"}
                      alt={userData?.full_name || "Profile"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      {userData?.full_name?.charAt(0) || "F"}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="profile-image"
                    className="flex cursor-pointer items-center space-x-2 rounded-md border px-4 py-2 hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Change Photo</span>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} disabled />
                            </FormControl>
                            <FormDescription>Email cannot be changed</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                max={
                                  new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                                    .toISOString()
                                    .split("T")[0]
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age (Calculated)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} readOnly className="opacity-75 cursor-not-allowed" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="street_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                // Update geopolitical zone when state changes
                                if (stateToZoneMapping[value.toLowerCase()]) {
                                  profileForm.setValue("geopolitical_zone", stateToZoneMapping[value.toLowerCase()])
                                }
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {nigerianStates.map((state) => (
                                  <SelectItem key={state} value={state.toLowerCase()}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Postal Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="geopolitical_zone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Geopolitical Zone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select geopolitical zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {geopoliticalZones.map((zone) => (
                                  <SelectItem key={zone} value={zone}>
                                    {zone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Identification</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="identification_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Identification Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NIN">NIN</SelectItem>
                                <SelectItem value="Voter Card">Voter Card</SelectItem>
                                <SelectItem value="International Passport">International Passport</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="identification_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Identification Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your ID number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Education</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="education_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Education Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No Formal Education</SelectItem>
                                <SelectItem value="primary">Primary Education</SelectItem>
                                <SelectItem value="secondary">Secondary Education</SelectItem>
                                <SelectItem value="tertiary">Tertiary Education</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="farming_experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farming Experience (years)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="is_coop_member"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Cooperative Member</FormLabel>
                              <FormDescription>Are you a member of a farming cooperative?</FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="other_sources_of_income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other Sources of Income</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., Trading, Civil Service, Artisan (comma separated)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="next-of-kin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Next of Kin</CardTitle>
              <CardDescription>Add or update your next of kin information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...nextOfKinForm}>
                <form onSubmit={nextOfKinForm.handleSubmit(onNextOfKinSubmit)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={nextOfKinForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Next of kin's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nextOfKinForm.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spouse, Parent, Child, Sibling" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nextOfKinForm.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Next of kin's phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nextOfKinForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Next of kin's address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="flex items-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {nextOfKin ? "Update Next of Kin" : "Add Next of Kin"}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>View your uploaded identification documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">ID Document</h3>
                  {idDocumentUrl ? (
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <FileText className="h-6 w-6 mr-2 text-muted-foreground" />
                          <span>Identification Document (Uploaded during signup)</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleViewDocument} disabled={loadingDocument}>
                          {loadingDocument ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading document...
                            </>
                          ) : (
                            "View Document"
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This document was provided during registration and cannot be changed. If you need to update your
                        ID document, please contact support.
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="text-lg font-medium mb-2">No ID Document Found</h4>
                      <p className="text-muted-foreground mb-4">
                        Your identification document from signup could not be found. Please contact support.
                      </p>
                      <Button asChild>
                        <Link href="/dashboard/farmer/support">Contact Support</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type={showCurrentPassword ? "text" : "password"} {...field} className="pr-10" />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type={showNewPassword ? "text" : "password"} {...field} className="pr-10" />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormDescription>Password must be at least 8 characters long</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type={showConfirmPassword ? "text" : "password"} {...field} className="pr-10" />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
