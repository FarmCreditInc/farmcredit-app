import { Loader2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Loading results...</h2>
              <p className="text-muted-foreground">We're finding the best answers to your question.</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
