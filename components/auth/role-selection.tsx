"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, Tractor, Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<"farmer" | "lender" | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/auth/signup/${selectedRole}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">Select the account type that best describes you to get started</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className={`cursor-pointer border-2 transition-all ${
            selectedRole === "farmer" ? "border-primary" : "border-border hover:border-primary/50"
          }`}
          onClick={() => setSelectedRole("farmer")}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Tractor className="h-8 w-8 text-primary" />
              {selectedRole === "farmer" && <Check className="h-5 w-5 text-primary" />}
            </div>
            <CardTitle className="text-xl">Farmer</CardTitle>
            <CardDescription>I am a farmer looking for financial support</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                <span>Access to agricultural loans</span>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                <span>Build your credit profile</span>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                <span>Educational resources</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/auth/signup/farmer" className="w-full">
              <Button variant="outline" className="w-full">
                Select Farmer
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card
          className={`cursor-pointer border-2 transition-all ${
            selectedRole === "lender" ? "border-primary" : "border-border hover:border-primary/50"
          }`}
          onClick={() => setSelectedRole("lender")}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Building2 className="h-8 w-8 text-primary" />
              {selectedRole === "lender" && <Check className="h-5 w-5 text-primary" />}
            </div>
            <CardTitle className="text-xl">Lender</CardTitle>
            <CardDescription>I represent an organization that provides loans</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                <span>Connect with verified farmers</span>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                <span>Manage loan applications</span>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                <span>Track repayments and performance</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/auth/signup/lender" className="w-full">
              <Button variant="outline" className="w-full">
                Select Lender
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button size="lg" onClick={handleContinue} disabled={!selectedRole} className="px-8">
          Continue as {selectedRole ? (selectedRole === "farmer" ? "Farmer" : "Lender") : "..."}
        </Button>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
