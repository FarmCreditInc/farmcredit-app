"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Loader2, FileText, User, MapPin, Phone, Mail, Calendar, Ruler, Leaf, Users } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Farmer {
  id: string
  full_name: string
  email: string
  phone: string
  state: string
  lga: string
  created_at: string
  status: string
  farm_size: number | null
  crop_types: string | null
  livestock_type: string | null
  farming_experience: number | null
  education_level: string | null
  id_document_url: string | null
  admin_note: string | null
  gender: string | null
  age: number | null
  is_coop_member: boolean | null
  uses_fertilizer: boolean | null
  uses_machinery: boolean | null
  uses_irrigation: boolean | null
  [key: string]: any // Allow for additional properties
}

interface PendingFarmersTableProps {
  farmers: Farmer[]
}

export function PendingFarmersTable({ farmers = [] }: PendingFarmersTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminNote, setAdminNote] = useState("")
  const [adminNoteError, setAdminNoteError] = useState<string | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const router = useRouter()
  const [loadingDocument, setLoadingDocument] = useState(false)

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
        description: "No document was uploaded for this farmer",
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
    if (!selectedFarmer) return

    // Validate admin note
    if (!adminNote.trim()) {
      setAdminNoteError("Please provide a note before approving")
      return
    }

    try {
      setProcessingId(selectedFarmer.id)

      const response = await fetch("/api/admin/update-farmer-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedFarmer.id,
          status: "approved",
          admin_note: adminNote,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to approve farmer")
      }

      toast({
        title: "Success",
        description: "Farmer application approved",
      })

      setIsApproveDialogOpen(false)
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error approving farmer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve farmer application",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject() {
    if (!selectedFarmer) return

    // Validate admin note
    if (!adminNote.trim()) {
      setAdminNoteError("Please provide a reason for rejection")
      return
    }

    try {
      setProcessingId(selectedFarmer.id)

      const response = await fetch("/api/admin/update-farmer-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedFarmer.id,
          status: "rejected",
          admin_note: adminNote,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to reject farmer")
      }

      toast({
        title: "Success",
        description: "Farmer application rejected",
      })

      setIsRejectDialogOpen(false)
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error rejecting farmer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject farmer application",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleUpdateNote() {
    if (!selectedFarmer) return

    // Validate admin note
    if (!adminNote.trim()) {
      setAdminNoteError("Admin note cannot be empty")
      return
    }

    try {
      setProcessingId(selectedFarmer.id)

      const response = await fetch("/api/admin/update-farmer-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedFarmer.id,
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

      // Update the selected farmer with the new note
      setSelectedFarmer({
        ...selectedFarmer,
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

  function handleViewDetails(farmer: Farmer) {
    setSelectedFarmer(farmer)
    setAdminNote(farmer.admin_note || "")
    setAdminNoteError(null)
    setIsDialogOpen(true)
  }

  function openApproveDialog() {
    if (!selectedFarmer) return

    // Validate admin note before opening approve dialog
    if (!adminNote.trim()) {
      setAdminNoteError("Please provide a note before approving")
      return
    }

    setIsApproveDialogOpen(true)
  }

  function openRejectDialog() {
    if (!selectedFarmer) return

    // Validate admin note before opening reject dialog
    if (!adminNote.trim()) {
      setAdminNoteError("Please provide a reason for rejection")
      return
    }

    setIsRejectDialogOpen(true)
  }

  if (farmers.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No pending farmer applications</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farmers.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell className="font-medium">{farmer.full_name}</TableCell>
                <TableCell>{farmer.email}</TableCell>
                <TableCell>{farmer.phone}</TableCell>
                <TableCell>
                  {farmer.state}, {farmer.lga}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      farmer.status === "approved"
                        ? "success"
                        : farmer.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {farmer.status || "pending"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(farmer.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleViewDetails(farmer)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Farmer Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Farmer Application Details</DialogTitle>
            <DialogDescription>Review the farmer's application information</DialogDescription>
          </DialogHeader>

          {selectedFarmer && (
            <div className="px-6 pb-6 overflow-hidden">
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="flex w-full h-auto overflow-x-auto">
                  <TabsTrigger value="details" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
                    Personal Details
                  </TabsTrigger>
                  <TabsTrigger value="farm" className="flex-1 text-xs sm:text-sm whitespace-nowrap">
                    Farm Information
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
                            <User className="h-4 w-4 mr-2" /> Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Full Name:</div>
                            <div className="col-span-2">{selectedFarmer.full_name}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Gender:</div>
                            <div className="col-span-2">{selectedFarmer.gender || "Not specified"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Age:</div>
                            <div className="col-span-2">{selectedFarmer.age || "Not specified"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Education:</div>
                            <div className="col-span-2">{selectedFarmer.education_level || "Not specified"}</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <MapPin className="h-4 w-4 mr-2" /> Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Email:</div>
                            <div className="col-span-2 flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {selectedFarmer.email}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Phone:</div>
                            <div className="col-span-2 flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              {selectedFarmer.phone}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">State:</div>
                            <div className="col-span-2">{selectedFarmer.state}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">LGA:</div>
                            <div className="col-span-2">{selectedFarmer.lga}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

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
                            {new Date(selectedFarmer.created_at).toLocaleDateString()} at{" "}
                            {new Date(selectedFarmer.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="text-sm font-medium">Status:</div>
                          <div className="col-span-2">
                            <Badge
                              variant={
                                selectedFarmer.status === "approved"
                                  ? "success"
                                  : selectedFarmer.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {selectedFarmer.status || "pending"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="farm" className="space-y-4 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Ruler className="h-4 w-4 mr-2" /> Farm Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Farm Size:</div>
                            <div className="col-span-2">
                              {selectedFarmer.farm_size ? `${selectedFarmer.farm_size} hectares` : "Not specified"}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Experience:</div>
                            <div className="col-span-2">
                              {selectedFarmer.farming_experience
                                ? `${selectedFarmer.farming_experience} years`
                                : "Not specified"}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Cooperative Member:</div>
                            <div className="col-span-2">{selectedFarmer.is_coop_member ? "Yes" : "No"}</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Leaf className="h-4 w-4 mr-2" /> Crops & Livestock
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Crop Types:</div>
                            <div className="col-span-2">{selectedFarmer.crop_types || "Not specified"}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium">Livestock:</div>
                            <div className="col-span-2">{selectedFarmer.livestock_type || "Not specified"}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" /> Farming Practices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Uses Fertilizer:</Label>
                            <div>{selectedFarmer.uses_fertilizer ? "Yes" : "No"}</div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Uses Machinery:</Label>
                            <div>{selectedFarmer.uses_machinery ? "Yes" : "No"}</div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Uses Irrigation:</Label>
                            <div>{selectedFarmer.uses_irrigation ? "Yes" : "No"}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Uploaded Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedFarmer.id_document_url ? (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">ID Document:</Label>
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDocument(selectedFarmer.id_document_url)}
                                  disabled={loadingDocument}
                                  className="text-primary hover:bg-primary/10 flex items-center"
                                >
                                  {loadingDocument ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                  )}
                                  View ID Document
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
                        <Button onClick={handleUpdateNote} disabled={processingId === selectedFarmer.id} size="sm">
                          {processingId === selectedFarmer.id ? (
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
              {selectedFarmer && selectedFarmer.status !== "rejected" && (
                <Button variant="destructive" onClick={openRejectDialog}>
                  Reject
                </Button>
              )}
              {selectedFarmer && selectedFarmer.status !== "approved" && (
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
            <DialogTitle>Approve Farmer Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this farmer application? This will grant them access to the platform.
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
            <Button onClick={handleApprove} disabled={processingId === selectedFarmer?.id}>
              {processingId === selectedFarmer?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reject Farmer Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this farmer application? They will not be able to access the platform.
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
            <Button variant="destructive" onClick={handleReject} disabled={processingId === selectedFarmer?.id}>
              {processingId === selectedFarmer?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Add default export
export default PendingFarmersTable
