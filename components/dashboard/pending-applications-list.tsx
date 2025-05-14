"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PendingApplicationsListProps {
  applications?: any[]
  onApplicationUpdated?: () => void
}

export function PendingApplicationsList({ applications = [], onApplicationUpdated }: PendingApplicationsListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [localApplications, setLocalApplications] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Changed to 10 items per page

  // If applications are provided as props, use them
  // Otherwise, fetch them from the API
  useEffect(() => {
    if (applications && applications.length > 0) {
      console.log("Using provided applications:", applications)
      // Sort applications by credit score (highest first)
      const sortedApplications = [...applications].sort((a, b) => {
        const scoreA = a.farmer?.credit_score || 0
        const scoreB = b.farmer?.credit_score || 0
        return scoreB - scoreA
      })
      setLocalApplications(sortedApplications)
      return
    }

    // If no applications provided, fetch them
    const fetchApplications = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/lender/pending-applications")
        if (!response.ok) {
          throw new Error(`Failed to fetch applications: ${response.status}`)
        }
        const data = await response.json()
        console.log("Fetched applications:", data)
        if (data.success && data.data) {
          // Sort applications by credit score (highest first)
          const sortedApplications = [...data.data].sort((a, b) => {
            const scoreA = a.farmer?.credit_score || 0
            const scoreB = b.farmer?.credit_score || 0
            return scoreB - scoreA
          })
          setLocalApplications(sortedApplications)
        } else {
          setError(data.error || "Failed to fetch applications")
        }
      } catch (err) {
        console.error("Error fetching applications:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [applications])

  // Calculate pagination
  const totalPages = Math.ceil(localApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentApplications = localApplications.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>Loading loan applications...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>Error loading applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!localApplications || localApplications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>No pending loan applications found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            When farmers submit loan applications, they will appear here for your review.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Function to determine credit score rating
  const getCreditScoreRating = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "bg-green-100 text-green-800 border-green-200" }
    if (score >= 650) return { label: "Good", color: "bg-blue-100 text-blue-800 border-blue-200" }
    if (score >= 550) return { label: "Fair", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    if (score >= 450) return { label: "Poor", color: "bg-orange-100 text-orange-800 border-orange-200" }
    return { label: "Very Poor", color: "bg-red-100 text-red-800 border-red-200" }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Pending Applications ({localApplications.length})</h2>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentApplications.map((application) => {
          const creditScore = application.farmer?.credit_score || 0
          const creditRating = getCreditScoreRating(creditScore)

          return (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage
                        src={application.farmer?.profile_url || "/placeholder.svg?height=48&width=48&query=farmer"}
                        alt={application.farmer?.full_name || "Farmer"}
                      />
                      <AvatarFallback>
                        {application.farmer?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2) || "F"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        {application.farmer?.full_name || "Unknown Farmer"}
                      </CardTitle>
                      <CardDescription>Applied on {format(new Date(application.created_at), "PPP")}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 self-start sm:self-auto">
                      Pending
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Credit Score:</span>
                      <Badge className={creditRating.color}>
                        {creditScore} - {creditRating.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">{formatCurrency(application.amount_requested || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purpose</p>
                    <p className="font-medium capitalize">{application.purpose_category || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{application.interest_rate || 0}%</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/dashboard/lender/applications/${application.id}`} className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
