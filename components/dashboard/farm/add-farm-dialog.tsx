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
import { FarmForm } from "./farm-form"

export function AddFarmDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Farm
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto w-[95vw] md:w-auto">
        <DialogHeader>
          <DialogTitle>Add New Farm</DialogTitle>
          <DialogDescription>
            Enter the details of your farm to start tracking your agricultural activities.
          </DialogDescription>
        </DialogHeader>
        <FarmForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
