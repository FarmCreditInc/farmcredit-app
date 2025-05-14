import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RoleSelection } from "@/components/auth/role-selection"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Create Your Account</h1>
          <RoleSelection />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
