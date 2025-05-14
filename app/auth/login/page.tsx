import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RoleSelectionLogin } from "@/components/auth/role-selection-login"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Please select your role to continue to your account</p>
          </div>
          <RoleSelectionLogin />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
