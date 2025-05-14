import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function EducationHubLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section Loading */}
        <section className="bg-green-50 dark:bg-green-950/10 py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
              <Skeleton className="h-[350px] w-full rounded-xl md:h-[420px]" />
            </div>
          </div>
        </section>

        {/* Courses Section Loading */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-[500px] max-w-full" />
            </div>

            <div className="mt-12 flex justify-center">
              <Skeleton className="h-10 w-[300px]" />
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-6 w-full mt-2" />
                      <Skeleton className="h-4 w-full mt-1" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
            </div>

            <div className="mt-12 text-center">
              <Skeleton className="h-10 w-36 mx-auto" />
            </div>
          </div>
        </section>

        {/* Resources Section Loading */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-[500px] max-w-full" />
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="flex flex-col h-full">
                    <CardHeader>
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-6 w-full mt-4" />
                      <Skeleton className="h-4 w-full mt-1" />
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        </section>

        {/* CTA Section Loading */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Skeleton className="h-8 w-[500px] max-w-full bg-green-500/30" />
              <Skeleton className="h-6 w-[600px] max-w-full bg-green-500/30" />
              <Skeleton className="h-10 w-36 bg-green-500/30" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
