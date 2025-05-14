import Link from "next/link"
import { CreditCard, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BankDetailsCardProps {
  paymentDetails: {
    bank_account_name: string
    bank_name: string
    bank_account_number: string
    bvn?: string
  } | null
  showEditButton?: boolean
}

export function BankDetailsCard({ paymentDetails, showEditButton = true }: BankDetailsCardProps) {
  if (!paymentDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>Your registered bank account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center border rounded-md">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Bank Details Found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't added any bank details yet. Add your bank information to receive loan disbursements.
            </p>
            {showEditButton && (
              <Button asChild>
                <Link href="/dashboard/farmer/bank-details">Add Bank Details</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
        <CardDescription>Your registered bank account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Account Name</p>
            <p className="font-medium">{paymentDetails.bank_account_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
            <p className="font-medium">{paymentDetails.bank_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Account Number</p>
            <p className="font-medium">{paymentDetails.bank_account_number}</p>
          </div>
          {paymentDetails.bvn && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">BVN</p>
              <p className="font-medium">
                {`${paymentDetails.bvn.substring(0, 3)}*****${paymentDetails.bvn.slice(-3)}`}
              </p>
            </div>
          )}
        </div>

        <Alert variant="outline" className="mt-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Verification Status</AlertTitle>
          <AlertDescription className="text-blue-700">
            Your bank details have been saved and will be verified during loan processing.
          </AlertDescription>
        </Alert>
      </CardContent>
      {showEditButton && (
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/farmer/bank-details">Update Bank Details</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
