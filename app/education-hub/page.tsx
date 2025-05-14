"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpen, Video, FileText, Award } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function EducationHub() {
  const courses = [
    {
      id: "financial-literacy",
      title: "Financial Literacy for Farmers",
      description: "Learn the basics of financial management for your agricultural business.",
      image: "/financial-literacy-training.jpeg",
      level: "Beginner",
      duration: "4 weeks",
      modules: 6,
      category: "finance",
    },
    {
      id: "modern-farming-techniques",
      title: "Modern Farming Techniques",
      description: "Discover sustainable and efficient farming methods to increase your yield.",
      image: "/modern-farming-techniques.jpeg",
      level: "Intermediate",
      duration: "6 weeks",
      modules: 8,
      category: "farming",
    },
    {
      id: "agricultural-loans",
      title: "Understanding Agricultural Loans",
      description: "Everything you need to know about applying for and managing farm loans.",
      image: "/understanding-agricultural-loans.jpeg",
      level: "Beginner",
      duration: "3 weeks",
      modules: 5,
      category: "finance",
    },
    {
      id: "crop-disease-management",
      title: "Crop Disease Management",
      description: "Identify and treat common crop diseases to protect your harvest.",
      image: "/crop-disease-management.jpeg",
      level: "Advanced",
      duration: "5 weeks",
      modules: 7,
      category: "farming",
    },
    {
      id: "farm-record-keeping",
      title: "Farm Record Keeping",
      description: "Learn how to maintain accurate records to improve your credit score.",
      image: "/farm-record-keeping.jpeg",
      level: "Beginner",
      duration: "2 weeks",
      modules: 4,
      category: "finance",
    },
    {
      id: "irrigation-systems",
      title: "Irrigation Systems for Small Farms",
      description: "Implement cost-effective irrigation solutions for your farm.",
      image: "/irrigation-systems.jpeg",
      level: "Intermediate",
      duration: "4 weeks",
      modules: 6,
      category: "farming",
    },
  ]

  const resources = [
    {
      title: "Farming Calendar",
      description: "Monthly guide for planting and harvesting in different Nigerian regions.",
      icon: FileText,
      type: "PDF Guide",
    },
    {
      title: "Loan Application Walkthrough",
      description: "Step-by-step video guide to completing your loan application.",
      icon: Video,
      type: "Video Tutorial",
    },
    {
      title: "Financial Planning Templates",
      description: "Downloadable templates to help manage your farm finances.",
      icon: FileText,
      type: "Templates",
    },
    {
      title: "Certification Programs",
      description: "Information on agricultural certifications to boost your credentials.",
      icon: Award,
      type: "Programs",
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
              className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-green-200/20 dark:bg-green-900/20 blur-3xl"
              initial={{ x: "-50%", y: "-50%" }}
              animate={{
                x: ["-50%", "-45%", "-50%", "-55%", "-50%"],
                y: ["-50%", "-45%", "-50%", "-55%", "-50%"],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 20,
                ease: "easeInOut",
              }}
            ></motion.div>
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-green-300/20 dark:bg-green-800/20 blur-3xl"
              initial={{ x: "50%", y: "50%" }}
              animate={{
                x: ["50%", "45%", "50%", "55%", "50%"],
                y: ["50%", "55%", "50%", "45%", "50%"],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 15,
                ease: "easeInOut",
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
                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
                  Education Hub
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-200">
                  Grow Your Knowledge, Grow Your Farm
                </h1>
                <p className="text-muted-foreground md:text-xl max-w-[42rem] mx-auto">
                  Access free educational resources designed to help Nigerian farmers improve their agricultural
                  practices and financial knowledge.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:translate-y-[-2px]"
                  >
                    Browse Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="transition-all duration-200 transform hover:translate-y-[-2px]"
                  >
                    View Resources
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Featured Courses</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Enhance your farming knowledge with our carefully curated courses.
                </p>
              </div>
            </div>

            <Tabs defaultValue="all" className="mt-12">
              <div className="flex justify-center overflow-x-auto pb-2">
                <TabsList className="flex flex-wrap justify-center">
                  <TabsTrigger value="all" className="flex-shrink-0">
                    All Courses
                  </TabsTrigger>
                  <TabsTrigger value="farming" className="flex-shrink-0">
                    Farming Techniques
                  </TabsTrigger>
                  <TabsTrigger value="finance" className="flex-shrink-0">
                    Financial Education
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="mt-8">
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {courses.map((course, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="aspect-video w-full overflow-hidden">
                          <Image
                            src={course.image || "/placeholder.svg"}
                            width={500}
                            height={300}
                            alt={course.title}
                            className="object-cover w-full h-full transition-transform hover:scale-105"
                            priority={index < 3}
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-800/20 dark:text-green-300">
                              {course.level}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <BookOpen className="mr-1 h-3 w-3" />
                              {course.modules} modules
                            </div>
                          </div>
                          <CardTitle className="mt-2">{course.title}</CardTitle>
                          <CardDescription>{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Duration: {course.duration}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/education-hub/${course.id}`} className="w-full">
                            <Button className="w-full bg-green-600 hover:bg-green-700">View Course</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
              <TabsContent value="farming" className="mt-8">
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {courses
                    .filter((course) => course.category === "farming")
                    .map((course, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="aspect-video w-full overflow-hidden">
                            <Image
                              src={course.image || "/placeholder.svg"}
                              width={500}
                              height={300}
                              alt={course.title}
                              className="object-cover w-full h-full transition-transform hover:scale-105"
                              priority={index < 2}
                            />
                          </div>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-800/20 dark:text-green-300">
                                {course.level}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <BookOpen className="mr-1 h-3 w-3" />
                                {course.modules} modules
                              </div>
                            </div>
                            <CardTitle className="mt-2">{course.title}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Duration: {course.duration}</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Link href={`/education-hub/${course.id}`} className="w-full">
                              <Button className="w-full bg-green-600 hover:bg-green-700">View Course</Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              </TabsContent>
              <TabsContent value="finance" className="mt-8">
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {courses
                    .filter((course) => course.category === "finance")
                    .map((course, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="aspect-video w-full overflow-hidden">
                            <Image
                              src={course.image || "/placeholder.svg"}
                              width={500}
                              height={300}
                              alt={course.title}
                              className="object-cover w-full h-full transition-transform hover:scale-105"
                              priority={index < 2}
                            />
                          </div>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-800/20 dark:text-green-300">
                                {course.level}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <BookOpen className="mr-1 h-3 w-3" />
                                {course.modules} modules
                              </div>
                            </div>
                            <CardTitle className="mt-2">{course.title}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Duration: {course.duration}</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Link href={`/education-hub/${course.id}`} className="w-full">
                              <Button className="w-full bg-green-600 hover:bg-green-700">View Course</Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              </TabsContent>
            </Tabs>

            <div className="mt-12 text-center">
              <Button variant="outline" size="lg">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Helpful Resources</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Download guides, templates, and watch tutorials to support your farming journey.
                </p>
              </div>
            </div>

            <motion.div
              className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {resources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="flex flex-col h-full">
                    <CardHeader>
                      <motion.div
                        className="rounded-full bg-green-100 p-3 w-fit dark:bg-green-800/20"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <resource.icon className="h-6 w-6 text-green-700 dark:text-green-400" />
                      </motion.div>
                      <CardTitle className="mt-4">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      {resource.title === "Farming Calendar" ? (
                        <a href="/resources/nigeria-farming-calendar.pdf" download className="w-full">
                          <Button variant="outline" className="w-full">
                            <span>{resource.type}</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </a>
                      ) : resource.title === "Financial Planning Templates" ? (
                        <a href="/resources/financial-planning-templates.pdf" download className="w-full">
                          <Button variant="outline" className="w-full">
                            <span>{resource.type}</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" className="w-full">
                          <span>{resource.type}</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                  Ready to Enhance Your Farming Knowledge?
                </h2>
                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of Nigerian farmers who are improving their skills and increasing their yields.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
