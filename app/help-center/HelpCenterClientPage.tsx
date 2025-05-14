"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  Search,
  BookOpen,
  FileQuestion,
  Video,
  Users,
  ChevronRight,
  Laptop,
  Bot,
  X,
  Loader2,
} from "lucide-react"
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

export default function HelpCenterClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "")
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [showAiResponse, setShowAiResponse] = useState(false)
  const responseRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsLoading(true)
      setShowAiResponse(true)

      try {
        // Call your AI search API
        const response = await fetch("/api/ai-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: searchQuery }),
        })

        if (!response.ok) {
          throw new Error("Failed to get AI response")
        }

        const data = await response.json()
        setAiResponse(data.response || "I'm sorry, I couldn't find an answer to your question.")

        // Scroll to the response
        if (responseRef.current) {
          setTimeout(() => {
            responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 100)
        }
      } catch (error) {
        console.error("Error fetching AI response:", error)
        setAiResponse("I'm sorry, there was an error processing your question. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const popularTopics = [
    {
      title: "Creating an Account",
      description: "Learn how to create and set up your FarmCredit account",
      icon: <Users className="h-6 w-6" />,
      href: "/help-center/account-management/creating-account",
    },
    {
      title: "Applying for Loans",
      description: "Step-by-step guide to applying for agricultural loans",
      icon: <FileQuestion className="h-6 w-6" />,
      href: "/help-center/farmer-resources/applying-loans",
    },
    {
      title: "Uploading Documents",
      description: "How to upload and manage your documents",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/help-center/farmer-resources/uploading-documents",
    },
    {
      title: "Video Tutorials",
      description: "Watch our video guides for visual instructions",
      icon: <Video className="h-6 w-6" />,
      href: "/help-center/video-tutorials",
    },
  ]

  const categories = [
    {
      title: "Account Management",
      description: "Account creation, profile updates, and security",
      icon: <Users className="h-6 w-6" />,
      href: "/help-center/account-management",
      image: "/farmer-laptop.png",
    },
    {
      title: "Farmer Resources",
      description: "Loan applications, document management, and farming tips",
      icon: <Laptop className="h-6 w-6" />,
      href: "/help-center/farmer-resources",
      image: "/farming-tutorial-still.png",
    },
    {
      title: "Video Tutorials",
      description: "Visual guides for using the FarmCredit platform",
      icon: <Video className="h-6 w-6" />,
      href: "/help-center/video-tutorials",
      image: "/video-tutorial-thumbnail.png",
    },
  ]

  const faqs = [
    {
      question: "How do I apply for a loan?",
      answer:
        'To apply for a loan, log in to your FarmCredit account, navigate to the "Loans" section, and click on "Apply for Loan". Follow the step-by-step instructions to complete your application.',
    },
    {
      question: "What documents do I need to upload?",
      answer:
        "Required documents typically include proof of identity (National ID, passport), proof of address, farm ownership or lease documents, and financial statements or bank statements for the past 6 months.",
    },
    {
      question: "How long does the loan approval process take?",
      answer:
        "The loan approval process typically takes 3-5 business days after all required documents have been submitted and verified.",
    },
    {
      question: "How do I update my bank details?",
      answer:
        'To update your bank details, go to your profile settings, select "Bank Details", and click on "Update". Enter your new bank information and save the changes.',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background py-16 md:py-24 overflow-hidden">
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/20 blur-3xl"
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
              className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-green-200/20 blur-3xl"
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
          </motion.div>

          <div className="container relative px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How can we help you?</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Find answers to your questions about FarmCredit's platform and services
                </p>
              </motion.div>
              <motion.div variants={fadeIn} className="w-full max-w-2xl">
                <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Ask our AI anything..."
                      className="w-full bg-white dark:bg-gray-950 pl-10 py-6 rounded-lg border-green-100 dark:border-green-800/30 focus-visible:ring-green-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 py-6" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Asking...
                      </>
                    ) : (
                      "Ask"
                    )}
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* AI Response Section */}
        {showAiResponse && (
          <section className="py-8 bg-white dark:bg-background" ref={responseRef}>
            <div className="container px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative max-w-3xl mx-auto"
              >
                <Card className="border-green-100 dark:border-green-800/30 shadow-md">
                  <CardHeader className="pb-2 flex flex-row justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-2 bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">AI Assistant</CardTitle>
                        <CardDescription>Powered by FarmCredit AI</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAiResponse(false)}
                      className="h-8 w-8 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
                        <span className="ml-3 text-lg">Thinking...</span>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line">{aiResponse}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
                    <p>
                      If you need more help, please send an email to{" "}
                      <a
                        href="mailto:support@farmcredit.site"
                        className="text-green-600 dark:text-green-400 hover:underline"
                      >
                        support@farmcredit.site
                      </a>
                    </p>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* Popular Topics */}
        <section className="py-12 md:py-16 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeIn} className="text-2xl font-bold tracking-tighter md:text-3xl">
                Popular Topics
              </motion.h2>
              <motion.p variants={fadeIn} className="max-w-[700px] text-muted-foreground">
                Quick answers to the most common questions
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {popularTopics.map((topic, index) => (
                <motion.div key={index} variants={cardVariants} whileHover="hover">
                  <Link href={topic.href} className="block h-full">
                    <Card className="h-full transition-all hover:border-green-200 dark:hover:border-green-800">
                      <CardHeader>
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-4">
                          {topic.icon}
                        </div>
                        <CardTitle>{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{topic.description}</CardDescription>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                          Learn more
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-12 md:py-16 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeIn} className="text-2xl font-bold tracking-tighter md:text-3xl">
                Browse by Category
              </motion.h2>
              <motion.p variants={fadeIn} className="max-w-[700px] text-muted-foreground">
                Find help articles organized by topic
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-8 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {categories.map((category, index) => (
                <motion.div key={index} variants={cardVariants} whileHover="hover">
                  <Link href={category.href} className="block h-full">
                    <Card className="h-full overflow-hidden transition-all hover:border-green-200 dark:hover:border-green-800">
                      <div className="aspect-video relative overflow-hidden">
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-xl font-bold">{category.title}</h3>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <p className="text-muted-foreground">{category.description}</p>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                          View all articles
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 md:py-16 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeIn} className="text-2xl font-bold tracking-tighter md:text-3xl">
                Frequently Asked Questions
              </motion.h2>
              <motion.p variants={fadeIn} className="max-w-[700px] text-muted-foreground">
                Quick answers to common questions
              </motion.p>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                >
                  <Tabs defaultValue="question" className="w-full">
                    <TabsList className="w-full bg-gray-100 dark:bg-gray-900/50 p-0 h-auto">
                      <TabsTrigger
                        value="question"
                        className="flex items-center justify-between w-full px-4 py-3 text-left data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950"
                      >
                        <span className="font-medium">{faq.question}</span>
                        <ChevronRight className="h-5 w-5 transform transition-transform data-[state=active]:rotate-90" />
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="question" className="px-4 py-3">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/help-center/all-faqs">
                <Button variant="outline" className="gap-2">
                  View All FAQs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-12 md:py-16 bg-green-600 dark:bg-green-800 text-white">
          <motion.div
            className="container px-4 md:px-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Still need help?</h2>
                <p className="text-green-100 max-w-[500px]">
                  Our support team is available to assist you with any questions or issues you may have.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Link href="/contact-us">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                    Contact Support
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
