"use client"

import { useState } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "./admin-sidebar"

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open menu" className="flex items-center gap-2 md:hidden mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <span className="text-sm font-semibold text-green-700">FC</span>
              </div>
              <h2 className="ml-2 text-lg font-semibold tracking-tight">FarmCredit Admin</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-4">
            <AdminSidebar isMobile={true} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
