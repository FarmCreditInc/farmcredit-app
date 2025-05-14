"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Grow Your Farm Business?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Join thousands of farmers who are accessing credit and growing their agricultural businesses.
            </p>
          </div>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Get Started Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about-us">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
