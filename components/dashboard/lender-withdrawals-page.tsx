"use client"

import { useState, useEffect } from "react"
import { getWithdrawalHistory } from "@/actions/lender-actions"
import { WithdrawalHistoryTable } from "@/components/dashboard/withdrawal-history-table"
import { Loader2 } from "lucide-react"

export function LenderWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setIsLoading(true)
        const { success, data, error } = await getWithdrawalHistory()

        if (success && data) {
          setWithdrawals(data)
        } else {
          setError(error || "Failed to load withdrawal history")
        }
      } catch (err) {
        console.error("Error fetching withdrawal history:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWithdrawals()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      {error ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Error loading withdrawal history: {error}</p>
        </div>
      ) : (
        <WithdrawalHistoryTable withdrawals={withdrawals} />
      )}
    </>
  )
}
