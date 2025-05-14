import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LoginForm } from "@/components/auth/login-form"

export default function FarmerLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Farmer Login</h1>
            <p className="text-muted-foreground mt-2">Access your farmer account and manage your profile</p>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <LoginForm role="farmer" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
