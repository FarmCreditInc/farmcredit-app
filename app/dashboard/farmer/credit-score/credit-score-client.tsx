"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { calculateCreditScore } from "@/actions/credit-score-actions"
import { Loader2, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Info } from "lucide-react"
import { format } from "date-fns"

interface CreditScoreClientProps {
  farmer: any
  creditScores: any[]
}

export function CreditScoreClient({ farmer, creditScores }: CreditScoreClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    creditScore?: number
    creditRating?: string
  }>({})

  const handleCalculate = async () => {
    setIsOpen(true)
    setIsCalculating(true)
    setResult({})

    try {
      const response = await calculateCreditScore(farmer.id)
      setResult(response)
    } catch (error) {
      console.error("Error calculating credit score:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  // Get the most recent credit score
  const latestScore = creditScores.length > 0 ? creditScores[0] : null

  // Credit score range is 350-850
  const minScore = 350
  const maxScore = 850
  const range = maxScore - minScore

  // Calculate progress percentage for the latest score
  const progressPercentage = latestScore
    ? Math.max(0, Math.min(100, ((latestScore.credit_score - minScore) / range) * 100))
    : 0

  // Determine credit score rating and color
  const getCreditRating = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "text-green-600", bgColor: "bg-green-100" }
    if (score >= 650) return { label: "Good", color: "text-blue-600", bgColor: "bg-blue-100" }
    if (score >= 550) return { label: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    if (score >= 450) return { label: "Poor", color: "text-orange-600", bgColor: "bg-orange-100" }
    return { label: "Very Poor", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const rating = latestScore ? getCreditRating(latestScore.credit_score) : null

  // Calculate score change from previous
  const previousScore = creditScores.length > 1 ? creditScores[1] : null
  const scoreChange = latestScore && previousScore ? latestScore.credit_score - previousScore.credit_score : 0

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Credit Score</CardTitle>
            <CardDescription>
              Your credit score determines your eligibility for loans and the interest rates you receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                {latestScore ? (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative">
                        <svg className="w-40 h-40" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-green-500"
                            strokeWidth="8"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (progressPercentage / 100) * 251.2}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold">{latestScore.credit_score}</span>
                          <span className={`text-sm font-medium ${rating?.color}`}>{rating?.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">350</span>
                      <span className="text-sm text-muted-foreground">850</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 mt-1" />

                    <div className="flex items-center justify-center mt-4">
                      {scoreChange > 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+{scoreChange} since last calculation</span>
                        </div>
                      ) : scoreChange < 0 ? (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span>{scoreChange} since last calculation</span>
                        </div>
                      ) : creditScores.length > 1 ? (
                        <div className="flex items-center text-muted-foreground">
                          <Info className="h-4 w-4 mr-1" />
                          <span>No change since last calculation</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      Last updated: {format(new Date(latestScore.created_at), "PPP")}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-center mb-4">
                      <p className="text-lg font-medium">No credit score available</p>
                      <p className="text-sm text-muted-foreground">
                        Calculate your credit score to see your creditworthiness
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">What affects your credit score?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 text-xs">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Loan repayment history</p>
                        <p className="text-sm text-muted-foreground">Timely repayments improve your score</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 text-xs">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Farm productivity</p>
                        <p className="text-sm text-muted-foreground">Higher yields and profits boost your score</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 text-xs">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Financial stability</p>
                        <p className="text-sm text-muted-foreground">Consistent income and savings matter</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 text-xs">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Personal information</p>
                        <p className="text-sm text-muted-foreground">Education, experience, and location</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <Button onClick={handleCalculate} className="w-full">
                  Calculate Credit Score
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Score Benefits</CardTitle>
            <CardDescription>How a good credit score helps you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <div className="mr-3 mt-1 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Lower Interest Rates</h4>
                <p className="text-sm text-muted-foreground">
                  Farmers with higher credit scores qualify for loans with lower interest rates, saving money over time.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 mt-1 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Higher Approval Chances</h4>
                <p className="text-sm text-muted-foreground">
                  A good credit score increases your chances of loan approval when you need financing.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 mt-1 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Higher Loan Amounts</h4>
                <p className="text-sm text-muted-foreground">
                  Lenders are willing to provide larger loans to farmers with excellent credit scores.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improve Your Score</CardTitle>
            <CardDescription>Steps to boost your creditworthiness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <div className="mr-3 mt-1 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Make Timely Repayments</h4>
                <p className="text-sm text-muted-foreground">
                  Always pay your loans on time to build a positive repayment history.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 mt-1 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Update Farm Production Data</h4>
                <p className="text-sm text-muted-foreground">
                  Regularly update your farm's production data to show consistent yields.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 mt-1 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Complete Your Profile</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure all your personal and farm information is complete and up-to-date.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 mt-1 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-600">4</span>
              </div>
              <div>
                <h4 className="font-medium">Diversify Income Sources</h4>
                <p className="text-sm text-muted-foreground">
                  Having multiple income sources improves your financial stability rating.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {creditScores.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Credit Score History</CardTitle>
            <CardDescription>Track how your credit score has changed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Rating</th>
                    <th className="text-left py-3 px-4">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {creditScores.map((score, index) => {
                    const prevScore = index < creditScores.length - 1 ? creditScores[index + 1] : null
                    const change = prevScore ? score.credit_score - prevScore.credit_score : 0
                    const rating = getCreditRating(score.credit_score)

                    return (
                      <tr key={score.id} className="border-b">
                        <td className="py-3 px-4">{format(new Date(score.created_at), "PPP")}</td>
                        <td className="py-3 px-4 font-medium">{score.credit_score}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${rating.bgColor} ${rating.color}`}>
                            {rating.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {index < creditScores.length - 1 ? (
                            <div className="flex items-center">
                              {change > 0 ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                  <span className="text-green-600">+{change}</span>
                                </>
                              ) : change < 0 ? (
                                <>
                                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                  <span className="text-red-600">{change}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">No change</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Initial score</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Credit Score Calculation</DialogTitle>
            <DialogDescription>
              {isCalculating
                ? "Calculating your credit score..."
                : result.success
                  ? "Credit score calculated successfully!"
                  : "There was an issue calculating your credit score."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4">
            {isCalculating ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Calculating credit score, please wait...</p>
              </div>
            ) : result.success ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-lg font-semibold">Your credit score: {result.creditScore}</p>
                  <p className="text-sm text-muted-foreground">Rating: {result.creditRating}</p>
                </div>
                <p className="text-sm">{result.message}</p>
                <p className="text-xs text-muted-foreground mt-2">Refresh the page to see your updated credit score.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="text-sm whitespace-pre-wrap break-words max-w-full">
                  {result.message || "Failed to calculate credit score"}
                </p>
                <Button onClick={handleCalculate} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
