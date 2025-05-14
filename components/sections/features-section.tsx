import { ClipboardList, BarChart3, CreditCard, Building2, GraduationCap, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: ClipboardList,
      title: "Farmer Registration",
      description: "Simple multi-step registration process to collect your farm and financial information.",
    },
    {
      icon: BarChart3,
      title: "Credit Scoring",
      description: "Transparent credit scoring system based on your farm data and financial history.",
    },
    {
      icon: CreditCard,
      title: "Loan Applications",
      description: "Apply for loans with competitive rates and flexible repayment terms.",
    },
    {
      icon: Building2,
      title: "Lender Dashboard",
      description: "Financial institutions can view and assess loan applications efficiently.",
    },
    {
      icon: GraduationCap,
      title: "Education Hub",
      description: "Access resources to improve your financial knowledge and farming practices.",
    },
    {
      icon: Users,
      title: "Cooperative Support",
      description: "Connect with farming cooperatives to strengthen your credit profile.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-white dark:bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Everything You Need to Succeed</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform provides all the tools necessary for young farmers to build credit and access financing.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-800/20">
                <feature.icon className="h-6 w-6 text-green-700 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
