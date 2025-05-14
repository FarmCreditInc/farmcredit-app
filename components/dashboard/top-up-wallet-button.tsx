"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TopUpWalletDialog } from "@/components/dashboard/top-up-wallet-dialog"

interface TopUpWalletButtonProps {
  userEmail: string
}

export function TopUpWalletButton({ userEmail }: TopUpWalletButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm">
        <PlusCircle className="mr-2 h-4 w-4" />
        Top Up
      </Button>

      <TopUpWalletDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} userEmail={userEmail} />
    </>
  )
}
