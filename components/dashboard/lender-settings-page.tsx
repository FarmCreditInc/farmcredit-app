"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Eye, FileText, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase-browser"

interface LenderSettingsPageProps {
  lender?: any
  documents?: any[]
}

export function LenderSettingsPage({ lender, documents = [] }: LenderSettingsPageProps) {
  const [isLoading, setIsLoading] = useState(!lender)
  const [lenderData, setLenderData] = useState<any>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [organizationType, setOrganizationType] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [loadingDocument, setLoadingDocument] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch lender data if not provided as prop
  useEffect(() => {
    if (lender) {
      setLenderData(lender)
      initializeFormData(lender)
      setIsLoading(false)
    } else {
      const fetchLenderData = async () => {
        try {
          setError(null)
          console.log("Fetching lender data...")

          // Use a simple fetch to our API endpoint that uses the JWT from cookies
          const response = await fetch("/api/lenders/current", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Important: include cookies with the request
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to fetch user data")
          }

          const userData = await response.json()
          if (!userData || !userData.id) {
            throw new Error("User data not found")
          }

          console.log("Lender data fetched successfully:", userData.id)
          setLenderData(userData)
          initializeFormData(userData)
        } catch (error) {
          console.error("Error fetching lender data:", error)
          setError(error instanceof Error ? error.message : "Failed to load profile data")
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to load profile data",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchLenderData()
    }
  }, [lender, toast])

  // Initialize form data from lender object
  const initializeFormData = (data: any) => {
    if (!data) return

    setName(data.contact_person_name || "")
    setEmail(data.email || "")
    setPhone(data.phone || "")
    setOrganizationName(data.organization_name || "")
    setOrganizationType(data.organization_type || "")
    setLicenseNumber(data.license_number || "")
    setAddress(data.address?.street_address || data.address || "")
    setCity(data.address?.city || data.city || "")
    setState(data.address?.state || data.state || "")
  }

  // Rest of the component remains the same...
  // ... (keeping all the existing functions and JSX)

  // The rest of the component code remains unchanged
  const handleUpdateProfile = async () => {
    if (!name || !organizationName) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!lenderData || !lenderData.id) {
      toast({
        title: "Error",
        description: "Lender data not available. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingProfile(true)
    try {
      // Upload profile photo if selected
      let profileUrl = lenderData.profile_url || null
      if (profilePhoto) {
        setUploadingPhoto(true)
        const filePath = `profiles/${email}/${Date.now()}_${profilePhoto.name}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filePath, profilePhoto, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Error uploading profile photo: ${uploadError.message}`)
        }

        if (uploadData) {
          profileUrl = `photos/${filePath}`
        }
        setUploadingPhoto(false)
      }

      const response = await fetch("/api/update-lender-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderId: lenderData.id,
          profileData: {
            contact_person_name: name,
            email,
            phone,
            organization_name: organizationName,
            organization_type: organizationType,
            license_number: licenseNumber,
            address,
            city,
            state,
            profile_url: profileUrl,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Update local lender data
      setLenderData({
        ...lenderData,
        contact_person_name: name,
        email,
        phone,
        organization_name: organizationName,
        organization_type: organizationType,
        license_number: licenseNumber,
        address,
        city,
        state,
        profile_url: profileUrl,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePhoto(e.target.files[0])
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation don't match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    if (!lenderData || !lenderData.id) {
      toast({
        title: "Error",
        description: "Lender data not available. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const response = await fetch("/api/update-lender-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderId: lenderData.id,
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update password")
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })

      // Reset password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: 'Please type "DELETE" to confirm account deletion',
        variant: "destructive",
      })
      return
    }

    if (!lenderData || !lenderData.id) {
      toast({
        title: "Error",
        description: "Lender data not available. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch("/api/delete-lender-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderId: lenderData.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete account")
      }

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully",
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsConfirmingDelete(false)
    }
  }

  // Function to handle document viewing using the server-side API
  async function handleViewDocument(documentPath: string) {
    if (!documentPath) {
      toast({
        title: "No document",
        description: "No document was uploaded",
        variant: "destructive",
      })
      return
    }

    setLoadingDocument(true)

    try {
      console.log("Requesting signed URL for document:", documentPath)

      // Use the server-side API to get a signed URL
      const response = await fetch(`/api/get-document-url?path=${encodeURIComponent(documentPath)}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (!data.url) {
        throw new Error(data.error || "Failed to retrieve document URL")
      }

      console.log("Successfully retrieved signed URL")

      // Open the document in a new tab
      window.open(data.url, "_blank")
    } catch (error) {
      console.error("Error retrieving document:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to retrieve document",
        variant: "destructive",
      })
    } finally {
      setLoadingDocument(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!lenderData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load your profile data. Please try refreshing the page or contact support if the problem persists.
            <div className="mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal and organization information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Photo</h3>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {lenderData.profile_url ? (
                      <img
                        src={`/api/get-signed-profile-url?path=${encodeURIComponent(lenderData.profile_url)}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/abstract-geometric-shapes.png"
                        }}
                      />
                    ) : profilePhoto ? (
                      <img
                        src={URL.createObjectURL(profilePhoto) || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-muted-foreground">👤</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="profile-photo" className="block mb-2">
                      Upload new photo
                    </Label>
                    <Input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Recommended: Square image, at least 200x200px</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Organization Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input
                      id="organizationName"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Your organization name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organization Type *</Label>
                    <Select value={organizationType} onValueChange={(value) => setOrganizationType(value)}>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number (if applicable)</Label>
                    <Input
                      id="licenseNumber"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="Your organization's license number"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Contact Person Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name of contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled={true}
                      className="bg-muted"
                      placeholder="Your email address"
                    />
                    <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Your state"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile || uploadingPhoto}>
                {isUpdatingProfile || uploadingPhoto ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingPhoto ? "Uploading Photo..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Your new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Deleting your account will remove all your data from our system. This includes your profile
                    information, transaction history, and any active loans or investments.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={() => setIsConfirmingDelete(true)}>
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>View your uploaded verification documents</CardDescription>
            </CardHeader>
            <CardContent>
              {lenderData.verification_document_url ? (
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Verification Document</p>
                      <p className="text-sm text-muted-foreground">Organization Verification</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDocument(lenderData.verification_document_url)}
                    disabled={loadingDocument}
                  >
                    {loadingDocument ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    View
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No documents found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please type <span className="font-bold">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
