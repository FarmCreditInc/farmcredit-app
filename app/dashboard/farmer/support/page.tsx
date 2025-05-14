"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, ChevronUp, Send, Paperclip, X, Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { submitSupportTicket } from "@/actions/support-actions"

// FAQ data structure
const faqData = [
  {
    category: "Loan Applications",
    questions: [
      {
        question: "How do I apply for a loan?",
        answer:
          "To apply for a loan, navigate to the 'Loan Application' section in your dashboard. Fill out the required information about your farming operation, loan purpose, and requested amount. Upload any necessary documents such as your business plan and collateral information. Once submitted, your application will be reviewed by our team.",
      },
      {
        question: "What documents do I need to provide for a loan application?",
        answer:
          "For a loan application, you typically need to provide: 1) A valid ID document, 2) Proof of farm ownership or lease agreement, 3) Business plan or farming proposal, 4) Sales records (if available), 5) Collateral documentation (if applicable), and 6) Bank statements or financial records. The specific requirements may vary based on the loan amount and purpose.",
      },
    ],
  },
  {
    category: "Account Management",
    questions: [
      {
        question: "How can I update my profile information?",
        answer:
          "To update your profile information, go to the 'Settings' page in your dashboard. There you can edit your personal details, contact information, farm details, and upload new documents. Remember to click 'Save Changes' after making any updates.",
      },
      {
        question: "What should I do if I forget my password?",
        answer:
          "If you forget your password, click on the 'Forgot Password' link on the login page. Enter the email address associated with your account, and you'll receive instructions to reset your password. If you don't receive the email, check your spam folder or contact our support team.",
      },
    ],
  },
  {
    category: "Repayments",
    questions: [
      {
        question: "What happens if I miss a loan repayment?",
        answer:
          "If you miss a loan repayment, you'll receive a notification reminding you to make the payment. A grace period of 3-5 days is typically provided. After that, late fees may apply, and continued missed payments could affect your credit score and eligibility for future loans. If you anticipate difficulty making a payment, contact our support team immediately to discuss possible arrangements.",
      },
      {
        question: "How can I view my repayment schedule?",
        answer:
          "You can view your repayment schedule in the 'Loan History' section of your dashboard. Select the specific loan to see detailed information about upcoming payments, including due dates and amounts. You can also download a PDF of your repayment schedule for your records.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "What should I do if I encounter an error on the platform?",
        answer:
          "If you encounter an error on the platform, first try refreshing the page or logging out and back in. If the issue persists, take a screenshot of the error message and submit a support ticket through the 'Support' section of your dashboard. Include details about what you were doing when the error occurred to help our technical team resolve the issue quickly.",
      },
      {
        question: "How secure is my data on the platform?",
        answer:
          "We take data security very seriously. All data transmitted to and from our platform is encrypted using industry-standard SSL/TLS protocols. We implement strict access controls, regular security audits, and follow best practices for data protection. Your financial and personal information is stored securely and never shared with unauthorized third parties.",
      },
    ],
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({})
  const [filteredFAQs, setFilteredFAQs] = useState(faqData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Filter FAQs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFAQs(faqData)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = faqData
      .map((category) => {
        const filteredQuestions = category.questions.filter(
          (q) => q.question.toLowerCase().includes(query) || q.answer.toLowerCase().includes(query),
        )
        return filteredQuestions.length > 0 ? { ...category, questions: filteredQuestions } : null
      })
      .filter(Boolean) as typeof faqData

    setFilteredFAQs(filtered)
  }, [searchQuery])

  // Toggle question expansion
  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`
    setExpandedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("userType", "farmer") // Add user type to identify farmer support tickets

      // Add file to formData if selected
      if (selectedFile) {
        formData.set("attachment", selectedFile)
      }

      const result = await submitSupportTicket(formData)

      if (result.success) {
        toast({
          title: "Support Ticket Submitted",
          description: result.message,
          variant: "default",
        })

        // Reset form
        setSelectedFile(null)
        if (formRef.current) {
          formRef.current.reset()
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit support ticket. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting support ticket:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support & Help Center</h1>
        <p className="text-muted-foreground">Get help with your account, loans, and farming questions</p>
      </div>

      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="ticket">Submit a Support Ticket</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Search FAQs</CardTitle>
              <CardDescription>Find answers to common questions</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for questions or keywords..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                    Clear search
                  </Button>
                </div>
              ) : (
                filteredFAQs.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3">
                    <h3 className="font-semibold text-lg">{category.category}</h3>
                    <div className="space-y-2">
                      {category.questions.map((item, questionIndex) => {
                        const key = `${categoryIndex}-${questionIndex}`
                        const isExpanded = expandedQuestions[key] || false

                        return (
                          <div key={questionIndex} className="border rounded-lg overflow-hidden">
                            <button
                              className="flex items-center justify-between w-full p-4 text-left bg-muted/50 hover:bg-muted"
                              onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                            >
                              <span className="font-medium">{item.question}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="p-4 bg-background">
                                <p className="text-muted-foreground">{item.answer}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Submit a support ticket for personalized assistance.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ticket">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>Our support team will respond to your inquiry as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Issue Category
                  </label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Account Issues">Account Issues</SelectItem>
                      <SelectItem value="Loan Application">Loan Application</SelectItem>
                      <SelectItem value="Loan Repayment">Loan Repayment</SelectItem>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Document Verification">Document Verification</SelectItem>
                      <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    placeholder="Please describe your issue in detail..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="attachment" className="text-sm font-medium">
                    Attachment (Optional)
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-4 w-4 mr-2" />
                        {selectedFile ? "Change File" : "Attach File"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="attachment"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                      <span className="text-sm text-muted-foreground">
                        Max size: 5MB. Supported formats: Images, PDF, Word, Excel
                      </span>
                    </div>

                    {selectedFile && (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="h-6 w-6 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="border-t pt-6 flex flex-col items-start">
              <p className="text-sm text-muted-foreground mb-2">
                Our support team typically responds within 24-48 hours during business days.
              </p>
              <p className="text-sm text-muted-foreground">
                For urgent matters, please contact us directly at support@farmcredit.ng
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
