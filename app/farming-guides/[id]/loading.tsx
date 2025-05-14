import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 dark:bg-green-950/10 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-full max-w-2xl" />
              <Skeleton className="h-6 w-full max-w-xl" />
              <div className="flex items-center space-x-4 pt-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <Skeleton className="h-[300px] md:h-[500px] w-full rounded-xl" />
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-8 w-2/3 mt-8" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="lg:col-span-4">
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
