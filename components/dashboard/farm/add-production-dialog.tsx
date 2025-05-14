"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProductionForm } from "./production-form"

interface AddProductionDialogProps {
  farmId: string
  farmName: string
}

export function AddProductionDialog({ farmId, farmName }: AddProductionDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Production Activity</DialogTitle>
          <DialogDescription>Record a new production activity for {farmName}.</DialogDescription>
        </DialogHeader>
        <ProductionForm farmId={farmId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
