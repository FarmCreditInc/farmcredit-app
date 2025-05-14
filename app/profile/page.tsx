"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function Profile() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and farm information.</p>
            </div>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="farm">Farm Details</TabsTrigger>
                <TabsTrigger value="financial">Financial Info</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and contact information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" placeholder="Your full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="Your phone number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" placeholder="Your age" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="Your address" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="Your state" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lga">LGA</Label>
                        <Input id="lga" placeholder="Your LGA" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal-code">Postal Code</Label>
                        <Input id="postal-code" placeholder="Your postal code" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="farm" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Farm Details</CardTitle>
                    <CardDescription>Information about your farm and agricultural practices.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="farm-name">Farm Name</Label>
                        <Input id="farm-name" placeholder="Your farm name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farm-size">Farm Size (hectares)</Label>
                        <Input id="farm-size" type="number" placeholder="Farm size in hectares" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farm-type">Primary Farm Type</Label>
                        <select
                          id="farm-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select farm type</option>
                          <option value="crops">Crops</option>
                          <option value="livestock">Livestock</option>
                          <option value="mixed">Mixed Farming</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input id="experience" type="number" placeholder="Years of farming experience" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Crops/Livestock</Label>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="primary-crop">Primary Crop/Livestock</Label>
                          <Input id="primary-crop" placeholder="E.g., Cassava, Rice, Poultry" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secondary-crop">Secondary Crop/Livestock</Label>
                          <Input id="secondary-crop" placeholder="E.g., Maize, Vegetables, Goats" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Farming Practices</Label>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="fertilizer" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="fertilizer">Use of Fertilizer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="irrigation" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="irrigation">Irrigation System</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="machinery" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="machinery">Use of Machinery</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="storage" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="storage">Storage Access</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="cooperative" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="cooperative">Cooperative Member</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Information</CardTitle>
                    <CardDescription>
                      Your financial details help us determine your credit score and loan eligibility.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="annual-income">Estimated Annual Income (₦)</Label>
                        <Input id="annual-income" type="number" placeholder="Your estimated annual income" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank-account">Bank Account</Label>
                        <select
                          id="bank-account"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Do you have a bank account?</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Previous Loans</Label>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="previous-loan">Have you taken a loan before?</Label>
                            <select
                              id="previous-loan"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select an option</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="loan-repaid">Was it fully repaid?</Label>
                            <select
                              id="loan-repaid"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select an option</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="na">Not Applicable</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Assets</Label>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="land" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="land">Own Land</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="vehicle" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="vehicle">Own Vehicle</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="equipment" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="equipment">Own Farm Equipment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="livestock-asset" className="h-4 w-4 rounded border-gray-300" />
                          <Label htmlFor="livestock-asset">Own Livestock</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
