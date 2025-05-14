import { Check } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Register & Build Profile",
      description:
        "Complete our multi-step registration form to create your farmer profile with personal, farm, and financial information.",
      points: ["Personal details and location", "Farm size and crop types", "Financial history and assets"],
    },
    {
      number: "02",
      title: "Get Your Credit Score",
      description:
        "Our system analyzes your profile data to generate a comprehensive credit score and loan eligibility assessment.",
      points: ["Transparent scoring factors", "Personalized improvement tips", "Regular score updates"],
    },
    {
      number: "03",
      title: "Apply for Financing",
      description:
        "Eligible farmers can apply for loans directly through the platform with competitive rates and flexible terms.",
      points: ["Multiple loan options", "Simple application process", "Quick approval decisions"],
    },
    {
      number: "04",
      title: "Grow Your Business",
      description:
        "Use the funds to invest in your farm, improve your practices, and increase your agricultural productivity.",
      points: ["Access to educational resources", "Business growth tracking", "Repayment management tools"],
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-green-50 dark:bg-green-950/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Your Journey to Financial Access</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Follow these simple steps to build your credit profile and access agricultural financing.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-900 dark:bg-green-800/20 dark:text-green-300">
                  <span className="text-sm font-bold">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
              </div>
              <p className="text-muted-foreground">{step.description}</p>
              <ul className="space-y-2">
                {step.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
