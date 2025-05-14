import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LenderForm } from "@/components/auth/lender-form"

export default function LenderSignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-6 sm:py-8 md:py-12">
        <LenderForm />
      </main>
      <SiteFooter />
    </div>
  )
}
