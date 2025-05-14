"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Loader, Search, Filter, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getApprovedLoans } from "@/actions/approved-loans-actions"
import { formatCurrency } from "@/lib/utils"

interface ApprovedLoan {
  id: string
  farmer_name: string
  amount: number
  status: string
  created_at: string
  due_date: string
}

export function ApprovedLoansClient({ initialPage = 1 }) {
  const [loans, setLoans] = useState<ApprovedLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function fetchLoans() {
      try {
        setLoading(true)
        const result = await getApprovedLoans({
          page: currentPage,
          search: searchQuery,
        })

        if (result.error) {
          setError(result.error)
          setLoans([])
        } else {
          setLoans(result.loans || [])
          setTotalPages(result.totalPages || 1)
          setError(null)
        }
      } catch (err) {
        console.error("Error fetching approved loans:", err)
        setError("Failed to load approved loans. Please try again.")
        setLoans([])
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [currentPage, searchQuery])

  useEffect(() => {
    // Update URL when page changes
    router.push(`${pathname}?page=${currentPage}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`, {
      scroll: false,
    })
  }, [currentPage, searchQuery, router, pathname])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="text-lg">{error}</p>
            <Button onClick={() => setCurrentPage(1)} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search by farmer name..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading approved loans...</span>
        </div>
      ) : loans.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No approved loans found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "Try adjusting your search criteria" : "You haven't approved any loans yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {loans.map((loan) => (
              <Card key={loan.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{loan.farmer_name}</h3>
                      <p className="text-2xl font-bold">{formatCurrency(loan.amount)}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Created: {formatDate(loan.created_at)}</span>
                        <span>•</span>
                        <span>Due: {formatDate(loan.due_date)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Badge className={getStatusColor(loan.status)}>{loan.status}</Badge>

                      <Button asChild variant="outline" className="ml-auto">
                        <a href={`/dashboard/lender/approved-loans/${loan.id}`}>
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}
    </div>
  )
}
