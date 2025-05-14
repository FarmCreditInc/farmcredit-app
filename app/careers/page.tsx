"use client"

import Image from "next/image"
import { ArrowRight, MapPin, Briefcase, CheckCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -10,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
}

export default function Careers() {
  const jobs = [
    {
      id: "agri-finance-specialist",
      title: "Agricultural Finance Specialist",
      department: "Finance",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description:
        "We're looking for an Agricultural Finance Specialist to develop and implement financial products tailored to the needs of Nigerian farmers.",
      featured: true,
    },
    {
      id: "frontend-developer",
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description:
        "Join our engineering team to build intuitive and accessible user interfaces for our agricultural finance platform.",
      featured: true,
    },
    {
      id: "credit-risk-analyst",
      title: "Credit Risk Analyst",
      department: "Risk",
      location: "Abuja, Nigeria",
      type: "Full-time",
      description:
        "Help develop and refine our credit scoring models for assessing the creditworthiness of Nigerian farmers.",
      featured: true,
    },
    {
      id: "farmer-relations",
      title: "Farmer Relations Coordinator",
      department: "Operations",
      location: "Kano, Nigeria",
      type: "Full-time",
      description:
        "Work directly with farmers to understand their needs and ensure our platform meets their requirements.",
    },
    {
      id: "marketing-specialist",
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description:
        "Develop and implement marketing strategies to reach and educate Nigerian farmers about our platform.",
    },
  ]

  const benefits = [
    {
      title: "Competitive Salary",
      description: "We offer competitive compensation packages based on experience and skills.",
    },
    {
      title: "Remote Work Options",
      description: "Flexible work arrangements including remote work for many positions.",
    },
    {
      title: "Professional Development",
      description: "Opportunities for continuous learning and career advancement.",
    },
    {
      title: "Health Insurance",
      description: "Comprehensive health insurance coverage for employees and dependents.",
    },
    {
      title: "Paid Time Off",
      description: "Generous vacation policy and paid holidays.",
    },
    {
      title: "Meaningful Work",
      description: "Make a real difference in the lives of Nigerian farmers and the agricultural sector.",
    },
  ]

  const values = [
    {
      title: "Innovation",
      description: "We encourage creative thinking and innovative approaches to solving problems.",
    },
    {
      title: "Collaboration",
      description: "We work together across teams to achieve our common goals.",
    },
    {
      title: "Impact",
      description: "We're committed to making a positive difference in Nigerian agriculture.",
    },
    {
      title: "Diversity",
      description: "We value diverse perspectives and backgrounds in our team.",
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
            <motion.div
              className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-green-200/20 dark:bg-green-900/20 blur-3xl transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            ></motion.div>
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-green-300/20 dark:bg-green-800/20 blur-3xl transform translate-x-1/2 translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            ></motion.div>
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300"
                >
                  Careers
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-200"
                >
                  Join Our Mission to Transform Agricultural Finance
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-muted-foreground md:text-xl max-w-[42rem] mx-auto"
                >
                  Be part of a team that's empowering Nigerian youth farmers and revolutionizing access to agricultural
                  finance.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                >
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <a href="#browse-positions">
                      <Button className="bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:translate-y-[-2px]">
                        View All Positions
                      </Button>
                    </a>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn}>
                <h2 className="text-3xl font-bold tracking-tighter">Featured Opportunities</h2>
                <p className="text-muted-foreground">Our most recent and high-priority open positions.</p>
              </motion.div>
              <motion.div variants={fadeIn} className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-8 grid gap-6 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {jobs
                .filter((job) => job.featured)
                .map((job, index) => (
                  <motion.div key={index} variants={cardVariants} whileHover="hover">
                    <Card className="flex flex-col h-full">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                          >
                            {job.department}
                          </Badge>
                        </div>
                        <CardTitle className="mt-2">{job.title}</CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{job.type}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/careers/${job.id}`} passHref>
                          <Button className="w-full bg-green-600 hover:bg-green-700">Apply Now</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </section>

        {/* All Jobs */}
        <section id="browse-positions" className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Browse All Positions</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find the perfect role to match your skills and passion.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Tabs defaultValue="all" className="mt-12">
                <div className="flex justify-center overflow-auto pb-2">
                  <TabsList className="flex flex-wrap justify-center">
                    <TabsTrigger value="all" className="flex-shrink-0">
                      All Departments
                    </TabsTrigger>
                    <TabsTrigger value="engineering" className="flex-shrink-0">
                      Engineering
                    </TabsTrigger>
                    <TabsTrigger value="finance" className="flex-shrink-0">
                      Finance
                    </TabsTrigger>
                    <TabsTrigger value="operations" className="flex-shrink-0">
                      Operations
                    </TabsTrigger>
                    <TabsTrigger value="marketing" className="flex-shrink-0">
                      Marketing
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="mt-8">
                  <motion.div
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={staggerContainer}
                  >
                    {jobs.map((job, index) => (
                      <motion.div key={index} variants={cardVariants} whileHover="hover">
                        <Card className="flex flex-col h-full">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                              >
                                {job.department}
                              </Badge>
                            </div>
                            <CardTitle className="mt-2">{job.title}</CardTitle>
                            <CardDescription>{job.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span>{job.type}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Link href={`/careers/${job.id}`} passHref>
                              <Button className="w-full bg-green-600 hover:bg-green-700">Apply Now</Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
                {/* Similar TabsContent for other departments with animations */}
                <TabsContent value="engineering" className="mt-8">
                  <motion.div
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={staggerContainer}
                  >
                    {jobs
                      .filter((job) => job.department === "Engineering")
                      .map((job, index) => (
                        <motion.div key={index} variants={cardVariants} whileHover="hover">
                          <Card className="flex flex-col h-full">
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                                >
                                  {job.department}
                                </Badge>
                              </div>
                              <CardTitle className="mt-2">{job.title}</CardTitle>
                              <CardDescription>{job.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <span>{job.type}</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Link href={`/careers/${job.id}`} passHref>
                                <Button className="w-full bg-green-600 hover:bg-green-700">Apply Now</Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                  </motion.div>
                </TabsContent>
                {/* Other tabs content with similar animation patterns */}
                <TabsContent value="finance" className="mt-8">
                  {/* Similar content with animations */}
                </TabsContent>
                <TabsContent value="operations" className="mt-8">
                  {/* Similar content with animations */}
                </TabsContent>
                <TabsContent value="marketing" className="mt-8">
                  {/* Similar content with animations */}
                </TabsContent>
              </Tabs>
            </motion.div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button variant="outline" size="lg">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Why Work With Us</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We offer a range of benefits and a supportive work environment.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {benefits.map((benefit, index) => (
                <motion.div key={index} variants={cardVariants} whileHover="hover">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        {benefit.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Culture Section */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <motion.div
              className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter">Our Culture</h2>
                <p className="text-muted-foreground">
                  At FarmCredit, we're building a culture that values innovation, collaboration, and impact. We're a
                  diverse team united by our mission to transform agricultural finance in Nigeria.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {values.map((value, index) => (
                    <motion.div
                      key={index}
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                      <h3 className="font-bold">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="relative h-[250px] sm:h-[350px] w-full overflow-hidden rounded-xl bg-muted md:h-[420px]"
              >
                <Image
                  src="/placeholder.svg?height=420&width=550"
                  width={550}
                  height={420}
                  alt="FarmCredit team culture"
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Our Application Process</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  What to expect when you apply for a role at FarmCredit.
                </p>
              </motion.div>
            </motion.div>

            <div className="mt-12 relative">
              {/* Desktop timeline */}
              <motion.div
                className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-green-100 dark:bg-green-950/30"
                initial={{ height: 0 }}
                whileInView={{ height: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              />
              <div className="hidden md:block space-y-12">
                {[
                  {
                    step: "1",
                    title: "Application Review",
                    description: "Our team reviews your application to assess your qualifications and experience.",
                  },
                  {
                    step: "2",
                    title: "Initial Interview",
                    description:
                      "A conversation with our recruitment team to learn more about your background and interests.",
                  },
                  {
                    step: "3",
                    title: "Technical Assessment",
                    description:
                      "Depending on the role, you may be asked to complete a technical assessment or case study.",
                  },
                  {
                    step: "4",
                    title: "Team Interview",
                    description: "Meet with potential teammates and managers to discuss the role in more detail.",
                  },
                  {
                    step: "5",
                    title: "Offer",
                    description: "If you're a good fit, we'll extend an offer to join our team.",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    <motion.div
                      className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.3 + index * 0.1,
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                        {step.step}
                      </div>
                    </motion.div>
                    <div
                      className={`grid gap-6 ${
                        index % 2 === 0
                          ? "md:grid-cols-[1fr_auto_1fr] md:text-right"
                          : "md:grid-cols-[1fr_auto_1fr] md:text-left md:[&>div:first-child]:col-start-3"
                      }`}
                    >
                      <div className="space-y-2 md:pr-12">
                        <div className="text-lg font-semibold">{step.title}</div>
                        <div className="text-muted-foreground">{step.description}</div>
                      </div>
                      <div className="hidden md:block" />
                      <div className="hidden md:block" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile timeline */}
              <div className="md:hidden space-y-8">
                {[
                  {
                    step: "1",
                    title: "Application Review",
                    description: "Our team reviews your application to assess your qualifications and experience.",
                  },
                  {
                    step: "2",
                    title: "Initial Interview",
                    description:
                      "A conversation with our recruitment team to learn more about your background and interests.",
                  },
                  {
                    step: "3",
                    title: "Technical Assessment",
                    description:
                      "Depending on the role, you may be asked to complete a technical assessment or case study.",
                  },
                  {
                    step: "4",
                    title: "Team Interview",
                    description: "Meet with potential teammates and managers to discuss the role in more detail.",
                  },
                  {
                    step: "5",
                    title: "Offer",
                    description: "If you're a good fit, we'll extend an offer to join our team.",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <motion.div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.3 + index * 0.1,
                        }}
                      >
                        {step.step}
                      </motion.div>
                      {index < 4 && (
                        <motion.div
                          className="h-full w-0.5 bg-green-100 dark:bg-green-950/30 my-2"
                          initial={{ height: 0 }}
                          whileInView={{ height: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                        ></motion.div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">{step.title}</div>
                      <div className="text-muted-foreground">{step.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <motion.div
            className="container px-4 md:px-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                  Do you want to know about us more?
                </h2>
                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Learn about our mission, vision, and the team behind FarmCredit.
                </p>
              </div>
              <motion.div
                className="flex flex-col gap-2 min-[400px]:flex-row"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link href="/about-us">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                    About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
