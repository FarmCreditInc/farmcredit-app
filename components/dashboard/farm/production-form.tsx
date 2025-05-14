"use client"

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
import { addProduction } from "@/actions/farm-actions"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  crop_plant_date: z.string().optional(),
  expected_harvest_date: z.string().min(1, "Expected harvest date is required"),
  expected_yield: z.coerce.number().positive("Expected yield must be a positive number"),
  expected_yield_unit: z.string().min(1, "Yield unit is required"),
  expected_unit_profit: z.coerce.number().nonnegative("Expected unit profit must be a non-negative number"),
  financiers: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProductionFormProps {
  farmId: string
  onSuccess?: () => void
}

export function ProductionForm({ farmId, onSuccess }: ProductionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "crop",
      type: "",
      crop_plant_date: new Date().toISOString().split("T")[0],
      expected_harvest_date: "",
      expected_yield: undefined,
      expected_yield_unit: "kg",
      expected_unit_profit: undefined,
      financiers: "",
      notes: "",
    },
  })

  const category = form.watch("category")

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const result = await addProduction({
        ...data,
        farm_id: farmId,
      })

      if (result.success) {
        toast({
          title: "Production activity added",
          description: "Your production activity has been recorded.",
        })
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error adding production activity",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding production activity:", error)
      toast({
        title: "Error adding production activity",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="crop">Crop</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder={category === "crop" ? "e.g., Maize, Rice" : "e.g., Poultry, Cattle"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {category === "crop" && (
          <FormField
            control={form.control}
            name="crop_plant_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plant Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="expected_harvest_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Harvest/Collection Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expected_yield"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Yield</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expected_yield_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yield Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="tonnes">Tonnes</SelectItem>
                    <SelectItem value="litres">Litres</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="crates">Crates</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expected_unit_profit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Unit Profit (₦)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="500" {...field} />
              </FormControl>
              <FormDescription>Expected profit per unit (e.g., ₦ per kg)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="financiers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Financiers (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Names of financiers or lenders" {...field} />
              </FormControl>
              <FormDescription>List any financiers or lenders supporting this production</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this production activity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Production Activity
          </Button>
        </div>
      </form>
    </Form>
  )
}
