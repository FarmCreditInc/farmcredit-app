"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { InfoIcon, BadgePercent } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CreditScore {
  id: string
  farmer_id: string
  credit_score: number
  created_at: string
}

export function CreditScoreCard({ farmerId }: { farmerId: string }) {
  const [creditScore, setCreditScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchCreditScore() {
      try {
        setLoading(true)

        // Get the most recent credit score for this farmer
        const { data, error } = await supabase
          .from("credit_scores")
          .select("credit_score")
          .eq("farmer_id", farmerId)
          .order("created_at", { ascending: false })
          .limit(1)

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          setCreditScore(data[0].credit_score)
        } else {
          // No credit score found
          setCreditScore(null)
        }
      } catch (err) {
        console.error("Error fetching credit score:", err)
        setError("Failed to load credit score")
      } finally {
        setLoading(false)
      }
    }

    if (farmerId) {
      fetchCreditScore()
    }
  }, [farmerId, supabase])

  // Function to determine the rating based on the score
  function getCreditRating(score: number) {
    if (score >= 750) return { label: "Excellent", color: "text-green-600" }
    if (score >= 650) return { label: "Good", color: "text-blue-600" }
    if (score >= 550) return { label: "Fair", color: "text-yellow-600" }
    if (score >= 450) return { label: "Poor", color: "text-orange-600" }
    return { label: "Very Poor", color: "text-red-600" }
  }

  // Calculate percentage for progress bar (based on 350-850 range)
  function getPercentage(score: number) {
    const min = 350
    const max = 850
    const range = max - min
    return ((score - min) / range) * 100
  }

  const rating = creditScore ? getCreditRating(creditScore) : null
  const percentage = creditScore ? getPercentage(creditScore) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Credit Score</CardTitle>
            <CardDescription>Your current creditworthiness</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>
                  Your credit score ranges from 350 to 850. Higher scores indicate better creditworthiness and may
                  qualify you for better loan terms. Scores are calculated based on your repayment history, current
                  debt, and other financial factors.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <p>Loading credit score...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-24">
            <p className="text-red-500">{error}</p>
          </div>
        ) : creditScore === null ? (
          <div className="flex flex-col justify-center items-center h-24 space-y-2">
            <p className="text-muted-foreground">No credit score available yet</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/farmer/credit-score" className="flex items-center gap-2">
                <BadgePercent className="h-4 w-4" />
                <span>Calculate Score</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-4xl font-bold">{creditScore}</p>
                <p className={`text-sm font-medium ${rating?.color}`}>{rating?.label}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/farmer/credit-score">
                  <BadgePercent className="h-4 w-4 mr-2" />
                  Details
                </Link>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>350</span>
                <span>850</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
