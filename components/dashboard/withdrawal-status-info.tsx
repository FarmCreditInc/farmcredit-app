"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function WithdrawalStatusInfo() {
  return (
    <Alert className="mt-4">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>About Withdrawal Status</AlertTitle>
      <AlertDescription>
        <p className="mt-2">When you request a withdrawal, it goes through the following stages:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <span className="font-semibold">Pending</span>: Your withdrawal request has been received and is awaiting
            processing.
          </li>
          <li>
            <span className="font-semibold">Processing</span>: Your withdrawal is being processed by our payment system.
          </li>
          <li>
            <span className="font-semibold">Successful</span>: The funds have been successfully transferred to your bank
            account.
          </li>
          <li>
            <span className="font-semibold">Failed</span>: There was an issue processing your withdrawal. The funds will
            be returned to your wallet.
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          For demonstration purposes, withdrawals are automatically processed and completed within 1 minute.
        </p>
      </AlertDescription>
    </Alert>
  )
}
