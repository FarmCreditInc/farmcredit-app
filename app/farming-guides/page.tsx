import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Search, Filter, Calendar, Clock } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function FarmingGuides() {
  const guides = [
    {
      id: "cassava-farming",
      title: "Cassava Farming: Complete Guide",
      description: "Learn how to grow cassava efficiently with this comprehensive guide for Nigerian farmers.",
      image: "/placeholder.svg?key=vdkw5",
      category: "Crop Farming",
      readTime: "15 min read",
      date: "May 10, 2023",
      featured: true,
    },
    {
      id: "poultry-management",
      title: "Poultry Management for Beginners",
      description: "Start your poultry farming business with this step-by-step guide for beginners.",
      image: "/poultry-farming.png",
      category: "Livestock",
      readTime: "12 min read",
      date: "June 5, 2023",
      featured: true,
    },
    {
      id: "rice-cultivation",
      title: "Rice Cultivation Techniques",
      description: "Modern techniques for rice cultivation in Nigerian wetlands and lowlands.",
      image: "/rice-farming.png",
      category: "Crop Farming",
      readTime: "18 min read",
      date: "April 22, 2023",
      featured: true,
    },
  ]

  const categories = ["Crop Farming", "Livestock", "Farm Management"]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-green-50 dark:bg-green-950/10 py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800/20 dark:text-green-300">
                  Farming Guides
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Expert Farming Guides for Nigerian Agriculture
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Practical, region-specific guides to help you maximize your farm's productivity and profitability.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="search" placeholder="Search guides..." className="pl-10 w-full" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </div>
              </div>
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted md:h-[420px]">
                <Image
                  src="/placeholder.svg?key=tclos"
                  width={550}
                  height={420}
                  alt="Nigerian farmer in a cassava field"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Guides */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter">Featured Guides</h2>
                <p className="text-muted-foreground">Our most popular and comprehensive farming guides.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="#all-guides">View All</Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {guides
                .filter((guide) => guide.featured)
                .map((guide, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Link href={`/farming-guides/${guide.id}`}>
                      <div className="aspect-video w-full overflow-hidden">
                        <Image
                          src={guide.image || "/placeholder.svg"}
                          width={350}
                          height={200}
                          alt={guide.title}
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    </Link>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                        >
                          {guide.category}
                        </Badge>
                      </div>
                      <Link href={`/farming-guides/${guide.id}`} className="hover:underline">
                        <CardTitle className="mt-2">{guide.title}</CardTitle>
                      </Link>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {guide.date}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {guide.readTime}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        </section>

        {/* All Guides */}
        <section id="all-guides" className="py-20 bg-green-50 dark:bg-green-950/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Browse All Guides</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find the perfect guide for your specific farming needs.
                </p>
              </div>
            </div>

            <Tabs defaultValue="all" className="mt-12">
              <div className="flex justify-center overflow-auto pb-2">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="crop">Crop Farming</TabsTrigger>
                  <TabsTrigger value="livestock">Livestock</TabsTrigger>
                  <TabsTrigger value="management">Farm Management</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {guides.map((guide, index) => (
                    <Card key={index} className="overflow-hidden">
                      <Link href={`/farming-guides/${guide.id}`}>
                        <div className="aspect-video w-full overflow-hidden">
                          <Image
                            src={guide.image || "/placeholder.svg"}
                            width={350}
                            height={200}
                            alt={guide.title}
                            className="object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      </Link>
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                          >
                            {guide.category}
                          </Badge>
                        </div>
                        <Link href={`/farming-guides/${guide.id}`} className="hover:underline">
                          <CardTitle className="mt-2 text-lg">{guide.title}</CardTitle>
                        </Link>
                        <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between p-4 pt-0">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {guide.date}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {guide.readTime}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="crop" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {guides
                    .filter((guide) => guide.category === "Crop Farming")
                    .map((guide, index) => (
                      <Card key={index} className="overflow-hidden">
                        <Link href={`/farming-guides/${guide.id}`}>
                          <div className="aspect-video w-full overflow-hidden">
                            <Image
                              src={guide.image || "/placeholder.svg"}
                              width={350}
                              height={200}
                              alt={guide.title}
                              className="object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        </Link>
                        <CardHeader className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                            >
                              {guide.category}
                            </Badge>
                          </div>
                          <Link href={`/farming-guides/${guide.id}`} className="hover:underline">
                            <CardTitle className="mt-2 text-lg">{guide.title}</CardTitle>
                          </Link>
                          <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between p-4 pt-0">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {guide.date}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {guide.readTime}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="livestock" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {guides
                    .filter((guide) => guide.category === "Livestock")
                    .map((guide, index) => (
                      <Card key={index} className="overflow-hidden">
                        <Link href={`/farming-guides/${guide.id}`}>
                          <div className="aspect-video w-full overflow-hidden">
                            <Image
                              src={guide.image || "/placeholder.svg"}
                              width={350}
                              height={200}
                              alt={guide.title}
                              className="object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        </Link>
                        <CardHeader className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                            >
                              {guide.category}
                            </Badge>
                          </div>
                          <Link href={`/farming-guides/${guide.id}`} className="hover:underline">
                            <CardTitle className="mt-2 text-lg">{guide.title}</CardTitle>
                          </Link>
                          <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between p-4 pt-0">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {guide.date}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {guide.readTime}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="management" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {guides
                    .filter((guide) => guide.category === "Farm Management")
                    .map((guide, index) => (
                      <Card key={index} className="overflow-hidden">
                        <Link href={`/farming-guides/${guide.id}`}>
                          <div className="aspect-video w-full overflow-hidden">
                            <Image
                              src={guide.image || "/placeholder.svg"}
                              width={350}
                              height={200}
                              alt={guide.title}
                              className="object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        </Link>
                        <CardHeader className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30"
                            >
                              {guide.category}
                            </Badge>
                          </div>
                          <Link href={`/farming-guides/${guide.id}`} className="hover:underline">
                            <CardTitle className="mt-2 text-lg">{guide.title}</CardTitle>
                          </Link>
                          <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between p-4 pt-0">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {guide.date}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {guide.readTime}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Browse by Category</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find guides specific to your farming interests.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((category, index) => (
                <Card key={index} className="hover:bg-green-50 dark:hover:bg-green-950/10 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-center">{category}</CardTitle>
                  </CardHeader>
                  <CardFooter className="flex justify-center">
                    <Button
                      variant="ghost"
                      className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/30"
                      asChild
                    >
                      <Link href={`#${category.toLowerCase().replace(" ", "-")}`}>
                        View Guides
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600 dark:bg-green-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
                  Want Personalized Farming Advice?
                </h2>
                <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Register for a free account to get customized farming guides based on your location and crops.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50" asChild>
                  <Link href="/auth/signup">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
