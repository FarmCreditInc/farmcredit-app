import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Edit } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface LenderBankDetailsCardProps {
  paymentDetails: {
    id: string
    bank_name: string
    bank_account_number: string
    bank_account_name: string
    bvn: string
  } | null
  showEditButton?: boolean
}

export function LenderBankDetailsCard({ paymentDetails, showEditButton = true }: LenderBankDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bank Details</CardTitle>
        <CardDescription>Your registered bank account information</CardDescription>
      </CardHeader>
      <CardContent>
        {paymentDetails ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                <p className="text-base">{paymentDetails.bank_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Name</p>
                <p className="text-base">{paymentDetails.bank_account_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                <p className="text-base">{paymentDetails.bank_account_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">BVN</p>
                <p className="text-base">
                  {paymentDetails.bvn
                    ? `${paymentDetails.bvn.substring(0, 3)}*****${paymentDetails.bvn.substring(8)}`
                    : ""}
                </p>
              </div>
            </div>

            {showEditButton && (
              <div className="pt-2">
                <Link href="/dashboard/lender/bank-details">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Bank Details
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="outline">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Bank Details</AlertTitle>
              <AlertDescription>You haven't added your bank details yet.</AlertDescription>
            </Alert>

            <Link href="/dashboard/lender/bank-details">
              <Button className="w-full">Add Bank Details</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
