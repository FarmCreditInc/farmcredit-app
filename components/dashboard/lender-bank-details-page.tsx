"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Loader2, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Bank details form schema
const bankDetailsFormSchema = z.object({
  bank_name: z.string().min(2, "Bank name is required"),
  bank_account_name: z.string().min(2, "Account name is required"),
  bank_account_number: z.string().min(10, "Account number must be at least 10 digits"),
})

type BankDetailsFormValues = z.infer<typeof bankDetailsFormSchema>

type BankAccount = {
  id: string
  bank_name: string
  bank_account_name: string
  bank_account_number: string
  created_at: string
}

interface LenderBankDetailsPageProps {
  userId: string
}

export function LenderBankDetailsPage({ userId }: LenderBankDetailsPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [initialError, setInitialError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<BankAccount | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Bank details form for adding new accounts
  const addForm = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsFormSchema),
    defaultValues: {
      bank_name: "",
      bank_account_name: "",
      bank_account_number: "",
    },
  })

  // Bank details form for editing existing accounts
  const editForm = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsFormSchema),
    defaultValues: {
      bank_name: "",
      bank_account_name: "",
      bank_account_number: "",
    },
  })

  // Fetch user data and bank accounts on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingData(true)

        // Fetch user data
        const userResponse = await fetch(`/api/lenders/${userId}`)
        if (!userResponse.ok) {
          const errorData = await userResponse.json()
          throw new Error(errorData.error || "Failed to fetch user data")
        }

        const userData = await userResponse.json()
        setUserEmail(userData.email || null)

        // Fetch bank accounts
        await fetchBankAccounts(userId)
      } catch (error) {
        console.error("Error in fetchUserData:", error)
        setInitialError(error.message || "Failed to load user data. Please try refreshing the page.")
        toast({
          title: "Error",
          description: error.message || "Failed to load user data. Please try refreshing the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId, toast])

  // Fetch bank accounts for the lender
  const fetchBankAccounts = async (lenderId: string) => {
    try {
      const response = await fetch(`/api/lender/bank-accounts?lenderId=${lenderId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bank accounts")
      }

      setBankAccounts(data.accounts || [])
    } catch (error) {
      console.error("Error fetching bank accounts:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch bank accounts. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle adding a new bank account
  const onAddBankAccount = async (data: BankDetailsFormValues) => {
    setIsLoading(true)

    try {
      if (!userId) {
        throw new Error("User ID not found. Please try logging in again.")
      }

      const response = await fetch("/api/lender/add-bank-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderId: userId,
          bankDetails: data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add bank account")
      }

      toast({
        title: "Success",
        description: "Bank account added successfully",
      })

      // Reset form and close dialog
      addForm.reset()
      setIsAddDialogOpen(false)

      // Refresh bank accounts list
      await fetchBankAccounts(userId)
    } catch (error) {
      console.error("Error adding bank account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add bank account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle editing an existing bank account
  const onEditBankAccount = async (data: BankDetailsFormValues) => {
    setIsLoading(true)

    try {
      if (!userId || !currentAccount) {
        throw new Error("Required information missing. Please try again.")
      }

      const response = await fetch("/api/lender/update-bank-account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderId: userId,
          accountId: currentAccount.id,
          bankDetails: data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update bank account")
      }

      toast({
        title: "Success",
        description: "Bank account updated successfully",
      })

      // Reset form and close dialog
      editForm.reset()
      setIsEditDialogOpen(false)
      setCurrentAccount(null)

      // Refresh bank accounts list
      await fetchBankAccounts(userId)
    } catch (error) {
      console.error("Error updating bank account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update bank account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle deleting a bank account
  const onDeleteBankAccount = async () => {
    setIsDeleting(true)

    try {
      if (!userId || !deleteId) {
        throw new Error("Required information missing. Please try again.")
      }

      const response = await fetch("/api/lender/delete-bank-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderId: userId,
          accountId: deleteId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete bank account")
      }

      toast({
        title: "Success",
        description: "Bank account deleted successfully",
      })

      // Close dialog and reset state
      setIsDeleteDialogOpen(false)
      setDeleteId(null)

      // Refresh bank accounts list
      await fetchBankAccounts(userId)
    } catch (error) {
      console.error("Error deleting bank account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete bank account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Open edit dialog with account data
  const handleEditClick = (account: BankAccount) => {
    setCurrentAccount(account)
    editForm.reset({
      bank_name: account.bank_name,
      bank_account_name: account.bank_account_name,
      bank_account_number: account.bank_account_number,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete confirmation dialog
  const handleDeleteClick = (accountId: string) => {
    setDeleteId(accountId)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 sm:h-9 sm:w-9">
            <Link href="/dashboard/lender">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Bank Accounts</h1>
            <p className="text-sm text-muted-foreground">Manage your bank accounts for withdrawals</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
              <DialogDescription>
                Add a new bank account for withdrawals. You can add multiple accounts.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddBankAccount)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., First Bank, GTBank, UBA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="bank_account_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Account holder's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Account"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingData ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : initialError ? (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {initialError}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/auth/login")}>
                Return to Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Bank Accounts</CardTitle>
              <CardDescription>
                Manage your bank accounts for withdrawals. You can add multiple accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bankAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No Bank Accounts</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    You haven't added any bank accounts yet. Add a bank account to receive withdrawals.
                  </p>
                  <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bank Account
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]">Bank Name</TableHead>
                        <TableHead className="w-[30%]">Account Name</TableHead>
                        <TableHead className="w-[25%]">Account Number</TableHead>
                        <TableHead className="text-right w-[15%]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.bank_name}</TableCell>
                          <TableCell className="break-words">{account.bank_account_name}</TableCell>
                          <TableCell>{account.bank_account_number}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(account)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(account.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why We Need Your Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Withdrawals</h3>
                <p className="text-sm text-muted-foreground">
                  Your bank details are required to process withdrawals from your wallet to your bank account.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Multiple Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  You can add multiple bank accounts to give yourself flexibility when making withdrawals.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Secure Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  We use industry-standard encryption to protect your banking information.
                </p>
              </div>

              <Alert variant="outline" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Make sure your bank account details are accurate to avoid payment issues.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Bank Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>Update your bank account details.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditBankAccount)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="bank_account_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="bank_account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Bank Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Delete Bank Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bank account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDeleteBankAccount}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
