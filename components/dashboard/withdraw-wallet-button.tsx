"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine } from "lucide-react"
import { WithdrawDialog } from "./withdraw-dialog"
import { withdrawFunds } from "@/actions/lender-actions"
import { toast } from "sonner"

interface WithdrawWalletButtonProps {
  availableBalance: number
}

export function WithdrawWalletButton({ availableBalance }: WithdrawWalletButtonProps) {
  const [open, setOpen] = useState(false)

  const handleWithdraw = async (formData: FormData) => {
    try {
      const result = await withdrawFunds(formData)

      if (!result.success) {
        if (result.error === "Insufficient funds in wallet") {
          toast.error(
            `Insufficient funds. Required: ₦${result.requiredAmount?.toLocaleString()}, Available: ₦${result.currentBalance?.toLocaleString()}`,
          )
        } else {
          toast.error(result.error || "Failed to process withdrawal")
        }
        return
      }

      // Refresh the page to show updated balance
      window.location.reload()
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast.error("An unexpected error occurred")
    }
  }

  return (
    <>
      <Button variant="outline" className="flex items-center gap-2" onClick={() => setOpen(true)}>
        <ArrowDownToLine className="h-4 w-4" />
        <span>Withdraw</span>
      </Button>

      <WithdrawDialog
        open={open}
        onOpenChange={setOpen}
        availableBalance={availableBalance}
        onWithdraw={handleWithdraw}
      />
    </>
  )
}
