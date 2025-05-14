"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { FarmCard } from "./farm-card"
import { Pagination } from "@/components/ui/pagination"
import { getFarms } from "@/actions/farm-actions"

interface FarmsListProps {
  farmerId: string
  page: number
  perPage: number
}

export function FarmsList({ farmerId, page, perPage }: FarmsListProps) {
  const [farms, setFarms] = useState<any[]>([])
  const [totalFarms, setTotalFarms] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchFarms = async () => {
    try {
      setLoading(true)
      const result = await getFarms(farmerId, page, perPage)

      if (!result.success) {
        throw new Error(result.error)
      }

      setFarms(result.data || [])
      setTotalFarms(result.total || 0)
      setError(null)
    } catch (err) {
      console.error("Error fetching farms:", err)
      setError(err instanceof Error ? err.message : "Failed to load farms")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarms()
  }, [farmerId, page, perPage])

  const handleFarmDeleted = () => {
    // Refresh the farms list
    fetchFarms()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 rounded-lg">
        <p className="text-red-600 mb-2">Error loading farms</p>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  if (farms.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg">
        <h3 className="text-lg font-medium mb-2">No farms found</h3>
        <p className="text-muted-foreground mb-4">You haven't added any farms yet.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(totalFarms / perPage)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {farms.map((farm) => (
          <FarmCard key={farm.id} farm={farm} onDelete={handleFarmDeleted} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => {
            router.push(`/dashboard/farmer/farms?page=${newPage}&per_page=${perPage}`)
          }}
        />
      )}
    </div>
  )
}
