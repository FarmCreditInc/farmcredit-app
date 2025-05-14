import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function FinancialTipLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 dark:bg-green-950/10 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col space-y-4">
              <Button variant="ghost" size="sm" className="w-fit" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Financial Tips
              </Button>
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                >
                  <Skeleton className="h-4 w-20" />
                </Badge>
                <Skeleton className="h-12 w-full max-w-2xl" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <Skeleton className="h-[300px] md:h-[400px] w-full rounded-xl" />
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="space-y-4">
                <Skeleton className="h-6 w-full max-w-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <Skeleton className="h-6 w-56" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Tips */}
        <section className="py-12 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Skeleton className="h-8 w-96 bg-green-500/20" />
                <Skeleton className="h-4 w-80 mx-auto bg-green-500/20" />
              </div>
              <Skeleton className="h-10 w-32 bg-white/20 rounded-md" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
