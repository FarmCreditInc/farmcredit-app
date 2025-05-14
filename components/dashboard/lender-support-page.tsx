"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, ChevronUp, Send, Paperclip, X, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { submitSupportTicket } from "@/actions/support-actions"

// FAQ data structure for lenders
const faqData = [
  {
    category: "Investment & Funding",
    questions: [
      {
        question: "How do I fund my wallet?",
        answer:
          "To fund your wallet, navigate to the 'Wallet' section in your dashboard and click on 'Top Up'. You can use various payment methods including bank transfers and card payments through our secure payment gateway. Once your payment is confirmed, your wallet balance will be updated immediately.",
      },
      {
        question: "What is the minimum investment amount?",
        answer:
          "The minimum investment amount is ₦50,000 per loan. This threshold ensures that farmers receive meaningful funding while allowing lenders to diversify their investments across multiple opportunities. You can invest larger amounts in increments of ₦10,000.",
      },
    ],
  },
  {
    category: "Loan Management",
    questions: [
      {
        question: "How are loan applications vetted?",
        answer:
          "All farmer loan applications undergo a thorough vetting process. Our team verifies farm ownership, production history, and creditworthiness. We also conduct physical farm visits and assess the viability of the proposed agricultural project. Only applications that meet our strict criteria are presented to lenders.",
      },
      {
        question: "What happens if a farmer defaults?",
        answer:
          "We have a robust recovery process in place. First, we work with farmers to restructure payments if they're experiencing temporary difficulties. If necessary, we utilize our insurance partnerships and guarantee fund to ensure lenders recover their investments. Our current recovery rate is over 95%. You'll be kept informed throughout the process.",
      },
    ],
  },
  {
    category: "Returns & Withdrawals",
    questions: [
      {
        question: "How do I withdraw my returns?",
        answer:
          "When a loan is fully repaid, the principal and interest are credited to your wallet. To withdraw funds, go to the 'Transactions' section of your dashboard and click 'Withdraw'. Enter the amount you wish to withdraw and confirm. Funds will be transferred to your registered bank account within 1-2 business days.",
      },
      {
        question: "What returns can I expect on my investments?",
        answer:
          "Returns vary based on the loan type, duration, and risk profile. Typically, our agricultural loans offer annual returns between 15-25%. Short-term loans (3-6 months) generally have lower returns than long-term loans (12-24 months). Each loan opportunity clearly displays the expected return rate before you invest.",
      },
    ],
  },
  {
    category: "Account Management",
    questions: [
      {
        question: "How do I update my profile information?",
        answer:
          "To update your profile information, go to the 'Settings' page in your dashboard. There you can edit your personal details, contact information, and bank details. Remember to click 'Save Changes' after making any updates. For security reasons, some changes may require additional verification.",
      },
      {
        question: "Can I choose which farmers to fund?",
        answer:
          "Yes, you have full control over your investments. You can browse through vetted loan applications and choose specific farmers based on their profiles, farm details, and loan purposes. You can also set up automatic investment criteria based on factors like crop type, loan duration, or expected return.",
      },
    ],
  },
]

export function LenderSupportPage() {
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

      // Add user type to formData
      formData.set("userType", "lender")

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
                    <SelectItem value="Investment Questions">Investment Questions</SelectItem>
                    <SelectItem value="Wallet & Payments">Wallet & Payments</SelectItem>
                    <SelectItem value="Loan Management">Loan Management</SelectItem>
                    <SelectItem value="Technical Support">Technical Support</SelectItem>
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
  )
}
