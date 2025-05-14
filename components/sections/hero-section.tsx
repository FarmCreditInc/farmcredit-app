"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, Sprout, CreditCard, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 50, delay: 0.5 },
    },
  }

  const floatingAnimation = {
    y: ["-5px", "5px"],
    transition: {
      y: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  }

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      scale: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-200 dark:bg-green-900/20 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-yellow-200 dark:bg-yellow-900/20 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="flex flex-col justify-center space-y-6">
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium text-sm mb-2">
                Transforming Agricultural Finance
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300">
                Empowering Nigerian Youth Farmers with Access to Finance
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Build your credit profile, access loans, and grow your agricultural business with our innovative
                platform.
              </p>
            </motion.div>

            <motion.div className="flex flex-col gap-3 min-[400px]:flex-row" variants={itemVariants}>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 group relative overflow-hidden" asChild>
                <Link href="/auth/signup">
                  <span className="relative z-10 flex items-center">
                    Get Started
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
                <a href="#how-it-works" className="flex items-center">
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

            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8" variants={itemVariants}>
              <motion.div
                className="flex items-center gap-3 p-4 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-green-100 dark:border-green-900/30 shadow-sm"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                animate={floatingAnimation}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Easy Registration</h3>
                  <p className="text-xs text-muted-foreground">Simple 3-step process</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-4 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-green-100 dark:border-green-900/30 shadow-sm"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                animate={floatingAnimation}
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Credit Scoring</h3>
                  <p className="text-xs text-muted-foreground">Fair & transparent</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-4 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-green-100 dark:border-green-900/30 shadow-sm"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                animate={floatingAnimation}
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Loan Access</h3>
                  <p className="text-xs text-muted-foreground">Competitive rates</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div className="relative flex items-center justify-center" variants={imageVariants}>
            <motion.div
              className="relative h-[420px] w-full overflow-hidden rounded-2xl shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              animate={pulseAnimation}
            >
              <Image
                src="/images/nigerian-women-farmers.jpeg"
                width={550}
                height={420}
                alt="Nigerian women farmers working together in a field"
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-900/40 to-transparent" />

              {/* Animated elements overlaid on the image */}
              <motion.div
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-gray-900/90 text-sm font-medium shadow-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                <span>500+ Farmers Funded</span>
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute -bottom-6 -left-6 h-auto w-64 rounded-lg bg-gradient-to-r from-green-600 to-green-500 p-4 shadow-xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, type: "spring" }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex flex-col gap-2">
                <div className="text-xs text-green-100">Credit Score</div>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-white">650</div>
                  <div className="text-xl text-white/80">/850</div>
                  <motion.div
                    className="ml-2 h-1.5 w-24 bg-white/30 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: "6rem" }}
                    transition={{ delay: 1.5, duration: 1 }}
                  >
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "67%" }}
                      transition={{ delay: 1.5, duration: 1.5 }}
                    ></motion.div>
                  </motion.div>
                </div>
                <div className="text-sm text-green-100">Eligible for up to ₦250,000</div>
                <motion.div
                  className="mt-1 text-xs text-green-100 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-300 mr-1"></span>
                  <span>Score range: 350-850</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Add a decorative element at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-green-100 via-white to-green-100 dark:from-green-900/20 dark:via-transparent dark:to-green-900/20 opacity-50"></div>
    </section>
  )
}
