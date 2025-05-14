"use client"

import { useRef } from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getTransactionHistory, generateTransactionStatement } from "@/actions/lender-actions"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  AlertCircle,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  wallet_id: string
  type: string
  amount: number
  purpose: string
  reference: string
  status: string
  running_balance: number
  created_at: string
}

export function TransactionHistory({ isRecent = false, limit = 5 }: { isRecent?: boolean; limit?: number }) {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
  )
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [isGeneratingStatement, setIsGeneratingStatement] = useState(false)
  const [showStatementDialog, setShowStatementDialog] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [tableWidth, setTableWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const result = await getTransactionHistory()
        if (result.success) {
          // Only take the 10 most recent transactions for the full transaction history page
          const transactionsToShow = isRecent ? result.data : result.data.slice(0, 10)
          setTransactions(transactionsToShow)
        } else {
          toast({
            title: "Failed to load transactions",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transaction history",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [toast, isRecent])

  // Update table and container widths for scroll buttons
  useEffect(() => {
    const updateWidths = () => {
      if (tableContainerRef.current) {
        const tableElement = tableContainerRef.current.querySelector("table")
        if (tableElement) {
          setTableWidth(tableElement.offsetWidth)
          setContainerWidth(tableContainerRef.current.offsetWidth)
        }
      }
    }

    updateWidths()
    window.addEventListener("resize", updateWidths)
    return () => window.removeEventListener("resize", updateWidths)
  }, [transactions])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
      case "loan_repayment":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case "debit":
      case "withdrawal":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      case "loan_funding":
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case "fee":
        return <Wallet className="h-4 w-4 text-amber-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "credit":
      case "loan_repayment":
        return "text-green-600 dark:text-green-400"
      case "debit":
      case "withdrawal":
        return "text-red-600 dark:text-red-400"
      case "loan_funding":
        return "text-blue-600 dark:text-blue-400"
      case "fee":
        return "text-amber-600 dark:text-amber-400"
      default:
        return ""
    }
  }

  const isPositiveTransaction = (type: string) => {
    return type === "credit" || type === "loan_repayment"
  }

  const filteredTransactions = transactions
    .filter((transaction) => {
      // Apply type filter
      if (filter !== "all" && transaction.type !== filter) {
        return false
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          transaction.purpose?.toLowerCase().includes(searchLower) ||
          transaction.reference?.toLowerCase().includes(searchLower) ||
          transaction.type?.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
    .slice(0, isRecent ? limit : undefined)

  const handleGenerateStatement = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Date range required",
        description: "Please select both start and end dates for your statement",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingStatement(true)
    try {
      const result = await generateTransactionStatement(startDate.toISOString(), endDate.toISOString())

      if (result.success && result.data) {
        toast({
          title: "Statement generated",
          description: `Your transaction statement has been sent to ${result.data.email}`,
        })

        setShowStatementDialog(false)
      } else {
        toast({
          title: "Failed to generate statement",
          description: result.error || "An error occurred while generating your statement",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Statement generation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate transaction statement",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingStatement(false)
    }
  }

  // Handle horizontal scrolling
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - 200)
      tableContainerRef.current.scrollLeft = newPosition
      setScrollPosition(newPosition)
    }
  }

  const scrollRight = () => {
    if (tableContainerRef.current) {
      const maxScroll = tableWidth - containerWidth
      const newPosition = Math.min(maxScroll, scrollPosition + 200)
      tableContainerRef.current.scrollLeft = newPosition
      setScrollPosition(newPosition)
    }
  }

  // Update scroll position when scrolling manually
  const handleScroll = () => {
    if (tableContainerRef.current) {
      setScrollPosition(tableContainerRef.current.scrollLeft)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No transactions found</p>
          <p className="text-sm text-muted-foreground text-center mt-2">Your transaction history will appear here</p>
        </CardContent>
      </Card>
    )
  }

  if (isRecent) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <a href="/dashboard/lender/transactions">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-2">{getTransactionIcon(transaction.type)}</div>
                  <div>
                    <p className="font-medium text-sm">{transaction.purpose || transaction.type.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                    {isPositiveTransaction(transaction.type) ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Balance: {formatCurrency(transaction.running_balance || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>A record of your most recent 10 transactions</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto order-1 sm:order-none">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[180px] md:w-[220px]"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowStatementDialog(true)} className="whitespace-nowrap">
                  Generate Statement
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilter("all")}>All Transactions</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("credit")}>Credits</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("loan_repayment")}>Loan Repayments</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("debit")}>Debits</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("loan_funding")}>Loan Funding</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("fee")}>Fees</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("withdrawal")}>Withdrawals</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile scroll buttons */}
          <div className="md:hidden flex justify-between px-4 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              disabled={scrollPosition <= 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Scroll to see more</span>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              disabled={scrollPosition >= tableWidth - containerWidth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0" ref={tableContainerRef} onScroll={handleScroll}>
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Type</TableHead>
                    <TableHead className="whitespace-nowrap">Description</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Amount</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Balance</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {transaction.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm max-w-[200px] truncate">
                        {transaction.purpose || "Transaction"}
                      </TableCell>
                      <TableCell className={`text-xs sm:text-sm whitespace-nowrap text-right font-medium`}>
                        <span className={isPositiveTransaction(transaction.type) ? "text-green-600" : "text-red-600"}>
                          {isPositiveTransaction(transaction.type) ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap text-right font-medium">
                        {formatCurrency(transaction.running_balance || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "successful"
                              ? "default"
                              : transaction.status === "pending"
                                ? "outline"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showStatementDialog} onOpenChange={setShowStatementDialog}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] w-full">
          <DialogHeader>
            <DialogTitle>Generate Statement</DialogTitle>
            <DialogDescription>Select a date range for your transaction statement.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowStatementDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleGenerateStatement} disabled={isGeneratingStatement} className="w-full sm:w-auto">
              {isGeneratingStatement ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Statement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
