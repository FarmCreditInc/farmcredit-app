"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { addFarm } from "@/actions/farm-actions"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(1, "Farm name is required"),
  size: z.coerce.number().positive("Size must be a positive number"),
  size_units: z.string().min(1, "Unit is required"),
  location: z.string().min(1, "Location is required"),
  start_date: z.string().min(1, "Start date is required"),
  number_of_harvests: z.coerce.number().int().nonnegative().optional(),
  photo: z.instanceof(FileList).optional(),
  uses_fertilizer: z.boolean().default(false),
  uses_machinery: z.boolean().default(false),
  uses_irrigation: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface FarmFormProps {
  onSuccess?: () => void
}

export function FarmForm({ onSuccess }: FarmFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      size: undefined,
      size_units: "hectares",
      location: "",
      start_date: new Date().toISOString().split("T")[0],
      number_of_harvests: undefined,
      uses_fertilizer: false,
      uses_machinery: false,
      uses_irrigation: false,
    },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPhotoPreview(null)
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "photo") {
          formData.append(key, value?.toString() || "")
        }
      })

      // Add photo if available
      if (data.photo && data.photo.length > 0) {
        formData.append("photo", data.photo[0])
      }

      const result = await addFarm(formData)

      if (result.success) {
        toast({
          title: "Farm added successfully",
          description: "Your farm has been added to your profile.",
        })
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error adding farm",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding farm:", error)
      toast({
        title: "Error adding farm",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farm Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Rice Farm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Size</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="5.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size_units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Units</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hectares">Hectares</SelectItem>
                      <SelectItem value="acres">Acres</SelectItem>
                      <SelectItem value="square_meters">Square Meters</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Textarea placeholder="Farm address or location description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number_of_harvests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Harvests (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Farming Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="uses_fertilizer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Uses Fertilizer</FormLabel>
                    <FormDescription>Check if you use fertilizers on this farm</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uses_machinery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Uses Machinery</FormLabel>
                    <FormDescription>Check if you use agricultural machinery</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uses_irrigation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Uses Irrigation</FormLabel>
                    <FormDescription>Check if you use irrigation systems</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="photo"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Farm Photo (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    onChange(e.target.files)
                    handlePhotoChange(e)
                  }}
                  {...fieldProps}
                />
              </FormControl>
              <FormDescription>Upload a photo of your farm (max 5MB)</FormDescription>
              <FormMessage />
              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Farm preview"
                    className="h-40 w-full object-cover rounded-md max-w-full"
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Farm
          </Button>
        </div>
      </form>
    </Form>
  )
}
