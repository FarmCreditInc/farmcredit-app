"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Filter, ArrowUpDown, Info, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getApprovedLoans } from "@/actions/lender-actions"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Loan {
  id: string
  loan_amount: number
  interest_rate: number
  loan_duration_days: number
  status: string
  created_at: string
  farmer_id: string
  farmer_name: string
  farmer_email: string
  farmer_profile_url?: string
  purpose: string
  disbursed_at: string | null
  total_repaid: number
  total_expected: number
  outstanding_balance: number
  next_payment_date: string | null
  next_payment_amount: number | null
  repayment_progress: number
  amount_disbursed: number
}

export function ApprovedLoansList() {
  const router = useRouter()
  const { toast } = useToast()
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Loan; direction: "asc" | "desc" } | null>(null)

  useEffect(() => {
    const fetchLoans = async () => {
      setIsLoading(true)
      try {
        const result = await getApprovedLoans()
        if (result.success) {
          console.log("Fetched loans:", result.data)
          setLoans(result.data)
        } else {
          toast({
            title: "Failed to load loans",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching loans:", error)
        toast({
          title: "Error",
          description: "Failed to load approved loans",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoans()
  }, [toast])

  const handleSort = (key: keyof Loan) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedLoans = [...loans].sort((a, b) => {
    if (!sortConfig) return 0

    const { key, direction } = sortConfig

    // Handle different types of values
    if (typeof a[key] === "string" && typeof b[key] === "string") {
      return direction === "asc"
        ? (a[key] as string).localeCompare(b[key] as string)
        : (b[key] as string).localeCompare(a[key] as string)
    }

    // For numbers and dates
    const aValue = a[key] || 0
    const bValue = b[key] || 0

    return direction === "asc" ? (aValue < bValue ? -1 : 1) : bValue < aValue ? -1 : 1
  })

  const filteredLoans = sortedLoans.filter((loan) => {
    // Apply status filter
    if (statusFilter && loan.status !== statusFilter) {
      return false
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        loan.farmer_name?.toLowerCase().includes(searchLower) ||
        loan.farmer_email?.toLowerCase().includes(searchLower) ||
        loan.purpose?.toLowerCase().includes(searchLower) ||
        loan.id?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  const calculateProgress = (loan: Loan) => {
    const progress = loan.total_repaid ? Math.min(100, Math.round((loan.total_repaid / loan.total_expected) * 100)) : 0
    return progress
  }

  const handleViewLoan = (loanId: string) => {
    console.log("Navigating to loan details:", loanId)
    router.push(`/dashboard/lender/loans/${loanId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No approved loans found</p>
          <p className="text-sm text-muted-foreground text-center mt-2">Approved loans will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Approved Loans</CardTitle>
            <CardDescription>Manage your approved and active loans</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto order-1 sm:order-none">
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-[180px] md:w-[220px]"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("defaulted")}>Defaulted</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort("farmer_name")}>
                    Farmer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort("loan_amount")}>
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort("status")}>
                    Disbursed
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort("next_payment_date")}>
                    Next Payment
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort("status")}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => {
                const progressPercent = calculateProgress(loan)

                return (
                  <TableRow
                    key={loan.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewLoan(loan.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={loan.farmer_profile_url || "/placeholder.svg"} alt={loan.farmer_name} />
                          <AvatarFallback>
                            {loan.farmer_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{loan.farmer_name}</div>
                          <div className="text-xs text-muted-foreground">{loan.farmer_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{formatCurrency(loan.loan_amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {(loan.interest_rate * 100).toFixed(1)}% / {loan.loan_duration_days} days
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Progress value={progressPercent} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(loan.total_repaid)} of {formatCurrency(loan.total_expected)} (
                          {progressPercent}%)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {loan.status === "active" ? (
                        <Badge variant="success">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {loan.next_payment_date ? (
                        <div>
                          <div>{formatDate(loan.next_payment_date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(loan.next_payment_amount || 0)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          {loan.status === "completed" ? "Fully Paid" : "No payments scheduled"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          loan.status === "active"
                            ? "default"
                            : loan.status === "completed"
                              ? "success"
                              : loan.status === "defaulted"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewLoan(loan.id)
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
