"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { getPendingLoanApplications, approveLoanApplication } from "@/actions/lender-actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PendingApplication {
  id: string
  purpose_category: string
  amount_requested: number
  created_at: string
  farmer: {
    id: string
    full_name: string
    credit_score: number
    profile_image_url: string | null
  }
}

export function PendingApplicationsCard() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<PendingApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true)
      try {
        const result = await getPendingLoanApplications()
        if (result.success) {
          setApplications(result.data.slice(0, 3)) // Show only the first 3
        } else {
          toast({
            title: "Failed to load applications",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load pending applications",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [toast])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const result = await approveLoanApplication(id)
      if (result.success) {
        toast({
          title: "Loan approved",
          description: "The loan application has been approved successfully",
        })
        // Remove the approved application from the list
        setApplications((prev) => prev.filter((app) => app.id !== id))
      } else {
        if (result.requiredAmount) {
          toast({
            title: "Insufficient funds",
            description: `You need ${formatCurrency(result.requiredAmount)} in your wallet to approve this loan`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Approval failed",
            description: result.error,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while approving the loan",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No pending applications</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/lender/applications">View All Applications</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={app.farmer.profile_image_url || undefined} alt={app.farmer.full_name} />
                <AvatarFallback>{app.farmer.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{app.farmer.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">{app.purpose_category}</p>
                <p className="text-sm font-medium">{formatCurrency(app.amount_requested)}</p>
              </div>
              <Button size="sm" onClick={() => handleApprove(app.id)} disabled={processingId === app.id}>
                {processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="text-center pt-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/lender/applications">View All</Link>
        </Button>
      </div>
    </div>
  )
}
