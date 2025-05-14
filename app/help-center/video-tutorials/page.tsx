import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Play } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Video Tutorials | Help Center | FarmCredit",
  description: "Step-by-step video guides for using the FarmCredit platform",
}

// This would typically come from a database
const videoTutorials = [
  {
    id: "getting-started",
    title: "Getting Started with FarmCredit",
    description: "Learn the basics of navigating the FarmCredit platform and setting up your account.",
    duration: "5:32",
    thumbnail: "/video-tutorial-thumbnail.png",
    category: "basics",
  },
  {
    id: "farmer-profile",
    title: "Creating Your Farmer Profile",
    description: "A step-by-step guide to creating a compelling farmer profile that attracts lenders.",
    duration: "7:15",
    thumbnail: "/placeholder.svg?key=mex9o",
    category: "farmers",
  },
  {
    id: "loan-application",
    title: "Applying for Your First Loan",
    description: "Everything you need to know about the loan application process.",
    duration: "8:45",
    thumbnail: "/loan-application-tutorial.png",
    category: "farmers",
  },
  {
    id: "lender-account",
    title: "Setting Up a Lender Account",
    description: "How to create and configure your lender account for optimal results.",
    duration: "6:20",
    thumbnail: "/lender-account-setup.png",
    category: "lenders",
  },
  {
    id: "investment-strategies",
    title: "Effective Investment Strategies",
    description: "Learn how to build a diversified portfolio of agricultural investments.",
    duration: "10:12",
    thumbnail: "/placeholder.svg?height=200&width=350&query=investment%20strategy%20tutorial",
    category: "lenders",
  },
  {
    id: "mobile-app",
    title: "Using the FarmCredit Mobile App",
    description: "Navigate and use all features of our mobile application.",
    duration: "4:50",
    thumbnail: "/placeholder.svg?height=200&width=350&query=mobile%20app%20tutorial",
    category: "basics",
  },
]

export default function VideoTutorialsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <Link href="/help-center">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back to Help Center
                </Button>
              </Link>
              <h1 className="text-3xl font-bold mb-4">Video Tutorials</h1>
              <p className="text-muted-foreground">
                Step-by-step video guides to help you make the most of the FarmCredit platform
              </p>
            </div>

            <Tabs defaultValue="all" className="w-full mb-12">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="farmers">Farmers</TabsTrigger>
                <TabsTrigger value="lenders">Lenders</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTutorials.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="basics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTutorials
                    .filter((video) => video.category === "basics")
                    .map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="farmers">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTutorials
                    .filter((video) => video.category === "farmers")
                    .map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="lenders">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTutorials
                    .filter((video) => video.category === "lenders")
                    .map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="bg-green-50 dark:bg-green-950/10 rounded-xl p-8 shadow-sm">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Our support team is ready to help you with any questions or issues you might have.
                </p>
                <Link href="/help-center#contact">
                  <Button>Contact Support</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function VideoCard({ video }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <Image
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          width={350}
          height={200}
          className="w-full object-cover h-48"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
            <Play className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{video.title}</CardTitle>
        <CardDescription>{video.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={`/help-center/video-tutorials/${video.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Watch Tutorial
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
