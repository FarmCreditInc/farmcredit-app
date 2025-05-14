"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Loader2, XCircle, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export type ProcessStep = {
  id: string
  title: string
  description: string
  status: "pending" | "loading" | "success" | "error"
  errorMessage?: string
}

interface ContractGenerationProgressProps {
  isOpen: boolean
  onClose: () => void
  contractId: string | null
  steps: ProcessStep[]
  onRetry?: () => void
}

export function ContractGenerationProgress({
  isOpen,
  onClose,
  contractId,
  steps,
  onRetry,
}: ContractGenerationProgressProps) {
  const [showCloseButton, setShowCloseButton] = useState(false)

  // Allow closing only when all steps are completed or failed
  useEffect(() => {
    const allCompleted = steps.every((step) => step.status === "success" || step.status === "error")
    setShowCloseButton(allCompleted)
  }, [steps])

  // Auto-close after 10 seconds if all steps are completed successfully
  useEffect(() => {
    const allSuccessful = steps.every((step) => step.status === "success")
    if (allSuccessful) {
      const timer = setTimeout(() => {
        onClose()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [steps, onClose])

  const hasErrors = steps.some((step) => step.status === "error")

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && showCloseButton) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Loan Contract Generation</DialogTitle>
          <DialogDescription>
            {contractId ? `Contract Reference: ${contractId.substring(0, 8)}` : "Processing your loan approval"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6 py-4">
            {steps.map((step, index) => (
              <div key={step.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {step.status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-muted" />}
                    {step.status === "loading" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                    {step.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {step.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.status === "error" && step.errorMessage && (
                      <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 text-red-500" />
                          <span>{step.errorMessage}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {index < steps.length - 1 && <div className="ml-2.5 pl-3.5 h-6 border-l-2 border-muted" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 mt-4">
          {hasErrors && onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Retry
            </Button>
          )}
          {showCloseButton && <Button onClick={onClose}>Close</Button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
