"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react"
import { WithdrawalStatusInfo } from "@/components/dashboard/withdrawal-status-info"

interface Withdrawal {
  id: string
  amount: number
  bank_name: string
  account_number: string
  account_name: string
  status: string
  created_at: string
  transaction?: {
    created_at: string
  }
}

interface WithdrawalHistoryTableProps {
  withdrawals: Withdrawal[]
}

export function WithdrawalHistoryTable({ withdrawals }: WithdrawalHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(withdrawals.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentWithdrawals = withdrawals.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="relative">
              {/* Mobile scroll indicator */}
              <div className="md:hidden absolute right-4 top-4 flex items-center text-sm text-muted-foreground">
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                <span>Scroll to see more</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentWithdrawals.length > 0 ? (
                    currentWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-medium">
                          {formatDate(withdrawal.transaction?.created_at || withdrawal.created_at)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(withdrawal.amount)}</TableCell>
                        <TableCell>{withdrawal.bank_name}</TableCell>
                        <TableCell>
                          {withdrawal.account_number} ({withdrawal.account_name})
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(withdrawal.status)}>
                            {formatStatus(withdrawal.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No withdrawals found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-2 py-1 text-sm rounded border disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-2 py-1 text-sm rounded border disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      <WithdrawalStatusInfo />
    </div>
  )
}
