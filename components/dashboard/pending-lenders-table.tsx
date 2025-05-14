"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Loader2, FileText, User, Phone, Mail, Calendar, Building } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Lender {
  id: string
  organization_name: string
  contact_person_name: string
  email: string
  phone: string
  created_at: string
  status: string

  organization_type: string
  license_number: string | null
  verification_document_url: string | null
  admin_note: string | null
  [key: string]: any // Allow for additional properties
}

interface PendingLendersTableProps {
  lenders: Lender[]
}

export function PendingLendersTable({ lenders = [] }: PendingLendersTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminNote, setAdminNote] = useState("")
  const [adminNoteError, setAdminNoteError] = useState<string | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const router = useRouter()
  const [loadingDocument, setLoadingDocument] = useState(false)
  const { toast } = useToast()

  // Reset admin note error when the note changes
  useEffect(() => {
    if (adminNote.trim()) {
      setAdminNoteError(null)
    }
  }, [adminNote])

  // Function to handle document viewing
  async function handleViewDocument(documentPath: string | null) {
    if (!documentPath) {
      toast({
        title: "No document",
        description: "No document was uploaded for this lender",
        variant: "destructive",
      })
      return
    }

    setLoadingDocument(true)

    try {
      console.log("Requesting signed URL for document:", documentPath)

      const response = await fetch("/api/admin/get-document-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: documentPath }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to retrieve document")
      }

      console.log("Successfully retrieved signed URL")

      // Open the document in a new tab
      window.open(data.url, "_blank")
    } catch (error) {
      console.error("Error retrieving document:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to retrieve document",
        variant: "destructive",
      })
    } finally {
      setLoadingDocument(false)
    }
  }

  async function handleApprove() {
    if (!selectedLender) return

    // Validate admin note
    if (!adminNote.trim()) {
      setAdminNoteError("Please provide a note before approving")
      return
    }

    try {
      setProcessingId(selectedLender.id)

      const response = await fetch("/api/admin/update-lender-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedLender.id,
          status: "approved",
          admin_note: adminNote,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to approve lender")
      }

      toast({
        title: "Success",
        description: "Lender application approved",
      })

      setIsApproveDialogOpen(false)
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error approving lender:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve lender application",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject() {
    if (!selectedLender) return

    // Validate admin note
    if (!adminNote.trim()) {
      setAdminNoteError("Please provide a reason for rejection")
      return
    }

    try {
      setProcessingId(selectedLender.id)

      const response = await fetch("/api/admin/update-lender-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedLender.id,
          status: "rejected",
          admin_note: adminNote,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to reject lender")
      }

      toast({
        title: "Success",
        description: "Lender application rejected",
      })

      setIsRejectDialogOpen(false)
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error rejecting lender:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject lender application",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleUpdateNote() {
    if (!selectedLender) return

    // Validate admin note
    if (!adminNote.trim()) {
      setAdminNoteError("Admin note cannot be empty")
      return
    }

    try {
      setProcessingId(selectedLender.id)

      const response = await fetch("/api/admin/update-lender-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedLender.id,
          admin_note: adminNote,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to update note")
      }

      toast({
        title: "Success",
        description: "Admin note updated",
      })

      // Update the selected lender with the new note
      setSelectedLender({
        ...selectedLender,
        admin_note: adminNote,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating note:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update note",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  function handleViewDetails(lender: Lender) {
    setSelectedLender(lender)
    setAdminNote(lender.admin_note || "")
    setAdminNoteError(null)
    setIsDialogOpen(true)
  }

  function openApproveDialog() {
    if (!selectedLender) return

    // Validate admin note before opening approve dialog
    if (!adminNote.trim()) {
      setAdminNoteError("Please provide a note before approving")
      return
    }

    setIsApproveDialogOpen(true)
  }

  function openRejectDialog() {
    if (!selectedLender) return

    // Validate admin note before opening reject dialog
    if (!adminNote.trim()) {
      setAdminNoteError("Please provide a reason for rejection")
      return
    }

    setIsRejectDialogOpen(true)
  }

  if (lenders.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No pending lender applications</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact Person</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lenders.map((lender) => (
              <TableRow key={lender.id}>
                <TableCell className="font-medium">{lender.contact_person_name}</TableCell>
                <TableCell>{lender.organization_name || "N/A"}</TableCell>
                <TableCell>{lender.email}</TableCell>
                <TableCell>{lender.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      lender.status === "approved"
                        ? "success"
                        : lender.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {lender.status || "pending"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(lender.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleViewDetails(lender)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Lender Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Lender Application Details</DialogTitle>
            <DialogDescription>Review the lender's application information</DialogDescription>
          </DialogHeader>

          {selectedLender && (
            <div className="px-6 pb-6 overflow-hidden">
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="flex w-full h-auto overflow-x-auto">
                  <TabsTrigger value="details" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
                    Contact Details
                  </TabsTrigger>
                  <TabsTrigger value="organization" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
                    Organization Info
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
                    Documents & Notes
                  </TabsTrigger>
                </TabsList>

                <div className="overflow-y-auto max-h-[60vh] mt-4">
                  <TabsContent value="details" className="space-y-4 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <User className="h-4 w-4 mr-2" /> Contact Person
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Name:</div>
                            <div className="col-span-2">{selectedLender.contact_person_name}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Email:</div>
                            <div className="col-span-2 flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {selectedLender.email}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Phone:</div>
                            <div className="col-span-2 flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              {selectedLender.phone}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2" /> Application Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Date Applied:</div>
                            <div className="col-span-2">
                              {new Date(selectedLender.created_at).toLocaleDateString()} at{" "}
                              {new Date(selectedLender.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Status:</div>
                            <div className="col-span-2">
                              <Badge
                                variant={
                                  selectedLender.status === "approved"
                                    ? "success"
                                    : selectedLender.status === "rejected"
                                      ? "destructive"
                                      : "outline"
                                }
                              >
                                {selectedLender.status || "pending"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="organization" className="space-y-4 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Building className="h-4 w-4 mr-2" /> Organization Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Name:</div>
                            <div className="col-span-2">{selectedLender.organization_name}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Type:</div>
                            <div className="col-span-2">{selectedLender.organization_type}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">License Number:</div>
                            <div className="col-span-2">{selectedLender.license_number || "Not provided"}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Uploaded Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedLender.verification_document_url ? (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Verification Document:</Label>
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDocument(selectedLender.verification_document_url)}
                                  disabled={loadingDocument}
                                  className="text-primary hover:bg-primary/10 flex items-center"
                                >
                                  {loadingDocument ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                  )}
                                  View Verification Document
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No documents uploaded</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2" /> Admin Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Add notes about this application... (required)"
                          rows={4}
                          className={adminNoteError ? "border-red-500" : ""}
                        />
                        {adminNoteError && (
                          <Alert variant="destructive" className="py-2">
                            <AlertDescription>{adminNoteError}</AlertDescription>
                          </Alert>
                        )}
                        <Button onClick={handleUpdateNote} disabled={processingId === selectedLender.id} size="sm">
                          {processingId === selectedLender.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Update Note
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}

          <DialogFooter className="flex justify-between p-6 pt-2 border-t">
            <div>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
            <div className="flex space-x-2">
              {selectedLender && selectedLender.status !== "rejected" && (
                <Button variant="destructive" onClick={openRejectDialog}>
                  Reject
                </Button>
              )}
              {selectedLender && selectedLender.status !== "approved" && (
                <Button variant="default" onClick={openApproveDialog}>
                  Approve
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approve Lender Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this lender application? This will grant them access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Admin Note</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add approval notes (required)"
                rows={3}
                className={adminNoteError ? "border-red-500" : ""}
              />
              {adminNoteError && <p className="text-sm text-red-500">{adminNoteError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processingId === selectedLender?.id}>
              {processingId === selectedLender?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reject Lender Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this lender application? They will not be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add rejection reason (required)"
                rows={3}
                className={adminNoteError ? "border-red-500" : ""}
              />
              {adminNoteError && <p className="text-sm text-red-500">{adminNoteError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processingId === selectedLender?.id}>
              {processingId === selectedLender?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Add default export
export default PendingLendersTable
