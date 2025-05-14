import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FarmerForm } from "@/components/auth/farmer-form"

export default function FarmerSignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12">
        <FarmerForm />
      </main>
      <SiteFooter />
    </div>
  )
}
