"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Briefcase, Calendar, CheckCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Job data - in a real app, this would come from a database
const jobsData = [
  {
    id: "agri-finance-specialist",
    title: "Agricultural Finance Specialist",
    department: "Finance",
    location: "Lagos, Nigeria",
    type: "Full-time",
    postedDate: "May 1, 2023",
    description:
      "We're looking for an Agricultural Finance Specialist to develop and implement financial products tailored to the needs of Nigerian farmers.",
    responsibilities: [
      "Design and develop financial products specifically for agricultural needs",
      "Analyze market trends and farmer requirements to create innovative solutions",
      "Work with the risk team to establish appropriate lending criteria",
      "Collaborate with technology teams to implement financial products on our platform",
      "Evaluate the performance of financial products and recommend improvements",
    ],
    requirements: [
      "Bachelor's degree in Finance, Economics, Agriculture, or related field",
      "3+ years of experience in agricultural finance or related field",
      "Strong understanding of the Nigerian agricultural sector",
      "Excellent analytical and problem-solving skills",
      "Good communication and interpersonal abilities",
    ],
    featured: true,
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    postedDate: "April 15, 2023",
    description:
      "Join our engineering team to build intuitive and accessible user interfaces for our agricultural finance platform.",
    responsibilities: [
      "Develop responsive and accessible user interfaces using React and Next.js",
      "Collaborate with designers to implement UI/UX designs",
      "Write clean, maintainable, and efficient code",
      "Participate in code reviews and contribute to technical discussions",
      "Optimize applications for maximum speed and scalability",
    ],
    requirements: [
      "3+ years of experience with React and modern JavaScript",
      "Experience with Next.js and TypeScript",
      "Strong understanding of web accessibility standards",
      "Knowledge of responsive design principles",
      "Experience with version control systems (Git)",
    ],
    featured: true,
  },
  {
    id: "credit-risk-analyst",
    title: "Credit Risk Analyst",
    department: "Risk",
    location: "Abuja, Nigeria",
    type: "Full-time",
    postedDate: "April 20, 2023",
    description:
      "Help develop and refine our credit scoring models for assessing the creditworthiness of Nigerian farmers.",
    responsibilities: [
      "Develop and maintain credit risk models for agricultural lending",
      "Analyze data to identify patterns and trends in credit performance",
      "Collaborate with the product team to implement risk assessment tools",
      "Monitor and report on credit portfolio performance",
      "Stay updated on industry trends and regulatory requirements",
    ],
    requirements: [
      "Bachelor's degree in Statistics, Economics, Mathematics, or related field",
      "2+ years of experience in credit risk analysis",
      "Strong analytical and statistical skills",
      "Experience with data analysis tools and programming languages",
      "Knowledge of credit scoring methodologies",
    ],
    featured: true,
  },
  {
    id: "farmer-relations",
    title: "Farmer Relations Coordinator",
    department: "Operations",
    location: "Kano, Nigeria",
    type: "Full-time",
    postedDate: "April 10, 2023",
    description:
      "Work directly with farmers to understand their needs and ensure our platform meets their requirements.",
    responsibilities: [
      "Build and maintain relationships with farmers and farming communities",
      "Gather feedback on platform features and financial products",
      "Conduct training sessions on using the platform",
      "Identify opportunities to improve farmer experience",
      "Collaborate with product teams to implement farmer-requested features",
    ],
    requirements: [
      "Bachelor's degree in Agriculture, Business, or related field",
      "2+ years of experience working with agricultural communities",
      "Strong communication and interpersonal skills",
      "Ability to travel to rural areas",
      "Knowledge of Nigerian agricultural practices and challenges",
    ],
  },
  {
    id: "marketing-specialist",
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Lagos, Nigeria",
    type: "Full-time",
    postedDate: "April 5, 2023",
    description: "Develop and implement marketing strategies to reach and educate Nigerian farmers about our platform.",
    responsibilities: [
      "Create and execute marketing campaigns targeting farmers and agricultural communities",
      "Develop content for various channels including social media, email, and print",
      "Organize and participate in agricultural events and trade shows",
      "Analyze marketing metrics and adjust strategies accordingly",
      "Collaborate with the product team to gather user testimonials and success stories",
    ],
    requirements: [
      "Bachelor's degree in Marketing, Communications, or related field",
      "2+ years of experience in marketing, preferably in agriculture or fintech",
      "Strong content creation and copywriting skills",
      "Experience with digital marketing tools and analytics",
      "Understanding of rural marketing challenges in Nigeria",
    ],
  },
]

export default function JobDetail({ params }: { params: { jobId: string } }) {
  const router = useRouter()
  const { jobId } = params

  const job = jobsData.find((j) => j.id === jobId)

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null as File | null,
    coverLetter: "",
    submitted: false,
    error: "",
  })

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-12">
          <Alert variant="destructive">
            <AlertTitle>Job Not Found</AlertTitle>
            <AlertDescription>
              The job you're looking for doesn't exist. Please go back to the careers page.
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Link href="/careers">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Careers
              </Button>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formState.name || !formState.email || !formState.phone || !formState.coverLetter) {
      setFormState((prev) => ({ ...prev, error: "Please fill in all required fields" }))
      return
    }

    // In a real app, you would submit the form data to your backend
    // For now, we'll just simulate a successful submission
    setFormState((prev) => ({ ...prev, submitted: true, error: "" }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormState((prev) => ({ ...prev, resume: e.target.files![0] }))
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Job Header */}
        <section className="bg-green-50 dark:bg-green-950/10 py-12">
          <div className="container px-4 md:px-6">
            <div className="mb-6">
              <Link href="/careers" className="inline-flex items-center text-green-600 hover:text-green-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Careers
              </Link>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                >
                  {job.department}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Posted: {job.postedDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Apply for this position
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Job Details */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Job Description</h2>
                  <p className="text-muted-foreground">{job.description}</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Responsibilities</h2>
                  <ul className="space-y-2 list-disc pl-5">
                    {job.responsibilities.map((item, index) => (
                      <li key={index} className="text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                  <ul className="space-y-2 list-disc pl-5">
                    {job.requirements.map((item, index) => (
                      <li key={index} className="text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>About FarmCredit</CardTitle>
                    <CardDescription>
                      Empowering Nigerian youth farmers with access to finance through innovative credit scoring and
                      loan facilitation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative h-48 w-full overflow-hidden rounded-md">
                      <Image src="/placeholder.svg?key=s2bos" alt="FarmCredit team" fill className="object-cover" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Competitive Salary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Remote Work Options</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Professional Development</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Health Insurance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Meaningful Work</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="application-form" className="py-12 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center">Apply for {job.title}</h2>

              {formState.submitted ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold">Application Submitted</h3>
                      <p className="text-muted-foreground">
                        Thank you for applying for the {job.title} position. We'll review your application and get back
                        to you soon.
                      </p>
                      <Button onClick={() => router.push("/careers")} className="mt-4">
                        Back to Careers
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formState.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{formState.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formState.name}
                        onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formState.email}
                        onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formState.phone}
                        onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="resume">Resume/CV</Label>
                      <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                      <p className="text-sm text-muted-foreground mt-1">Accepted formats: PDF, DOC, DOCX</p>
                    </div>

                    <div>
                      <Label htmlFor="coverLetter">Cover Letter *</Label>
                      <Textarea
                        id="coverLetter"
                        rows={6}
                        value={formState.coverLetter}
                        onChange={(e) => setFormState((prev) => ({ ...prev, coverLetter: e.target.value }))}
                        required
                        placeholder="Tell us why you're interested in this position and what makes you a good fit."
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Submit Application
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
