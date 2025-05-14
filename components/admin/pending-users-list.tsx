"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { approveUser, rejectUser } from "@/actions/auth"

interface PendingUser {
  id: string
  role: string
  full_name?: string
  organization_name?: string
  email: string
  created_at: string
  id_document_url?: string
  verification_document_url?: string
}

interface PendingUsersListProps {
  pendingUsers: PendingUser[]
}

export function PendingUsersList({ pendingUsers }: PendingUsersListProps) {
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleViewUser = (user: PendingUser) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleAction = (user: PendingUser, action: "approve" | "reject") => {
    setSelectedUser(user)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const processAction = async () => {
    if (!selectedUser || !actionType) return

    setIsProcessing(true)

    try {
      const result = actionType === "approve" ? await approveUser(selectedUser.id) : await rejectUser(selectedUser.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description:
            actionType === "approve" ? "User has been approved and account created." : "User has been rejected.",
        })
        setActionDialogOpen(false)
        // Refresh the page to update the list
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending User Applications</CardTitle>
          <CardDescription>Review and approve or reject user registration applications</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending applications</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || user.organization_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "farmer"
                            ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-950/30"
                        }
                      >
                        {user.role === "farmer" ? "Farmer" : "Lender"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/30"
                          onClick={() => handleAction(user, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/30"
                          onClick={() => handleAction(user, "reject")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Application Details</DialogTitle>
            <DialogDescription>Review the user's registration information</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-medium capitalize">{selectedUser.role}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Date Applied:</span>
                      <span className="font-medium">{formatDate(selectedUser.created_at)}</span>
                    </div>
                  </div>
                </div>

                {selectedUser.role === "farmer" ? (
                  <div>
                    <h3 className="text-lg font-medium">Farmer Details</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Full Name:</span>
                        <span className="font-medium">{selectedUser.full_name}</span>
                      </div>
                      {/* Add more farmer-specific fields here */}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium">Lender Details</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Organization:</span>
                        <span className="font-medium">{selectedUser.organization_name}</span>
                      </div>
                      {/* Add more lender-specific fields here */}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium">Verification Document</h3>
                <div className="mt-2">
                  {selectedUser.role === "farmer" && selectedUser.id_document_url ? (
                    <div className="mt-2">
                      <Link
                        href={selectedUser.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        View ID Document
                      </Link>
                    </div>
                  ) : selectedUser.role === "lender" && selectedUser.verification_document_url ? (
                    <div className="mt-2">
                      <Link
                        href={selectedUser.verification_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        View Verification Document
                      </Link>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No document uploaded</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setViewDialogOpen(false)
                if (selectedUser) {
                  handleAction(selectedUser, "approve")
                }
              }}
            >
              Approve User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve User" : "Reject User"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will create an account for the user and send them an approval email."
                : "This will reject the user's application and send them a rejection email."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p>
              Are you sure you want to{" "}
              <span className="font-medium">{actionType === "approve" ? "approve" : "reject"}</span> the application for{" "}
              <span className="font-medium">{selectedUser?.full_name || selectedUser?.organization_name}</span>?
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              onClick={processAction}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
