"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, DollarSign, TrendingUp, PiggyBank, BarChart, Calendar } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function FinancialTips() {
  const tips = [
    {
      title: "Building a Farm Budget",
      description: "Learn how to create a comprehensive budget for your farm to track income and expenses.",
      image: "/farmer-budget-review.png",
      category: "Budgeting",
      date: "May 15, 2023",
      featured: true,
    },
    {
      title: "Saving for Farm Expansion",
      description: "Strategies to save money for expanding your agricultural business.",
      image: "/farmer-planning-expansion.png",
      category: "Saving",
      date: "June 22, 2023",
      featured: true,
    },
    {
      title: "Understanding Loan Terms",
      description: "A guide to understanding the terms and conditions of agricultural loans.",
      image: "/placeholder.svg?key=ws9rf",
      category: "Loans",
      date: "April 10, 2023",
      featured: true,
    },
    {
      title: "Record Keeping for Farmers",
      description: "How to maintain accurate financial records for your farm business.",
      image: "/placeholder.svg?key=rubrf",
      category: "Record Keeping",
      date: "March 5, 2023",
    },
    {
      title: "Pricing Your Farm Products",
      description: "Strategies for pricing your agricultural products to maximize profit.",
      image: "/farmer-pricing.png",
      category: "Pricing",
      date: "July 18, 2023",
    },
    {
      title: "Managing Seasonal Cash Flow",
      description: "Tips for managing your farm's cash flow during different seasons.",
      image: "/farmer-cash-flow.png",
      category: "Cash Flow",
      date: "February 28, 2023",
    },
    {
      title: "Tax Planning for Farmers",
      description: "Understanding tax obligations and planning strategies for Nigerian farmers.",
      image: "/farmer-tax-planning.png",
      category: "Taxes",
      date: "January 12, 2023",
    },
    {
      title: "Investing Farm Profits",
      description: "Smart ways to invest your farm profits for long-term growth.",
      image: "/farmer-investing-profits.png",
      category: "Investing",
      date: "August 7, 2023",
    },
  ]

  const quickTips = [
    {
      title: "Separate Personal and Farm Finances",
      description: "Keep your personal and farm finances separate to accurately track your business performance.",
      icon: DollarSign,
    },
    {
      title: "Track All Expenses",
      description: "Record every expense, no matter how small, to understand your true cost of production.",
      icon: TrendingUp,
    },
    {
      title: "Build an Emergency Fund",
      description: "Save 3-6 months of operating expenses to handle unexpected challenges.",
      icon: PiggyBank,
    },
    {
      title: "Review Finances Monthly",
      description: "Set aside time each month to review your farm's financial performance.",
      icon: BarChart,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section with Gradient Background - No Photo */}
        <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background py-24 md:py-32">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-green-200/20 dark:bg-green-900/20 blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-green-300/20 dark:bg-green-800/20 blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
                  Financial Tips
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-200">
                  Smart Financial Management for Nigerian Farmers
                </h1>
                <p className="text-muted-foreground md:text-xl max-w-[42rem] mx-auto">
                  Practical advice to help you manage your farm finances, build credit, and grow your agricultural
                  business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:translate-y-[-2px]"
                    asChild
                  >
                    <a href="#browse-all-tips">
                      Browse Tips
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="transition-all duration-200 transform hover:translate-y-[-2px]"
                    asChild
                  >
                    <a href="/financial-calculator">Financial Calculator</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Quick Financial Tips</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Simple but powerful financial advice for your farming business.
                </p>
              </div>
            </div>

            <motion.div
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {quickTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="flex flex-col h-full">
                    <CardHeader>
                      <motion.div
                        className="rounded-full bg-green-100 p-3 w-fit dark:bg-green-800/20"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <tip.icon className="h-6 w-6 text-green-700 dark:text-green-400" />
                      </motion.div>
                      <CardTitle className="mt-4">{tip.title}</CardTitle>
                      <CardDescription>{tip.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Tips */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter">Featured Financial Guides</h2>
                <p className="text-muted-foreground">In-depth guides to help you manage your farm finances.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="#browse-all-tips">View All</Link>
                </Button>
              </div>
            </div>

            <motion.div
              className="mt-8 grid gap-6 md:grid-cols-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {tips
                .filter((tip) => tip.featured)
                .map((tip, index) => {
                  const tipIndex = tips.findIndex((t) => t.title === tip.title) + 1
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                    >
                      <Card className="overflow-hidden">
                        <Link href={`/financial-tips/${tipIndex}`} className="block">
                          <div className="aspect-video w-full overflow-hidden">
                            <Image
                              src={tip.image || "/placeholder.svg"}
                              width={350}
                              height={200}
                              alt={tip.title}
                              className="object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        </Link>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                            >
                              {tip.category}
                            </Badge>
                          </div>
                          <Link href={`/financial-tips/${tipIndex}`} className="hover:underline">
                            <CardTitle className="mt-2">{tip.title}</CardTitle>
                          </Link>
                          <CardDescription>{tip.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {tip.date}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/30"
                            asChild
                          >
                            <Link href={`/financial-tips/${tipIndex}`}>Read More</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })}
            </motion.div>
          </div>
        </section>

        {/* All Tips */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center" id="browse-all-tips">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Browse All Financial Tips</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore our complete collection of financial advice for farmers.
                </p>
              </div>
            </div>

            <Tabs defaultValue="all" className="mt-12">
              <div className="flex justify-center overflow-auto pb-2">
                <TabsList>
                  <TabsTrigger value="all">All Tips</TabsTrigger>
                  <TabsTrigger value="Budgeting">Budgeting</TabsTrigger>
                  <TabsTrigger value="Loans">Loans</TabsTrigger>
                  <TabsTrigger value="Saving">Saving</TabsTrigger>
                  <TabsTrigger value="Record Keeping">Record Keeping</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="mt-8">
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {tips.map((tip, index) => {
                    const tipIndex = index + 1
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden">
                          <Link href={`/financial-tips/${tipIndex}`} className="block">
                            <div className="aspect-video w-full overflow-hidden">
                              <Image
                                src={tip.image || "/placeholder.svg"}
                                width={350}
                                height={200}
                                alt={tip.title}
                                className="object-cover transition-transform hover:scale-105"
                              />
                            </div>
                          </Link>
                          <CardHeader className="p-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                              >
                                {tip.category}
                              </Badge>
                            </div>
                            <Link href={`/financial-tips/${tipIndex}`} className="hover:underline">
                              <CardTitle className="mt-2 text-lg">{tip.title}</CardTitle>
                            </Link>
                            <CardDescription className="line-clamp-2">{tip.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-between p-4 pt-0">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="mr-1 h-3 w-3" />
                              {tip.date}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/30"
                              asChild
                            >
                              <Link href={`/financial-tips/${tipIndex}`}>Read More</Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </TabsContent>
              {["Budgeting", "Loans", "Saving", "Record Keeping"].map((category) => (
                <TabsContent key={category} value={category} className="mt-8">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {tips
                      .filter((tip) => tip.category === category)
                      .map((tip, index) => {
                        const tipIndex = tips.findIndex((t) => t.title === tip.title) + 1
                        return (
                          <Card key={index} className="overflow-hidden">
                            <Link href={`/financial-tips/${tipIndex}`} className="block">
                              <div className="aspect-video w-full overflow-hidden">
                                <Image
                                  src={tip.image || "/placeholder.svg"}
                                  width={350}
                                  height={200}
                                  alt={tip.title}
                                  className="object-cover transition-transform hover:scale-105"
                                />
                              </div>
                            </Link>
                            <CardHeader className="p-4">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                                >
                                  {tip.category}
                                </Badge>
                              </div>
                              <Link href={`/financial-tips/${tipIndex}`} className="hover:underline">
                                <CardTitle className="mt-2 text-lg">{tip.title}</CardTitle>
                              </Link>
                              <CardDescription className="line-clamp-2">{tip.description}</CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-between p-4 pt-0">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                {tip.date}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/30"
                                asChild
                              >
                                <Link href={`/financial-tips/${tipIndex}`}>Read More</Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        )
                      })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" disabled>
                All Tips Loaded
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Financial Calculator Section */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter">Farm Financial Calculators</h2>
                <p className="text-muted-foreground">
                  Use our free calculators to plan your farm finances, estimate loan repayments, and calculate potential
                  profits.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1 dark:bg-green-800/20">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                    </div>
                    <span>Loan Repayment Calculator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1 dark:bg-green-800/20">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                    </div>
                    <span>Crop Profit Calculator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1 dark:bg-green-800/20">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                    </div>
                    <span>Farm Budget Planner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1 dark:bg-green-800/20">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                    </div>
                    <span>Return on Investment Calculator</span>
                  </li>
                </ul>
                <Button className="bg-green-600 hover:bg-green-700" asChild>
                  <a href="/financial-calculator">
                    Access Calculators
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted md:h-[420px]">
                <Image
                  src="/placeholder.svg?key=8ys6a"
                  width={550}
                  height={420}
                  alt="Farmer using financial calculator"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                  Ready to Improve Your Farm's Financial Health?
                </h2>
                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Create a free account to access personalized financial advice and tools.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50" asChild>
                    <a href="/auth/signup">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
