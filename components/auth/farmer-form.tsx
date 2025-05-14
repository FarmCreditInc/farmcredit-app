"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { registerFarmer } from "@/actions/registration"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const farmerFormSchema = z
  .object({
    // Personal Information
    fullName: z.string().min(2, {
      message: "Full name must be at least 2 characters.",
    }),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Please select your gender.",
    }),
    dateOfBirth: z
      .string()
      .min(1, {
        message: "Date of birth is required.",
      })
      .refine(
        (dob) => {
          if (!dob) return false
          const birthDate = new Date(dob)
          const today = new Date()
          let age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
          }
          return age >= 18
        },
        {
          message: "You must be at least 18 years old.",
        },
      ),
    age: z.number().min(18, {
      message: "You must be at least 18 years old.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    phone: z.string().min(10, {
      message: "Phone number must be at least 10 characters.",
    }),

    // Address Information
    streetAddress: z.string().min(2, {
      message: "Street address is required.",
    }),
    city: z.string().min(2, {
      message: "City is required.",
    }),
    state: z.string().min(2, {
      message: "Please select your state.",
    }),
    postalCode: z.string().optional(),
    country: z.string().default("Nigeria"),
    geopoliticalZone: z.enum(["North Central", "North East", "North West", "South East", "South South", "South West"], {
      required_error: "Please select your geopolitical zone.",
    }),

    // Identification
    identificationType: z.enum(["NIN", "Voter Card", "International Passport"], {
      required_error: "Please select an identification type.",
    }),
    identificationNumber: z.string().min(1, {
      message: "Identification number is required.",
    }),

    // Education and Farming
    educationLevel: z.enum(["none", "primary", "secondary", "tertiary"], {
      required_error: "Please select your education level.",
    }),
    farmingExperience: z.coerce.number().int().min(0),
    isCoopMember: z.enum(["yes", "no"], {
      required_error: "Please indicate if you belong to a co-op.",
    }),
    otherSourcesOfIncome: z.string().optional(),

    // Account Security
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Function to format phone number with Nigeria's country code
function formatNigerianPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, "")

  // If it already starts with 234, just add the plus
  if (digitsOnly.startsWith("234")) {
    return `+${digitsOnly}`
  }

  // If it starts with 0, remove the 0 and add +234
  if (digitsOnly.startsWith("0")) {
    return `+234${digitsOnly.substring(1)}`
  }

  // If it doesn't start with 0 or 234, assume it's a local number and add +234
  return `+234${digitsOnly}`
}

export function FarmerForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  const form = useForm<z.infer<typeof farmerFormSchema>>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      fullName: "",
      gender: "male",
      age: 18,
      dateOfBirth: "",
      email: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nigeria",
      geopoliticalZone: "North Central",
      identificationType: "NIN",
      identificationNumber: "",
      educationLevel: "secondary",
      farmingExperience: 0,
      isCoopMember: "no",
      otherSourcesOfIncome: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Add this to validate fields as they change
  })

  // Calculate age whenever date of birth changes
  useEffect(() => {
    const dob = form.getValues("dateOfBirth")
    if (dob) {
      const birthDate = new Date(dob)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      form.setValue("age", age)
    }
  }, [form.watch("dateOfBirth"), form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError(null)

    if (!file) {
      setIdDocument(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must be less than 5MB")
      setIdDocument(null)
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setFileError("File must be JPEG, PNG, or PDF")
      setIdDocument(null)
      return
    }

    setIdDocument(file)
  }

  const nextStep = () => {
    // Save current form values
    const currentValues = form.getValues()

    // Move to next step without validation
    setCurrentStep((prev) => prev + 1)

    // Ensure form values are preserved after step change
    setTimeout(() => {
      form.reset(currentValues)
    }, 0)

    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    // Save current form values
    const currentValues = form.getValues()

    // Move to previous step
    setCurrentStep((prev) => prev - 1)

    // Ensure form values are preserved after step change
    setTimeout(() => {
      form.reset(currentValues)
    }, 0)

    window.scrollTo(0, 0)
  }

  async function onSubmit(values: z.infer<typeof farmerFormSchema>) {
    // Clear any previous errors
    setFormError(null)

    // Make document upload compulsory
    if (!idDocument) {
      setFileError("Please upload a valid ID or NIN document")
      return
    }

    setIsLoading(true)

    try {
      // Format the phone number
      const formattedPhone = formatNigerianPhoneNumber(values.phone)

      console.log("Submitting farmer registration form with values:", {
        ...values,
        phone: formattedPhone,
        hasDocument: !!idDocument,
        otherSourcesOfIncome: values.otherSourcesOfIncome,
      })

      // Use the server action to register the farmer
      const result = await registerFarmer({
        ...values,
        phone: formattedPhone,
        idDocument: idDocument,
      })

      console.log("Registration result:", result)

      // If we get here, it means the redirect didn't happen, which indicates an error
      if (!result.success) {
        setFormError(result.error || "Failed to register")
        throw new Error(result.error || "Failed to register")
      }

      // Show confirmation dialog instead of redirecting
      setShowConfirmation(true)
      form.reset()
      setIdDocument(null)
    } catch (error) {
      console.error("Error during registration:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  // Geopolitical zones mapping
  const geopoliticalZones = ["North Central", "North East", "North West", "South East", "South South", "South West"]

  // Update geopolitical zone when state changes
  useEffect(() => {
    const state = form.getValues("state")
    if (state && stateToZoneMapping[state]) {
      form.setValue("geopoliticalZone", stateToZoneMapping[state])
    }
  }, [form.watch("state"), form])

  const renderStepIndicator = () => {
    return (
      <div className="mb-8 overflow-x-auto">
        <div className="relative min-w-[500px] md:min-w-0">
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-muted">
            <div
              className="h-1 bg-green-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
          <div className="relative flex justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  currentStep >= 1 ? "border-green-600 bg-green-600 text-white" : "border-muted bg-background"
                }`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span className="mt-2 text-xs whitespace-nowrap">Personal Info</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  currentStep >= 2 ? "border-green-600 bg-green-600 text-white" : "border-muted bg-background"
                }`}
              >
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span className="mt-2 text-xs whitespace-nowrap">Farm & ID</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  currentStep >= 3 ? "border-green-600 bg-green-600 text-white" : "border-muted bg-background"
                }`}
              >
                {currentStep > 3 ? "✓" : "3"}
              </div>
              <span className="mt-2 text-xs whitespace-nowrap">Farming Details</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  currentStep >= 4 ? "border-green-600 bg-green-600 text-white" : "border-muted bg-background"
                }`}
              >
                {currentStep > 4 ? "✓" : "4"}
              </div>
              <span className="mt-2 text-xs whitespace-nowrap">Security</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStep1 = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Personal Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    required
                    {...field}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                    onChange={(e) => {
                      field.onChange(e)
                      // Calculate age immediately when date changes
                      const dob = e.target.value
                      if (dob) {
                        const birthDate = new Date(dob)
                        const today = new Date()
                        let age = today.getFullYear() - birthDate.getFullYear()
                        const monthDiff = today.getMonth() - birthDate.getMonth()
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--
                        }
                        form.setValue("age", age)
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="johndoe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="080XXXXXXXX or +234XXXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Enter with or without country code. We'll format it as +234XXXXXXXXX
              </p>
            </FormItem>
          )}
        />

        <h2 className="text-xl font-semibold pt-4">Address Information</h2>

        <FormField
          control={form.control}
          name="streetAddress"
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

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
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
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Update geopolitical zone when state changes
                    if (stateToZoneMapping[value]) {
                      form.setValue("geopoliticalZone", stateToZoneMapping[value])
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Postal Code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="geopoliticalZone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geopolitical Zone (Auto-assigned)</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="opacity-75 cursor-not-allowed" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    )
  }

  const renderStep2 = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Identification</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="identificationType"
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
            control={form.control}
            name="identificationNumber"
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

        <div className="space-y-2">
          <Label htmlFor="idDocument">Upload Valid ID Document (Required)</Label>
          <Input
            id="idDocument"
            type="file"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/jpg,application/pdf"
          />
          {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}
          <p className="text-sm text-muted-foreground">
            Upload a valid government-issued ID document that matches your selected ID type. Max size: 5MB. Formats:
            JPEG, PNG, PDF.
          </p>
        </div>

        <h2 className="text-xl font-semibold pt-4">Education</h2>

        <FormField
          control={form.control}
          name="educationLevel"
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
      </div>
    )
  }

  const renderStep3 = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Farming Information</h2>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="farmingExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Farming Experience</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isCoopMember"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Are you a member of a cooperative?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="otherSourcesOfIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Sources of Income (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="Trading, Civil Service, Artisan, etc." {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">List any other ways you earn income, separated by commas</p>
            </FormItem>
          )}
        />
      </div>
    )
  }

  const renderStep4 = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Account Security</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      default:
        return null
    }
  }

  const renderStepButtons = () => {
    return (
      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
        <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          {currentStep > 1 && (
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
            onClick={() => {
              // Save functionality would go here
              toast({
                title: "Progress Saved",
                description: "Your registration progress has been saved. You can continue later.",
              })
            }}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Save & Continue Later
          </Button>
        </div>
        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
          >
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Registration"
            )}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Farmer Registration</h1>
        <p className="text-muted-foreground mt-2">
          Create your farmer account to access loans and build your credit profile
        </p>
      </div>

      {formError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {renderStepIndicator()}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {renderCurrentStep()}
          {renderStepButtons()}
        </form>
      </Form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Application Received
            </DialogTitle>
            <DialogDescription>
              Thank you for registering with FarmCredit. Your application is now pending review by our admin team.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You will receive an email notification once your account has been approved. This process typically takes
              1-2 business days.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              After approval, you'll be able to log in and access all platform features.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/about-us">Learn About Us</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
