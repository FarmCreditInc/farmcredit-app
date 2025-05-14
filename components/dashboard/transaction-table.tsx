"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: number
  purpose: string | null
  reference: string | null
  running_balance: number | null
  status: string
  created_at: string
}

interface TransactionTableProps {
  transactions: Transaction[]
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = transactions.slice(startIndex, endIndex)

  const getTypeColor = (type: string) => {
    switch (type) {
      case "credit":
      case "loan_repayment":
        return "bg-green-100 text-green-800"
      case "withdrawal":
        return "bg-orange-100 text-orange-800"
      case "loan_funding":
        return "bg-blue-100 text-blue-800"
      case "fee":
        return "bg-purple-100 text-purple-800"
      case "debit":
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

  const formatType = (type: string) => {
    switch (type) {
      case "credit":
        return "Credit"
      case "withdrawal":
        return "Withdrawal"
      case "loan_funding":
        return "Loan Funding"
      case "loan_repayment":
        return "Loan Repayment"
      case "fee":
        return "Platform Fee"
      case "debit":
        return "Debit"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const isPositiveTransaction = (type: string) => {
    return type === "credit" || type === "loan_repayment"
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
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.length > 0 ? (
                    currentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{formatDate(transaction.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(transaction.type)}>
                            {formatType(transaction.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.purpose || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <span className={isPositiveTransaction(transaction.type) ? "text-green-600" : "text-red-600"}>
                            {isPositiveTransaction(transaction.type) ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.running_balance !== null ? formatCurrency(transaction.running_balance) : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No transactions found.
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
    </div>
  )
}
