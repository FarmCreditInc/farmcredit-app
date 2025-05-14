"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { login } from "@/actions/auth-actions"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

interface LoginFormProps {
  role: "admin" | "farmer" | "lender"
}

export function LoginForm({ role }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      // Create a FormData object to pass to the login function
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)
      formData.append("role", role)

      const result = await login(formData)

      if (result.success) {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        })

        // Show redirecting message
        setIsRedirecting(true)

        // IMPORTANT: Use hard navigation instead of Next.js router to ensure a full page reload
        // This ensures the cookie is properly set before the middleware runs
        window.location.href = result.redirectUrl || `/dashboard/${role}`
      } else {
        setError(result.error || "An error occurred during login")

        if (result.error === "Invalid credentials") {
          toast({
            title: "Invalid credentials",
            description: "The email or password you entered is incorrect.",
            variant: "destructive",
          })
        } else if (result.error?.includes("User doesn't exist")) {
          toast({
            title: "User not found",
            description: `No ${role} account found with this email address.`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Login failed",
            description: result.error || "An error occurred during login",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (!isRedirecting) {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isRedirecting}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              disabled={isLoading || isRedirecting}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          {error && !isRedirecting && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isRedirecting && (
            <Alert>
              <AlertDescription className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading || isRedirecting}>
            {isLoading && !isRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRedirecting ? "Redirecting..." : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </Button>
        </div>
      </form>

      <div className="space-y-2 text-center text-sm">
        <p>
          <Link href="/auth/login" className="text-primary hover:underline">
            Back to role selection
          </Link>
        </p>
        <p>
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
