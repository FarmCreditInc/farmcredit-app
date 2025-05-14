"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createStorageBuckets } from "@/scripts/create-storage-buckets"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SetupStoragePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null)

  const handleSetupStorage = async () => {
    setIsLoading(true)
    try {
      const result = await createStorageBuckets()

      if (result.success) {
        setResult({ success: true, message: "Storage buckets created successfully!" })
        toast({
          title: "Success",
          description: "Storage buckets created successfully!",
          variant: "default",
        })
      } else {
        setResult({ success: false, message: result.error || "Failed to create storage buckets" })
        toast({
          title: "Error",
          description: result.error || "Failed to create storage buckets",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting up storage:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Setup Storage Buckets</CardTitle>
          <CardDescription>Create the necessary storage buckets for farmer and lender documents</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will create two storage buckets in your Supabase project:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>farmer-docs</strong> - For storing farmer ID documents
            </li>
            <li>
              <strong>lenders-docs</strong> - For storing lender verification documents
            </li>
          </ul>

          {result && (
            <div
              className={`mt-4 p-3 rounded-md ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {result.message}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetupStorage} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up storage...
              </>
            ) : (
              "Setup Storage Buckets"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
