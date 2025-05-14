import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BookOpen, Clock, Award } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// This would typically come from a database or API
const getCourseData = (courseId: string) => {
  const courses = {
    "financial-literacy": {
      title: "Financial Literacy for Farmers",
      description: "Learn the basics of financial management for your agricultural business.",
      image: "/financial-literacy-training.jpeg",
      level: "Beginner",
      duration: "4 weeks",
      modules: 6,
      instructor: {
        name: "Dr. Obinna Ezeocha",
        role: "Agricultural Finance Specialist",
        image: "/images/dr-obinna-ezeocha.jpeg",
      },
      overview:
        "This course is designed to help farmers understand the fundamentals of financial management for their agricultural businesses. You'll learn how to create budgets, track expenses, understand financial statements, and make informed financial decisions.",
      topics: [
        "Introduction to Agricultural Finance",
        "Creating Farm Budgets",
        "Record Keeping and Financial Statements",
        "Understanding Credit and Loans",
        "Risk Management and Insurance",
        "Tax Planning for Farmers",
      ],
      requirements: ["Basic numeracy skills", "Interest in improving farm financial management"],
    },
    "modern-farming-techniques": {
      title: "Modern Farming Techniques",
      description: "Discover sustainable and efficient farming methods to increase your yield.",
      image: "/modern-farming-techniques.jpeg",
      level: "Intermediate",
      duration: "6 weeks",
      modules: 8,
      instructor: {
        name: "Mrs. Funmi Adebanjo",
        role: "Agricultural Extension Officer",
        image: "/images/mrs-funmi-adebanjo.jpeg",
      },
      overview:
        "This course introduces farmers to modern, sustainable farming techniques that can increase yields while preserving natural resources. You'll learn about precision agriculture, integrated pest management, conservation tillage, and more.",
      topics: [
        "Introduction to Sustainable Agriculture",
        "Precision Farming Technologies",
        "Integrated Pest Management",
        "Conservation Tillage Methods",
        "Crop Rotation and Diversification",
        "Water Conservation Techniques",
        "Soil Health Management",
        "Post-Harvest Technologies",
      ],
      requirements: ["Basic farming experience", "Access to farmland for practical exercises"],
    },
    "agricultural-loans": {
      title: "Understanding Agricultural Loans",
      description: "Everything you need to know about applying for and managing farm loans.",
      image: "/understanding-agricultural-loans.jpeg",
      level: "Beginner",
      duration: "3 weeks",
      modules: 5,
      instructor: {
        name: "Mr. Ayodele Ighodalo",
        role: "Agricultural Credit Specialist",
        image: "/images/mr-ayodele-ighodalo.jpeg",
      },
      overview:
        "This course provides farmers with comprehensive knowledge about agricultural loans, from application to repayment. You'll learn about different types of loans available, how to prepare a strong application, and strategies for successful loan management.",
      topics: [
        "Types of Agricultural Loans",
        "Loan Eligibility Requirements",
        "Preparing a Strong Loan Application",
        "Understanding Loan Terms and Conditions",
        "Loan Repayment Strategies",
      ],
      requirements: ["Basic financial literacy", "Interest in obtaining agricultural financing"],
    },
    "crop-disease-management": {
      title: "Crop Disease Management",
      description: "Identify and treat common crop diseases to protect your harvest.",
      image: "/crop-disease-management.jpeg",
      level: "Advanced",
      duration: "5 weeks",
      modules: 7,
      instructor: {
        name: "Prof. Nneka Okafor",
        role: "Plant Pathologist",
        image: "/images/prof-nneka-okafor.jpeg",
      },
      overview:
        "This advanced course teaches farmers how to identify, prevent, and treat common crop diseases. You'll learn about disease cycles, early detection methods, integrated disease management, and both chemical and biological control options.",
      topics: [
        "Introduction to Plant Pathology",
        "Common Crop Diseases in Nigeria",
        "Disease Identification Techniques",
        "Preventive Measures and Cultural Practices",
        "Chemical Control Methods",
        "Biological Control Options",
        "Integrated Disease Management",
      ],
      requirements: ["Intermediate farming experience", "Basic knowledge of crop production"],
    },
    "farm-record-keeping": {
      title: "Farm Record Keeping",
      description: "Learn how to maintain accurate records to improve your credit score.",
      image: "/farm-record-keeping.jpeg",
      level: "Beginner",
      duration: "2 weeks",
      modules: 4,
      instructor: {
        name: "Mr. Tanko Musa Danjuma",
        role: "Agricultural Business Consultant",
        image: "/images/mr-tanko-musa-danjuma.jpeg",
      },
      overview:
        "This course focuses on the importance of accurate record keeping for farm management and credit access. You'll learn practical methods for tracking production, sales, expenses, and profits, as well as how good records can improve your creditworthiness.",
      topics: [
        "Importance of Farm Records",
        "Types of Farm Records",
        "Record Keeping Systems and Tools",
        "Using Records for Decision Making",
      ],
      requirements: ["Basic literacy and numeracy skills", "Interest in improving farm management"],
    },
    "irrigation-systems": {
      title: "Irrigation Systems for Small Farms",
      description: "Implement cost-effective irrigation solutions for your farm.",
      image: "/irrigation-systems.jpeg",
      level: "Intermediate",
      duration: "4 weeks",
      modules: 6,
      instructor: {
        name: "Chidera Ozigbo",
        role: "Irrigation Engineer",
        image: "/images/chidera-ozigbo.jpeg",
      },
      overview:
        "This course introduces farmers to various irrigation systems suitable for small-scale farming. You'll learn how to assess your water needs, select appropriate irrigation methods, and implement cost-effective solutions that conserve water while maximizing crop yields.",
      topics: [
        "Water Requirements for Different Crops",
        "Types of Irrigation Systems",
        "Drip Irrigation for Small Farms",
        "Rainwater Harvesting Techniques",
        "Irrigation Scheduling and Management",
        "Maintenance of Irrigation Systems",
      ],
      requirements: ["Access to farmland", "Basic understanding of water resources"],
    },
  }

  return courses[courseId as keyof typeof courses]
}

export default function CourseDetail({ params }: { params: { courseId: string } }) {
  const course = getCourseData(params.courseId)

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container px-4 md:px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Course Not Found</h1>
            <p className="mt-4">The course you're looking for doesn't exist or has been removed.</p>
            <Link href="/education-hub">
              <Button className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Education Hub
              </Button>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Course Hero */}
        <section className="relative bg-green-50 dark:bg-green-950/10 py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-4">
                <Link href="/education-hub" className="inline-flex items-center text-green-600 hover:text-green-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Courses
                </Link>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{course.title}</h1>
                <p className="text-muted-foreground md:text-xl">{course.description}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center text-sm">
                    <BookOpen className="mr-1 h-4 w-4 text-green-600" />
                    <span>{course.modules} Modules</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-1 h-4 w-4 text-green-600" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Award className="mr-1 h-4 w-4 text-green-600" />
                    <span>{course.level}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Enroll Now (Free)
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  width={800}
                  height={450}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                    <CardDescription>What you'll learn in this course</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{course.overview}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="curriculum" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>Topics covered in this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {course.topics.map((topic, index) => (
                        <li key={index} className="flex items-start">
                          <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-800">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{topic}</h3>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meet Your Instructor</CardTitle>
                    <CardDescription>Learn from experienced professionals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className="relative h-24 w-24 overflow-hidden rounded-full">
                        <Image
                          src={course.instructor.image || "/placeholder.svg"}
                          alt={course.instructor.name}
                          width={96}
                          height={96}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{course.instructor.name}</h3>
                        <p className="text-muted-foreground">{course.instructor.role}</p>
                        <p className="mt-2">
                          An experienced professional with extensive knowledge in {course.title.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="requirements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Requirements</CardTitle>
                    <CardDescription>What you need before starting this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {course.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Related Courses */}
        <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/20">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold tracking-tighter md:text-3xl mb-8">Related Courses</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* This would typically be dynamically generated based on related courses */}
              <Card className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src="/financial-literacy-training.jpeg"
                    width={350}
                    height={200}
                    alt="Financial Literacy for Farmers"
                    className="object-cover transition-transform hover:scale-105"
                    unoptimized
                  />
                </div>
                <CardHeader>
                  <CardTitle className="mt-2">Financial Literacy for Farmers</CardTitle>
                  <CardDescription>
                    Learn the basics of financial management for your agricultural business.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration: 4 weeks</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src="/modern-farming-techniques.jpeg"
                    width={350}
                    height={200}
                    alt="Modern Farming Techniques"
                    className="object-cover transition-transform hover:scale-105"
                    unoptimized
                  />
                </div>
                <CardHeader>
                  <CardTitle className="mt-2">Modern Farming Techniques</CardTitle>
                  <CardDescription>
                    Discover sustainable and efficient farming methods to increase your yield.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration: 6 weeks</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src="/farm-record-keeping.jpeg"
                    width={350}
                    height={200}
                    alt="Farm Record Keeping"
                    className="object-cover transition-transform hover:scale-105"
                    unoptimized
                  />
                </div>
                <CardHeader>
                  <CardTitle className="mt-2">Farm Record Keeping</CardTitle>
                  <CardDescription>
                    Learn how to maintain accurate records to improve your credit score.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration: 2 weeks</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
