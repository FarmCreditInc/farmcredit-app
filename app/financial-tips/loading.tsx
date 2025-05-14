import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"

export default function FinancialTipsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 dark:bg-green-950/10 py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-12 w-full max-w-md" />
                <Skeleton className="h-12 w-full max-w-md" />
                <Skeleton className="h-6 w-full max-w-sm" />
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Skeleton className="h-10 w-32 rounded-md" />
                  <Skeleton className="h-10 w-40 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-[350px] w-full rounded-xl md:h-[420px]" />
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-5 w-96 mx-auto" />
              </div>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="flex flex-col h-full">
                  <CardHeader>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-6 w-full mt-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Tips */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-80 mt-2" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader>
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-full mt-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* All Tips Section - Just a preview */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-5 w-96 mx-auto" />
              </div>
            </div>

            <div className="mt-12 flex justify-center overflow-auto pb-2">
              <Skeleton className="h-10 w-96" />
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader className="p-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-full mt-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
