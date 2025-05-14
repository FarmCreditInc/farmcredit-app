"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Sprout } from "lucide-react"
import { motion } from "framer-motion"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)
  const [growthStage, setGrowthStage] = useState(0)

  useEffect(() => {
    setMounted(true)

    // Animate plant growth
    const timer = setTimeout(() => {
      setGrowthStage(1)

      const timer2 = setTimeout(() => {
        setGrowthStage(2)

        const timer3 = setTimeout(() => {
          setGrowthStage(3)
        }, 1000)

        return () => clearTimeout(timer3)
      }, 1000)

      return () => clearTimeout(timer2)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8 relative">
          {/* Animated plant growing from 404 */}
          <h1 className="text-8xl md:text-9xl font-bold text-green-600 dark:text-green-500 relative inline-block">
            4
            <span className="relative inline-block">
              <span className="text-8xl md:text-9xl font-bold text-green-600 dark:text-green-500">0</span>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full flex justify-center">
                {growthStage > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: growthStage > 2 ? 120 : growthStage > 1 ? 80 : 40 }}
                    transition={{ duration: 0.5 }}
                    className="w-1 bg-green-600 dark:bg-green-500 rounded-full"
                  />
                )}
              </div>
              {growthStage > 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-0"
                  style={{ bottom: growthStage > 2 ? "120px" : "80px" }}
                >
                  <Sprout className="text-green-600 dark:text-green-500" size={growthStage > 2 ? 48 : 32} />
                </motion.div>
              )}
            </span>
            4
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Page Not Found</h2>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
            The page you're looking for doesn't exist or has been moved. But like a seed in fertile soil, new
            opportunities await!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Return Home
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950"
            >
              <button onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </button>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto"
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Need help finding something?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Visit our help center or contact support for assistance.
          </p>
          <Button asChild variant="link" className="text-green-600 dark:text-green-500 p-0">
            <Link href="/help-center">Browse Help Center</Link>
          </Button>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-green-100 dark:bg-green-900/20 opacity-70" />
        <div className="absolute top-32 -right-16 w-48 h-48 rounded-full bg-green-100 dark:bg-green-900/20 opacity-70" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 opacity-50" />
      </div>
    </div>
  )
}
