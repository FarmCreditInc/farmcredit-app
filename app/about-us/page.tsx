"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Users, Award, Target, BarChart, Leaf, Sprout, ChevronRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AboutUs() {
  const milestones = [
    {
      year: "2020",
      title: "Idea Conception",
      description:
        "FarmCredit was conceived as a solution to address the financing gap faced by Nigerian youth farmers.",
      icon: "💡",
    },
    {
      year: "2021",
      title: "Initial Research",
      description:
        "Conducted extensive research on agricultural finance and credit scoring models for smallholder farmers.",
      icon: "🔍",
    },
    {
      year: "2022",
      title: "Platform Development",
      description:
        "Developed and tested the initial version of the FarmCredit platform with a focus on user experience.",
      icon: "💻",
    },
    {
      year: "2023",
      title: "Official Launch",
      description: "Launched the FarmCredit platform to the public, enabling Nigerian youth farmers to access credit.",
      icon: "🚀",
    },
    {
      year: "2024",
      title: "Expansion",
      description:
        "Expanded services to include educational resources and partnerships with more financial institutions.",
      icon: "📈",
    },
  ]

  const stats = [
    {
      value: "10,000+",
      label: "Registered Farmers",
      icon: Users,
      description: "Active users across Nigeria",
    },
    {
      value: "₦500M+",
      label: "Loans Facilitated",
      icon: BarChart,
      description: "Capital deployed to farmers",
    },
    {
      value: "25+",
      label: "Financial Partners",
      icon: Award,
      description: "Trusted institutions",
    },
    {
      value: "32",
      label: "Nigerian States Covered",
      icon: Target,
      description: "Nationwide presence",
    },
  ]

  const values = [
    {
      title: "Accessibility",
      description: "Making financial services accessible to all Nigerian farmers regardless of location or background.",
      icon: Sprout,
    },
    {
      title: "Innovation",
      description:
        "Continuously developing innovative solutions to address the unique challenges of agricultural finance.",
      icon: Leaf,
    },
    {
      title: "Transparency",
      description: "Maintaining transparent processes in credit scoring and loan facilitation.",
      icon: CheckCircle,
    },
    {
      title: "Empowerment",
      description: "Empowering farmers with knowledge and resources to build sustainable agricultural businesses.",
      icon: Users,
    },
    {
      title: "Collaboration",
      description:
        "Working closely with farmers, financial institutions, and government agencies to create effective solutions.",
      icon: Award,
    },
    {
      title: "Integrity",
      description: "Upholding the highest standards of integrity in all our operations and partnerships.",
      icon: Target,
    },
  ]

  const partners = [
    {
      name: "AgriBank",
      logo: "/abstract-bank-logo.png",
    },
    {
      name: "FarmTech Solutions",
      logo: "/abstract-tech-logo.png",
    },
    {
      name: "GreenGrow Investments",
      logo: "/placeholder.svg?key=bmq3e",
    },
    {
      name: "Harvest Finance",
      logo: "/finance-company-logo.png",
    },
    {
      name: "Nigerian Agricultural Council",
      logo: "/placeholder.svg?key=6zsyk",
    },
    {
      name: "EcoSeeds",
      logo: "/placeholder.svg?key=gh7vo",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section - Styled like Team page hero */}
        <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/20 blur-3xl"></div>
            <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-green-200/20 blur-3xl"></div>
          </div>
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/30 dark:text-green-300"
              >
                Our Story
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300"
              >
                Bridging the Gap Between <br className="hidden sm:inline" />
                Farmers and Finance
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-[800px] text-muted-foreground text-lg md:text-xl"
              >
                FarmCredit is on a mission to transform agricultural finance in Nigeria by providing innovative credit
                solutions for youth farmers.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button size="lg" className="bg-green-600 hover:bg-green-700 group relative overflow-hidden" asChild>
                  <Link href="/team">
                    <span className="relative z-10 flex items-center">
                      Meet Our Team
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-green-200 dark:border-green-800 hover:bg-green-100/50 dark:hover:bg-green-900/20"
                  asChild
                >
                  <a href="#our-story" className="flex items-center">
                    Learn More
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, repeatDelay: 2 }}
                    >
                      →
                    </motion.span>
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Decorative wave at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-green-100 via-white to-green-100 dark:from-green-900/20 dark:via-transparent dark:to-green-900/20 opacity-50"></div>
        </section>

        {/* Vision & Mission Section - Redesigned with cards and visual elements */}
        <section className="py-24 bg-white dark:bg-background relative overflow-hidden">
          <div className="absolute left-0 top-1/4 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 -z-10"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div className="order-2 md:order-1">
                <div className="grid gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-background p-8 rounded-2xl shadow-lg border border-green-100 dark:border-green-900/30"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50">
                        <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold">Our Mission</h2>
                    </div>
                    <p className="text-muted-foreground">
                      To empower Nigerian youth farmers by providing accessible financial services and educational
                      resources that enable them to build sustainable agricultural businesses and achieve financial
                      independence.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-background p-8 rounded-2xl shadow-lg border border-green-100 dark:border-green-900/30"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50">
                        <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold">Our Vision</h2>
                    </div>
                    <p className="text-muted-foreground">
                      A Nigeria where every youth farmer has the financial resources and knowledge needed to thrive,
                      contributing to food security, economic growth, and rural development across the country.
                    </p>
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="order-1 md:order-2 relative"
              >
                <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-xl">
                  <Image
                    src="/images/nigerian-women-farmers.jpeg"
                    fill
                    alt="Nigerian farmers working in a field"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Empowering the Future of Agriculture</h3>
                    <p className="text-green-50">Building sustainable farming businesses across Nigeria</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg border border-green-100 dark:border-green-900/30 max-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-none">
                      Since 2020
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Transforming agricultural finance in Nigeria</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Story Section - Enhanced with timeline and visuals */}
        <section
          id="our-story"
          className="py-24 bg-gradient-to-b from-green-50 to-white dark:from-green-950/10 dark:to-background relative overflow-hidden"
        >
          <div className="absolute right-0 top-1/3 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50 -z-10"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4"
              >
                <Sprout className="h-6 w-6 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl font-bold tracking-tighter md:text-4xl/tight"
              >
                Our Story
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-[700px] text-muted-foreground md:text-lg"
              >
                FarmCredit was born out of a deep understanding of the challenges faced by Nigerian youth farmers.
              </motion.p>
            </div>

            <div className="grid gap-12 md:grid-cols-2 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-green-100 dark:border-green-900/30">
                  <p className="text-lg">
                    In 2020, a few of us four developers came together after constantly hearing the same story from
                    farmers around us — they had the drive, the skills, and the land, but no access to funding.
                    Traditional lenders saw them as too risky, no credit history, no collateral. But we saw potential.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-green-100 dark:border-green-900/30">
                  <p className="text-lg">
                    We knew there had to be a better way. So we built FarmCredit, a platform that uses alternative data
                    to evaluate farmers' creditworthiness and connect them with lenders willing to believe in more than
                    just paperwork.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-green-100 dark:border-green-900/30">
                  <p className="text-lg">
                    What started as a simple idea has grown into something much bigger. Today, FarmCredit is not just
                    about loans, it's about empowerment. We're helping farmers take control of their futures, one
                    harvest at a time.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-green-200 dark:bg-green-800"></div>
                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative flex gap-6">
                      <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 text-2xl z-10">
                        {milestone.icon}
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-md border border-green-100 dark:border-green-900/30 flex-grow">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-green-600 dark:text-green-400">{milestone.title}</h3>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-none">
                            {milestone.year}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Impact Stats Section - Enhanced with animations and better visuals */}
        <section className="py-24 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-0 h-96 w-96 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"></div>
            <div className="absolute right-1/4 bottom-0 h-96 w-96 translate-y-1/2 rounded-full bg-white/5 blur-3xl"></div>
          </div>
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center p-2 bg-green-500/20 rounded-full mb-4"
              >
                <BarChart className="h-6 w-6 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight"
              >
                Our Impact
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-[900px] text-green-100 md:text-xl/relaxed"
              >
                The difference we're making in Nigerian agriculture
              </motion.p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full bg-green-500/20 p-3">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-lg font-medium text-green-100">{stat.label}</div>
                      <div className="text-sm text-green-200/80 mt-1">{stat.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values Section - Enhanced with better cards and icons */}
        <section className="py-24 bg-white dark:bg-background relative overflow-hidden">
          <div className="absolute left-0 bottom-1/4 w-72 h-72 bg-green-50 rounded-full blur-3xl opacity-50 -z-10"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4"
              >
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl font-bold tracking-tighter md:text-4xl/tight"
              >
                Our Core Values
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-[700px] text-muted-foreground md:text-lg"
              >
                The principles that guide our work and decision-making
              </motion.p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-background p-6 rounded-xl border border-green-100 dark:border-green-900/30 shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50">
                      <value.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold">{value.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Section - Enhanced with better visuals */}
        <section className="py-24 bg-gradient-to-b from-green-50 to-white dark:from-green-950/10 dark:to-background relative overflow-hidden">
          <div className="absolute right-0 top-1/4 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50 -z-10"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4"
              >
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl font-bold tracking-tighter md:text-4xl/tight"
              >
                Our Partners
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-[700px] text-muted-foreground md:text-lg"
              >
                Organizations that collaborate with us to support Nigerian farmers
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {partners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-green-100 dark:border-green-900/30 flex flex-col items-center justify-center transition-all duration-300"
                >
                  <div className="h-16 flex items-center justify-center mb-2">
                    <Image
                      src={partner.logo || "/placeholder.svg"}
                      alt={`${partner.name} logo`}
                      width={160}
                      height={80}
                      className="max-h-16 w-auto object-contain"
                    />
                  </div>
                  <div className="text-sm font-medium text-center">{partner.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced with better visuals and animations */}
        <section className="py-24 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-0 h-96 w-96 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"></div>
            <div className="absolute right-1/4 bottom-0 h-96 w-96 translate-y-1/2 rounded-full bg-white/5 blur-3xl"></div>
          </div>
          <div className="container relative px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-white/20 text-center"
              >
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-6">
                  Join Us in Transforming Nigerian Agriculture
                </h2>
                <p className="text-green-100 text-lg md:text-xl mb-8">
                  Whether you're a farmer, financial institution, or potential partner, we invite you to be part of our
                  mission to revolutionize agricultural finance in Nigeria.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 shadow-lg group" asChild>
                    <Link href="/auth/signup">
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                    <Link href="/team">Meet Our Team</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
