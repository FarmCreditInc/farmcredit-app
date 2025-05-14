"use client"

import { useState } from "react"
import { createAdminUser } from "@/scripts/create-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function AdminSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    try {
      const result = await createAdminUser()
      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>Create or update the admin user with the default credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This will create an admin user with the following credentials:</p>
          <div className="bg-muted p-3 rounded-md mb-4">
            <p>
              <strong>Email:</strong> admin@example.com
            </p>
            <p>
              <strong>Password:</strong> admin123
            </p>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message || result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetup} disabled={isLoading} className="w-full">
            {isLoading ? "Setting up..." : "Setup Admin User"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
