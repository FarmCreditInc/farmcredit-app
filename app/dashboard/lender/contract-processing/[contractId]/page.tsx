"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"
import { generateLoanContract } from "@/actions/lender-actions"

export type ProcessStep = {
  id: string
  title: string
  description: string
  status: "pending" | "loading" | "success" | "error"
  errorMessage?: string
}

export default function ContractProcessingPage({ params }: { params: { contractId: string } }) {
  const router = useRouter()
  const { theme } = useTheme()
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    {
      id: "approval",
      title: "Loan Approval",
      description: "Processing your loan approval request",
      status: "success", // This is already done when we reach this page
    },
    {
      id: "contract",
      title: "Contract Generation",
      description: "Generating the loan contract document",
      status: "loading",
    },
    {
      id: "email",
      title: "Email Notification",
      description: "Sending contract to both parties via email",
      status: "pending",
    },
  ])
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const contractId = params.contractId

  // Helper function to add debug logs (still collecting but not displaying)
  const addDebugLog = (message: string) => {
    console.log(message)
    setDebugLogs((prev) => [...prev, `${new Date().toISOString().substring(11, 23)}: ${message}`])
  }

  useEffect(() => {
    if (!contractId) {
      setError("Contract ID is missing")
      return
    }

    const processContract = async () => {
      try {
        addDebugLog(`Starting contract generation for ID: ${contractId}`)

        // Update contract step to loading
        updateStep("contract", {
          status: "loading",
          description: "Generating contract document...",
        })

        // Use the server action to generate the contract
        const result = await generateLoanContract(contractId, contractId)

        if (!result.success) {
          throw new Error(result.error || "Failed to generate contract")
        }

        addDebugLog("Contract generation completed successfully")

        // Update contract step to success
        updateStep("contract", {
          status: "success",
          description: "Contract document generated successfully",
        })

        // Update email step to loading
        updateStep("email", {
          status: "loading",
          description: "Sending contract via email...",
        })

        // Wait a bit to simulate the email sending process
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Update email step to success
        updateStep("email", {
          status: "success",
          description: "Contract sent to both parties via email",
        })

        addDebugLog("Contract generation and email process completed successfully")
        setIsProcessing(false)
      } catch (error) {
        addDebugLog(`Error in contract generation process: ${error instanceof Error ? error.message : String(error)}`)

        // Update contract step to error
        updateStep("contract", {
          status: "error",
          description: "Failed to generate contract document",
          errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
        })

        // Update email step to error
        updateStep("email", {
          status: "error",
          description: "Failed to send email notifications",
          errorMessage: "Email notifications could not be sent due to contract generation failure",
        })

        setError(error instanceof Error ? error.message : "An unknown error occurred")
        setIsProcessing(false)
      }
    }

    processContract()
  }, [contractId])

  // Helper function to update a specific step
  const updateStep = (stepId: string, updates: Partial<ProcessStep>) => {
    setProcessSteps((prevSteps) => prevSteps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)))
  }

  const retryContractGeneration = async () => {
    setError(null)
    setIsProcessing(true)
    setDebugLogs([])

    // Reset contract and email steps
    updateStep("contract", {
      status: "pending",
      description: "Generating the loan contract document",
    })

    updateStep("email", {
      status: "pending",
      description: "Sending contract to both parties via email",
    })

    // Wait a moment before starting the retry
    setTimeout(async () => {
      // Start the contract generation process again
      updateStep("contract", {
        status: "loading",
        description: "Generating contract document...",
      })

      try {
        // Use the server action to generate the contract
        const result = await generateLoanContract(contractId, contractId)

        if (!result.success) {
          throw new Error(result.error || "Failed to generate contract")
        }

        // Update contract step to success
        updateStep("contract", {
          status: "success",
          description: "Contract document generated successfully",
        })

        updateStep("email", {
          status: "loading",
          description: "Sending contract via email...",
        })

        setTimeout(() => {
          updateStep("email", {
            status: "success",
            description: "Contract sent to both parties via email",
          })
          setIsProcessing(false)
        }, 2000)
      } catch (error) {
        updateStep("contract", {
          status: "error",
          description: "Failed to generate contract document",
          errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
        })

        updateStep("email", {
          status: "error",
          description: "Failed to send email notifications",
          errorMessage: "Email notifications could not be sent due to contract generation failure",
        })

        setError(error instanceof Error ? error.message : "An unknown error occurred")
        setIsProcessing(false)
      }
    }, 1000)
  }

  const goToApprovedLoans = () => {
    router.push("/dashboard/lender/loans")
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <div className="w-8 h-8 rounded-full border-2 border-gray-300" />
      case "loading":
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case "error":
        return <XCircle className="w-8 h-8 text-red-500" />
      default:
        return null
    }
  }

  const downloadContract = async () => {
    try {
      // Call the server action to generate the contract again
      const result = await generateLoanContract(contractId, contractId)

      if (!result.success) {
        throw new Error(result.error || "Failed to generate contract")
      }

      // Create a notification that the contract has been sent to email
      alert("The contract has been sent to your email. Please check your inbox.")
    } catch (error) {
      console.error("Error downloading contract:", error)
      alert("Failed to generate contract. Please try again later.")
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Loan Contract Processing</CardTitle>
          <CardDescription>Contract ID: {contractId}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-8">
              {processSteps.map((step) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getStepIcon(step.status)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{step.title}</h3>
                      <span
                        className={`text-sm font-medium capitalize px-2 py-1 rounded-full ${
                          step.status === "pending"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            : step.status === "loading"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : step.status === "success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {step.status === "loading" ? "Processing" : step.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                    {step.status === "error" && step.errorMessage && (
                      <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{step.errorMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!isProcessing && !error && (
                <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
                      Process Completed Successfully
                    </h3>
                  </div>
                  <p className="mt-2 text-green-700 dark:text-green-300 pl-9">
                    The loan has been approved and the contract has been generated and sent to both parties via email.
                    You can request the contract again by clicking the button below.
                  </p>
                </div>
              )}

              {!isProcessing && error && (
                <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Process Failed</h3>
                  </div>
                  <p className="mt-2 text-red-700 dark:text-red-300 pl-9">
                    {error}. Please try again or contact support if the issue persists.
                  </p>
                </div>
              )}

              {/* Debug logs section - removed as requested */}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {!isProcessing && error && (
            <Button onClick={retryContractGeneration} className="w-full sm:w-auto">
              Retry Process
            </Button>
          )}
          {!isProcessing && !error && (
            <>
              <Button onClick={downloadContract} variant="outline" className="w-full sm:w-auto">
                Request Contract
              </Button>
              <Button onClick={goToApprovedLoans} className="w-full sm:w-auto">
                See Approved Loans
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
