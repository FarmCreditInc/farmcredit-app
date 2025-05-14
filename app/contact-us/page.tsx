"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Send, MapPin, Phone, Mail, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function ContactUsPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus("submitting")

    try {
      // In a real implementation, you would send this data to your backend
      // For example using fetch or axios
      console.log("Sending form data to chideraozigbo@gmail.com:", formData)

      // Simulate form submission
      setTimeout(() => {
        setFormStatus("success")
        setFormData({ name: "", email: "", subject: "", message: "" })

        // Reset form status after 3 seconds
        setTimeout(() => setFormStatus("idle"), 3000)
      }, 1500)
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormStatus("error")
      setTimeout(() => setFormStatus("idle"), 3000)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Site Header */}
      <SiteHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/20 blur-3xl"></div>
            <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-green-200/20 blur-3xl"></div>
          </div>
          <div className="container relative px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/30 dark:text-green-300 mb-4"
              >
                Contact Us
              </motion.div>
              <motion.h1
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300 mb-4 md:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Get in Touch with <br className="hidden sm:inline" />
                FarmCredit
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-muted-foreground mb-6 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                We're here to answer your questions and help you succeed in your farming journey.
              </motion.p>
            </motion.div>
          </div>

          {/* Decorative wave at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-green-100 via-white to-green-100 dark:from-green-900/20 dark:via-transparent dark:to-green-900/20 opacity-50"></div>
        </section>

        {/* Contact Form and Info Section */}
        <section className="py-12 md:py-16 lg:py-24 container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="order-2 lg:order-1"
            >
              <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6">
                Send Us a Message
              </motion.h2>
              <motion.p variants={itemVariants} className="text-muted-foreground mb-6 md:mb-8">
                Fill out the form below and our team will get back to you as soon as possible.
              </motion.p>

              <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1 md:mb-2">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full"
                      disabled={formStatus === "submitting"}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 md:mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full"
                      disabled={formStatus === "submitting"}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1 md:mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                      className="w-full"
                      disabled={formStatus === "submitting"}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1 md:mb-2">
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry..."
                      rows={4}
                      required
                      className="w-full"
                      disabled={formStatus === "submitting"}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-2 h-auto min-h-[44px] text-base"
                  disabled={formStatus === "submitting" || formStatus === "success"}
                >
                  {formStatus === "submitting" ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : formStatus === "success" ? (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Message Sent!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </Button>

                {formStatus === "success" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-600 text-center mt-4"
                  >
                    Thank you for your message! We'll get back to you soon.
                  </motion.p>
                )}

                {formStatus === "error" && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-center mt-4">
                    There was an error sending your message. Please try again.
                  </motion.p>
                )}
              </motion.form>
            </motion.div>

            {/* Contact Information */}
            <div className="order-1 lg:order-2">
              <motion.h2
                className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Contact Information
              </motion.h2>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <motion.div variants={cardVariants}>
                  <Card className="h-full">
                    <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Our Location</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        123 Farming Avenue
                        <br />
                        Lagos, Nigeria
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="h-full">
                    <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Phone Number</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        +234 800 000 0000
                        <br />
                        Mon-Fri, 9am-5pm WAT
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="h-full">
                    <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4">
                        <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Email Address</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        info@farmcredit.ng
                        <br />
                        support@farmcredit.site
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="h-full">
                    <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"
                        >
                          <path d="M12 2v2"></path>
                          <path d="M12 20v2"></path>
                          <path d="m4.93 4.93 1.41 1.41"></path>
                          <path d="m17.66 17.66 1.41 1.41"></path>
                          <path d="M2 12h2"></path>
                          <path d="M20 12h2"></path>
                          <path d="m6.34 17.66-1.41 1.41"></path>
                          <path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Business Hours</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Monday - Friday
                        <br />
                        9:00 AM - 5:00 PM WAT
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4">
            <motion.div
              className="text-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto px-2">
                Find quick answers to common questions about contacting and working with FarmCredit.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {[
                {
                  question: "How quickly will I receive a response?",
                  answer:
                    "We aim to respond to all inquiries within 24-48 business hours. For urgent matters, please call our customer service line.",
                },
                {
                  question: "Can I visit your office in person?",
                  answer:
                    "Yes, you can visit our office during business hours. We recommend scheduling an appointment in advance to ensure someone is available to assist you.",
                },
                {
                  question: "Do you offer support in local languages?",
                  answer:
                    "Yes, our team can provide support in English, Yoruba, Hausa, and Igbo to better serve our diverse farming community.",
                },
                {
                  question: "How can I become a partner?",
                  answer:
                    "For partnership inquiries, please email us at partnerships@farmcredit.ng with details about your organization and proposed collaboration.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6"
                >
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{faq.question}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          className="py-12 md:py-16 lg:py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center max-w-4xl mx-auto">
              <motion.h2
                className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Ready to Transform Your Farming Business?
              </motion.h2>
              <motion.p
                className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Join thousands of Nigerian farmers who are growing their businesses with access to finance, education,
                and support.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
              >
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto py-2 h-auto min-h-[44px] text-base">
                    Apply Now
                  </Button>
                </Link>
                <Link href="/about-us" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto py-2 h-auto min-h-[44px] text-base">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Site Footer */}
      <SiteFooter />
    </div>
  )
}
