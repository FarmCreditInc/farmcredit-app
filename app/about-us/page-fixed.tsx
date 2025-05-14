import Link from "next/link"
import { ArrowRight, CheckCircle, Users, Award, Target, BarChart } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnerLogo } from "@/components/partner-logo"

export default function AboutUs() {
  const milestones = [
    {
      year: "2020",
      title: "Idea Conception",
      description:
        "FarmCredit was conceived as a solution to address the financing gap faced by Nigerian youth farmers.",
    },
    {
      year: "2021",
      title: "Initial Research",
      description:
        "Conducted extensive research on agricultural finance and credit scoring models for smallholder farmers.",
    },
    {
      year: "2022",
      title: "Platform Development",
      description:
        "Developed and tested the initial version of the FarmCredit platform with a focus on user experience.",
    },
    {
      year: "2023",
      title: "Official Launch",
      description: "Launched the FarmCredit platform to the public, enabling Nigerian youth farmers to access credit.",
    },
    {
      year: "2024",
      title: "Expansion",
      description:
        "Expanded services to include educational resources and partnerships with more financial institutions.",
    },
  ]

  const stats = [
    {
      value: "10,000+",
      label: "Registered Farmers",
      icon: Users,
    },
    {
      value: "₦500M+",
      label: "Loans Facilitated",
      icon: BarChart,
    },
    {
      value: "25+",
      label: "Financial Partners",
      icon: Award,
    },
    {
      value: "32",
      label: "Nigerian States Covered",
      icon: Target,
    },
  ]

  const values = [
    {
      title: "Accessibility",
      description: "Making financial services accessible to all Nigerian farmers regardless of location or background.",
    },
    {
      title: "Innovation",
      description:
        "Continuously developing innovative solutions to address the unique challenges of agricultural finance.",
    },
    {
      title: "Transparency",
      description: "Maintaining transparent processes in credit scoring and loan facilitation.",
    },
    {
      title: "Empowerment",
      description: "Empowering farmers with knowledge and resources to build sustainable agricultural businesses.",
    },
    {
      title: "Collaboration",
      description:
        "Working closely with farmers, financial institutions, and government agencies to create effective solutions.",
    },
    {
      title: "Integrity",
      description: "Upholding the highest standards of integrity in all our operations and partnerships.",
    },
  ]

  const partners = [
    {
      name: "AgriBank",
      logo: "https://cdn.pixabay.com/photo/2017/01/31/13/14/bank-2023448_960_720.png",
    },
    {
      name: "FarmTech Solutions",
      logo: "https://cdn.pixabay.com/photo/2017/03/16/21/18/logo-2150297_960_720.png",
    },
    {
      name: "GreenGrow Investments",
      logo: "https://cdn.pixabay.com/photo/2017/01/13/01/22/rocket-1976107_960_720.png",
    },
    {
      name: "Harvest Finance",
      logo: "https://cdn.pixabay.com/photo/2016/12/19/08/39/mobile-phone-1917737_960_720.png",
    },
    {
      name: "Nigerian Agricultural Council",
      logo: "https://cdn.pixabay.com/photo/2017/01/31/23/42/animal-2028258_960_720.png",
    },
    {
      name: "EcoSeeds",
      logo: "https://cdn.pixabay.com/photo/2013/07/12/18/20/seed-153532_960_720.png",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 dark:bg-green-950/10 py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
                  About Us
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Bridging the Gap Between Farmers and Finance
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  FarmCredit is on a mission to transform agricultural finance in Nigeria by providing innovative credit
                  solutions for youth farmers.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/team">
                      Meet Our Team
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#our-story">Our Story</Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted md:h-[420px]">
                <img
                  src="/images/tech-enabled-farmer.jpeg"
                  alt="Young farmer using technology in a greenhouse"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="our-story" className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 relative h-[350px] w-full overflow-hidden rounded-xl bg-muted md:h-[420px]">
                <img
                  src="/images/nigerian-women-farmers.jpeg"
                  alt="Nigerian youth farmers in a field"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Our Story</h2>
                  <p className="text-muted-foreground">
                    FarmCredit was born out of a deep understanding of the challenges faced by Nigerian youth farmers.
                  </p>
                </div>
                <div className="space-y-4">
                  <p>
                    In 2020, our founder, Adebayo Ogunlesi, witnessed firsthand the struggles of young farmers in his
                    community who had the skills and determination to succeed but lacked access to the financial
                    resources needed to grow their agricultural businesses.
                  </p>
                  <p>
                    Despite their potential, traditional financial institutions were hesitant to provide loans to these
                    farmers due to perceived risks and lack of credit history. This financing gap was preventing
                    talented young Nigerians from contributing to the country's agricultural sector and achieving
                    financial independence.
                  </p>
                  <p>
                    Recognizing this problem, Adebayo assembled a team of experts in agricultural finance, technology,
                    and rural development to create a solution. The result was FarmCredit – an innovative platform that
                    uses alternative data and tailored credit scoring models to assess farmers' creditworthiness and
                    connect them with appropriate financing options.
                  </p>
                  <p>
                    Today, FarmCredit has grown into a comprehensive platform that not only facilitates access to loans
                    but also provides educational resources to help farmers improve their financial literacy and
                    agricultural practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 md:gap-12">
              <Card className="bg-white dark:bg-background">
                <CardHeader>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    To empower Nigerian youth farmers by providing accessible financial services and educational
                    resources that enable them to build sustainable agricultural businesses and achieve financial
                    independence.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-background">
                <CardHeader>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    A Nigeria where every youth farmer has the financial resources and knowledge needed to thrive,
                    contributing to food security, economic growth, and rural development across the country.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Our Values</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The core principles that guide our work and decision-making.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats Section */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">Our Impact</h2>
                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The difference we're making in Nigerian agriculture.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 text-center">
                  <div className="rounded-full bg-green-500/20 p-3">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-green-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones Section */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Our Journey</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Key milestones in the FarmCredit story.
                </p>
              </div>
            </div>

            <div className="mt-12 relative">
              <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-green-100 dark:bg-green-950/30" />
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                        {milestone.year.slice(2)}
                      </div>
                    </div>
                    <div
                      className={`grid gap-6 ${
                        index % 2 === 0
                          ? "md:grid-cols-[1fr_auto_1fr] md:text-right"
                          : "md:grid-cols-[1fr_auto_1fr] md:text-left md:[&>div:first-child]:col-start-3"
                      }`}
                    >
                      <div className="space-y-2 md:pr-12">
                        <div className="text-xl font-bold">{milestone.year}</div>
                        <div className="text-lg font-semibold">{milestone.title}</div>
                        <div className="text-muted-foreground">{milestone.description}</div>
                      </div>
                      <div className="hidden md:block" />
                      <div className="hidden md:block" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Our Partners</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Organizations that collaborate with us to support Nigerian farmers.
                </p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
              {partners.map((partner, index) => (
                <div key={index} className="flex items-center justify-center">
                  <div className="h-24 w-full rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <PartnerLogo
                        src={partner.logo || "/placeholder.svg"}
                        alt={`${partner.name} logo`}
                        className="h-12 w-auto object-contain mb-2"
                      />
                      <div className="text-xs font-medium text-center">{partner.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                  Join Us in Transforming Nigerian Agriculture
                </h2>
                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Whether you're a farmer, financial institution, or potential partner, we invite you to be part of our
                  mission.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-green-700">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
