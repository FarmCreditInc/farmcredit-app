import Image from "next/image"
import { ArrowRight, Search, Filter, Calendar, Clock, User } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function Blog() {
  const featuredPosts = [
    {
      title: "How Credit Scoring is Transforming Agricultural Finance in Nigeria",
      excerpt:
        "Learn how innovative credit scoring models are helping Nigerian farmers access the financing they need to grow their businesses.",
      image: "/placeholder.svg?height=400&width=800",
      category: "Finance",
      author: "Adebayo Ogunlesi",
      date: "May 15, 2023",
      readTime: "8 min read",
    },
    {
      title: "5 Ways Young Farmers Can Build Their Credit Profile",
      excerpt:
        "Practical tips for young Nigerian farmers to establish and improve their credit profiles to access better financing options.",
      image: "/placeholder.svg?height=400&width=800",
      category: "Financial Tips",
      author: "Ngozi Okonjo",
      date: "June 22, 2023",
      readTime: "6 min read",
    },
    {
      title: "The Future of Agricultural Finance in Nigeria",
      excerpt:
        "Exploring the trends and innovations that will shape the future of agricultural finance in Nigeria over the next decade.",
      image: "/placeholder.svg?height=400&width=800",
      category: "Industry Insights",
      author: "Chukwudi Eze",
      date: "April 10, 2023",
      readTime: "10 min read",
    },
  ]

  const recentPosts = [
    {
      title: "Understanding Loan Terms: A Guide for Nigerian Farmers",
      excerpt: "A comprehensive guide to understanding the terms and conditions of agricultural loans in Nigeria.",
      image: "/placeholder.svg?height=200&width=350",
      category: "Finance",
      author: "Amina Ibrahim",
      date: "July 5, 2023",
      readTime: "7 min read",
    },
    {
      title: "How to Create a Farm Budget That Works",
      excerpt: "Step-by-step instructions for creating a comprehensive farm budget to track income and expenses.",
      image: "/placeholder.svg?height=200&width=350",
      category: "Financial Tips",
      author: "Oluwaseun Adeyemi",
      date: "July 12, 2023",
      readTime: "5 min read",
    },
    {
      title: "Success Story: How Cassava Farmer Increased Yield by 50%",
      excerpt:
        "The inspiring story of a Nigerian cassava farmer who used financing to implement modern farming techniques.",
      image: "/placeholder.svg?height=200&width=350",
      category: "Success Stories",
      author: "Chioma Nwosu",
      date: "July 18, 2023",
      readTime: "6 min read",
    },
    {
      title: "The Role of Technology in Agricultural Finance",
      excerpt:
        "How technology is revolutionizing agricultural finance and making it more accessible to Nigerian farmers.",
      image: "/placeholder.svg?height=200&width=350",
      category: "Technology",
      author: "Ibrahim Musa",
      date: "July 25, 2023",
      readTime: "8 min read",
    },
    {
      title: "Navigating Seasonal Cash Flow Challenges",
      excerpt: "Strategies for managing cash flow during different agricultural seasons to ensure financial stability.",
      image: "/placeholder.svg?height=200&width=350",
      category: "Financial Tips",
      author: "Folake Adeleke",
      date: "August 2, 2023",
      readTime: "7 min read",
    },
    {
      title: "Government Policies Supporting Agricultural Finance",
      excerpt:
        "An overview of Nigerian government policies and initiatives aimed at improving access to agricultural finance.",
      image: "/placeholder.svg?height=200&width=350",
      category: "Policy",
      author: "Emeka Okafor",
      date: "August 10, 2023",
      readTime: "9 min read",
    },
  ]

  const categories = [
    "Finance",
    "Financial Tips",
    "Success Stories",
    "Technology",
    "Industry Insights",
    "Policy",
    "Farming Techniques",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 dark:bg-green-950/10 py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
                  Blog
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Insights on Agricultural Finance</h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Expert articles, guides, and success stories to help Nigerian farmers navigate agricultural finance.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="Search articles..." className="pl-10 w-full" />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter">Featured Articles</h2>
                <p className="text-muted-foreground">Our most popular and informative content.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-10">
              {featuredPosts.map((post, index) => (
                <div key={index} className="grid gap-6 md:grid-cols-2 md:gap-12 items-center">
                  <div className={`order-2 md:order-${index % 2 === 0 ? "2" : "1"} space-y-4`}>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                      >
                        {post.category}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold">{post.title}</h3>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div
                    className={`order-1 md:order-${index % 2 === 0 ? "1" : "2"} relative h-[250px] w-full overflow-hidden rounded-xl bg-muted md:h-[350px]`}
                  >
                    <Image
                      src={post.image || "/placeholder.svg"}
                      width={800}
                      height={400}
                      alt={post.title}
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Recent Articles</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Stay up-to-date with our latest insights and guides.
                </p>
              </div>
            </div>

            <Tabs defaultValue="all" className="mt-12">
              <div className="flex justify-center overflow-auto pb-2">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                  <TabsTrigger value="tips">Financial Tips</TabsTrigger>
                  <TabsTrigger value="stories">Success Stories</TabsTrigger>
                  <TabsTrigger value="tech">Technology</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recentPosts.map((post, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden">
                        <Image
                          src={post.image || "/placeholder.svg"}
                          width={350}
                          height={200}
                          alt={post.title}
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                          >
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="mt-2 text-lg">{post.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between p-4 pt-0">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {post.date}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {post.readTime}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              {/* Similar TabsContent for other categories */}
            </Tabs>

            <div className="mt-12 text-center">
              <Button variant="outline" size="lg">
                Load More Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Browse by Category</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find articles specific to your interests.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Card key={index} className="hover:bg-green-50 dark:hover:bg-green-950/10 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-center">{category}</CardTitle>
                  </CardHeader>
                  <CardFooter className="flex justify-center">
                    <Button
                      variant="ghost"
                      className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/30"
                    >
                      View Articles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                  Subscribe to Our Newsletter
                </h2>
                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get the latest articles, guides, and insights delivered directly to your inbox.
                </p>
              </div>
              <div className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row">
                <Input type="email" placeholder="Enter your email" className="bg-white dark:bg-green-950/50" />
                <Button className="bg-white text-green-600 hover:bg-green-50 shrink-0">Subscribe</Button>
              </div>
              <p className="text-sm text-green-100">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
