"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import type { ReactNode } from "react"

interface BankTabsClientProps {
  bankDetailsContent: ReactNode
  transactionsContent: ReactNode
  addBankContent: ReactNode
}

export function BankTabsClient({ bankDetailsContent, transactionsContent, addBankContent }: BankTabsClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/farmer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank & Transactions</h1>
          <p className="text-muted-foreground">View your bank details and transaction history</p>
        </div>
      </div>

      <Tabs defaultValue="bank-details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="add-bank">Add/Edit Bank</TabsTrigger>
        </TabsList>

        <TabsContent value="bank-details" className="space-y-4">
          {bankDetailsContent}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactionsContent}
        </TabsContent>

        <TabsContent value="add-bank" className="space-y-4">
          {addBankContent}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function AddBankButton() {
  return (
    <Button>
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault()
          document.querySelector('[data-value="add-bank"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Bank Details
      </Link>
    </Button>
  )
}

export function UpdateBankButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => {
        document.querySelector('[data-value="add-bank"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      }}
    >
      Update Bank Details
    </Button>
  )
}
