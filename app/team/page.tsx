"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Linkedin, Twitter, Mail, Leaf, Users, LightbulbIcon } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export default function Team() {
  const leadership = [
    {
      name: "Ozigbo Chidera",
      role: "Chief Technology Officer",
      bio: "Chidera leads our technology team as CTO, bringing extensive experience in software engineering and fintech solutions. He oversees the development of our platform architecture and ensures robust security measures for our financial services.",
      image: "/images/chidera-ozigbo.jpeg",
      expertise: ["Software Engineering", "Fintech", "Security"],
    },
    {
      name: "Nancy Amandi",
      role: "Head of Data Infrastructure",
      bio: "Nancy leads our data engineering efforts, designing and implementing the data pipelines and infrastructure that power our credit scoring algorithms and financial analytics for Nigerian farmers.",
      image: "/images/nancy-amandi.jpeg",
      expertise: ["Data Engineering", "Analytics", "Infrastructure"],
    },
    {
      name: "Frank Felix",
      role: "Lead AI/ML Scientist",
      bio: "Frank heads our artificial intelligence and machine learning initiatives, developing innovative algorithms that assess creditworthiness based on agricultural data and help farmers optimize their financial decisions.",
      image: "/images/frank-felix.jpeg",
      expertise: ["Machine Learning", "AI", "Credit Scoring"],
    },
    {
      name: "Oluwatobi Afintinni",
      role: "Financial Data Analytics Manager",
      bio: "Oluwatobi transforms complex agricultural and financial data into actionable insights, helping both farmers and lenders make informed decisions through advanced analytics and visualization tools.",
      image: "/images/oluwatobi-afintinni.jpeg",
      expertise: ["Data Analytics", "Visualization", "Financial Modeling"],
    },
  ]

  // Define board members with direct image URLs to ensure they display properly
  const boardMembers = [
    {
      name: "Dr. Obinna Ezeocha",
      role: "Board Chairman",
      bio: "Former Governor, Central Bank of Nigeria. With a robust background in macroeconomic planning and digital banking reforms, Dr. Ezeocha has championed rural financial inclusion initiatives and led nationwide credit access campaigns targeting underserved communities.",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr.%20Obinna%20Ezeocha-7W1zdqSfKi7PifushxFGt98lZwKviy.jpeg",
      expertise: ["Macroeconomic Planning", "Digital Banking", "Financial Inclusion"],
    },
    {
      name: "Mrs. Funmi Adebanjo",
      role: "Board Member",
      bio: "Agribusiness Economist and Co-founder of GreenGrow Africa. Mrs. Adebanjo has over 20 years of experience advising agritech startups and cooperative societies. She brings deep expertise in agricultural value chains and microfinance strategies tailored for youth farmers.",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mrs.%20Funmi%20Adebanjo-35P12kz0aXWRjm5NSpExG34tfyxt8C.jpeg",
      expertise: ["Agricultural Value Chains", "Microfinance", "Agritech"],
    },
    {
      name: "Mr. Tanko Musa Danjuma",
      role: "Board Member",
      bio: "Retired Executive Director, Nigerian Agricultural Credit Bank. A respected figure in rural finance, Mr. Danjuma has helped design loan schemes for over 10,000 smallholder farmers and sits on advisory boards for several regional cooperatives across Northern Nigeria.",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mr.%20Tanko%20Musa%20Danjuma-Zt6hxG1xvpgaxfsUPE9pmGz4ziQ62b.jpeg",
      expertise: ["Rural Finance", "Loan Schemes", "Cooperative Development"],
    },
    {
      name: "Prof. Nneka Okafor",
      role: "Board Member",
      bio: "Professor of Agricultural Finance, University of Ibadan. Prof. Okafor has authored several publications on risk assessment and credit scoring for youth-led farms. Her work bridges academia, field research, and fintech product design.",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Prof.%20Nneka%20Okafor-dOQPZDyOSo3YpNxWXiOcO20XNTJAOk.jpeg",
      expertise: ["Risk Assessment", "Credit Scoring", "Fintech Research"],
    },
    {
      name: "Mr. Ayodele Ighodalo",
      role: "Board Member",
      bio: "Legal Advisor and Policy Consultant. With a background in corporate law and agri-finance regulations, Mr. Ighodalo ensures that FarmCredit maintains compliance while scaling. He has advised multiple federal bodies on sustainable agri-fintech policy frameworks.",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mr.%20Ayodele%20Ighodalo-3QLqVptUoEPw4NE91WqrsTeXgj3ej4.jpeg",
      expertise: ["Corporate Law", "Regulatory Compliance", "Policy Development"],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/20 blur-3xl"
              animate={{
                x: ["-50%", "-45%", "-50%"],
                y: ["-50%", "-55%", "-50%"],
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
                x: ["33%", "38%", "33%"],
                y: ["33%", "28%", "33%"],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            ></motion.div>
          </div>
          <div className="container relative px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-6 text-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeIn}
                className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/30 dark:text-green-300"
              >
                Meet Our Team
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                The People Behind <span className="text-green-600 dark:text-green-400">FarmCredit</span>
              </motion.h1>
              <motion.p variants={fadeIn} className="max-w-[800px] text-muted-foreground text-lg md:text-xl">
                Our diverse team combines expertise in technology, data science, and agriculture to empower Nigerian
                youth farmers.
              </motion.p>
              <motion.div variants={fadeIn} className="flex items-center justify-center space-x-4 pt-4">
                <div className="flex -space-x-4">
                  {leadership.map((member, i) => (
                    <motion.div
                      key={i}
                      className="h-12 w-12 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </motion.div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Join our mission to transform agricultural finance
                </span>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground"
              >
                {leadership.map((member, i) => (
                  <span key={i} className="font-medium">
                    {member.name}
                    {i < leadership.length - 1 && <span className="mx-1">•</span>}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-24 bg-white dark:bg-background relative">
          <motion.div
            className="absolute right-0 top-1/4 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 -z-10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.6, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          ></motion.div>
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeIn}
                className="inline-flex items-center justify-center p-2 bg-green-50 dark:bg-green-900/20 rounded-full mb-4"
              >
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Our Core Team
              </motion.h2>
              <motion.p variants={fadeIn} className="max-w-[700px] text-muted-foreground md:text-lg">
                Meet the talented individuals building innovative financial solutions for Nigerian farmers.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-10 md:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {leadership.map((member, index) => (
                <motion.div key={index} className="group" variants={cardVariants} whileHover="hover">
                  <Card className="overflow-hidden border-0 bg-white dark:bg-gray-950 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-square w-full overflow-hidden bg-green-50 dark:bg-green-900/20 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Image
                        src={member.image || "/placeholder.svg"}
                        width={400}
                        height={400}
                        alt={member.name}
                        className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
                      <CardDescription className="text-green-600 dark:text-green-400 font-medium">
                        {member.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground text-sm">{member.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {member.expertise.map((skill, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-start gap-4 pt-2">
                      <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </Link>
                      <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </Link>
                      <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                        <Mail className="h-5 w-5" />
                        <span className="sr-only">Email</span>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Board of Advisors */}
        <section className="py-24 bg-gradient-to-b from-green-50 to-white dark:from-green-950/10 dark:to-background relative">
          <motion.div
            className="absolute left-0 bottom-1/4 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50 -z-10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.6, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          ></motion.div>
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeIn}
                className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4"
              >
                <LightbulbIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Board of Advisors
              </motion.h2>
              <motion.p variants={fadeIn} className="max-w-[700px] text-muted-foreground md:text-lg">
                Distinguished leaders in agriculture and finance providing strategic guidance to our mission.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {boardMembers.map((member, index) => (
                <motion.div key={index} className="group" variants={cardVariants} whileHover="hover">
                  <Card className="overflow-hidden border border-green-100 dark:border-green-900/30 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-950 transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-square w-full overflow-hidden bg-green-100/50 dark:bg-green-900/10 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Using direct image URLs instead of file paths */}
                      <img
                        src={member.imageUrl || "/placeholder.svg"}
                        alt={member.name}
                        className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
                      <CardDescription className="text-green-600 dark:text-green-400 font-medium">
                        {member.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground text-sm">{member.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {member.expertise.map((skill, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-100 dark:border-green-800/50"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-start gap-4 pt-2">
                      <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </Link>
                      <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-24 bg-white dark:bg-background relative">
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-green-50 blur-3xl opacity-70 -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.8, 0.7],
              }}
              transition={{
                duration: 12,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            ></motion.div>
          </motion.div>
          <div className="container px-4 md:px-6 relative">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeIn}
                className="inline-flex items-center justify-center p-2 bg-green-50 dark:bg-green-900/20 rounded-full mb-4"
              >
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Our Mission
              </motion.h2>
              <motion.p variants={fadeIn} className="max-w-[700px] text-muted-foreground md:text-lg">
                Transforming agricultural finance in Nigeria through technology and innovation.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              {/* Text Column */}
              <motion.div
                variants={fadeIn}
                className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-8 md:p-10 shadow-sm"
              >
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4">
                  Empowering Nigerian Farmers
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  At FarmCredit, we believe that technology can bridge the gap between Nigerian youth farmers and
                  financial institutions. Our team combines expertise in software engineering, data science, artificial
                  intelligence, and financial analytics to create innovative solutions.
                </p>
                <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  We're passionate about empowering the next generation of Nigerian farmers with the financial tools and
                  knowledge they need to build sustainable and profitable agricultural businesses.
                </p>
                <motion.div
                  className="mt-8"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link href="/about-us">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Learn More About Our Vision
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Image Column - Using your uploaded image */}
              <motion.div
                variants={fadeIn}
                className="relative h-full min-h-[400px] rounded-2xl overflow-hidden shadow-md border border-green-100 dark:border-green-900/30"
              >
                <Image
                  src="/nigerian-farmers-using-technology.jpeg"
                  alt="Nigerian farmers using mobile technology in a field"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent"></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Join Our Team */}
        <section className="py-24 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute left-1/4 top-0 h-96 w-96 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
              animate={{
                y: ["-50%", "-45%", "-50%"],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            ></motion.div>
            <motion.div
              className="absolute right-1/4 bottom-0 h-96 w-96 translate-y-1/2 rounded-full bg-white/5 blur-3xl"
              animate={{
                y: ["50%", "45%", "50%"],
              }}
              transition={{
                duration: 12,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            ></motion.div>
          </motion.div>
          <div className="container relative px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-8 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                Join Our Team
              </motion.h2>
              <motion.p variants={fadeIn} className="max-w-[800px] text-green-100 md:text-xl/relaxed">
                We're always looking for talented individuals who are passionate about agricultural finance and
                technology. Join us in our mission to empower Nigerian youth farmers.
              </motion.p>
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mt-4">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Link href="/careers">
                    <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 shadow-lg">
                      View Open Positions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Link href="/about-us">
                    <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                      Learn About Our Culture
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
