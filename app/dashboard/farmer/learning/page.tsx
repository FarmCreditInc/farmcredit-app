import Link from "next/link"
import Image from "next/image"
import { Clock, Play, Award } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export const dynamic = "force-dynamic"

export default function LearningCenterPage() {
  const articles = [
    {
      id: 1,
      title: "Understanding Soil Composition",
      category: "Soil Science",
      readTime: "15 minutes",
      excerpt: "Learn about the different types of soil and their impact on crop growth.",
    },
    {
      id: 2,
      title: "Effective Irrigation Techniques",
      category: "Water Management",
      readTime: "20 minutes",
      excerpt: "Discover the best irrigation methods for maximizing water efficiency.",
    },
    {
      id: 3,
      title: "Integrated Pest Management Strategies",
      category: "Pest Control",
      readTime: "18 minutes",
      excerpt: "Explore eco-friendly approaches to pest control in agriculture.",
    },
  ]

  const videos = [
    {
      id: 1,
      title: "Precision Farming with Drones",
      category: "Technology",
      duration: "12 minutes",
      description: "See how drones are revolutionizing farming practices.",
      thumbnail: "/placeholder.svg?key=drone",
    },
    {
      id: 2,
      title: "Organic Farming Practices",
      category: "Farming",
      duration: "15 minutes",
      description: "Learn the basics of organic farming and its benefits.",
      thumbnail: "/placeholder.svg?key=organic",
    },
    {
      id: 3,
      title: "Hydroponics for Beginners",
      category: "Farming",
      duration: "10 minutes",
      description: "Get started with hydroponics and grow plants without soil.",
      thumbnail: "/placeholder.svg?key=hydroponics",
    },
  ]

  const achievements = [
    {
      id: 1,
      title: "First Course Completed",
      description: "Complete your first course in the Learning Center.",
      unlocked: true,
    },
    {
      id: 2,
      title: "Article Reader",
      description: "Read 5 articles in the Learning Center.",
      unlocked: false,
    },
    {
      id: 3,
      title: "Video Enthusiast",
      description: "Watch 3 videos in the Learning Center.",
      unlocked: false,
    },
    {
      id: 4,
      title: "Learning Master",
      description: "Complete all courses in the Learning Center.",
      unlocked: false,
    },
  ]

  const courses = [
    {
      id: 1,
      title: "Building Creditworthiness for Agricultural Financing",
      description:
        "Learn how to build and maintain good credit to improve your chances of securing agricultural loans.",
      image: "/placeholder.svg?key=96ybf",
      category: "Finance",
      duration: "2 hours",
      progress: 75,
    },
    {
      id: 2,
      title: "Sustainable Post-Harvest Practices",
      description: "Discover techniques to reduce post-harvest losses and maximize the value of your crops.",
      image: "/placeholder.svg?key=gngci",
      category: "Farming",
      duration: "3 hours",
      progress: 30,
    },
    {
      id: 3,
      title: "Introduction to Modern Irrigation Systems",
      description: "Explore the latest irrigation technologies for efficient water use.",
      image: "/placeholder.svg?key=8j6sb",
      category: "Technology",
      duration: "2.5 hours",
      progress: 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Center</h1>
        <p className="text-muted-foreground">Enhance your farming knowledge and skills</p>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="mb-4 flex w-full flex-wrap justify-start overflow-x-auto">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                  {course.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="px-2 py-0">
                      {course.category}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {course.duration}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-1 text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/farmer/learning/courses/${course.id}`}>
                      {course.progress > 0 ? "Continue Learning" : "Start Course"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <Button variant="outline">Load More Courses</Button>
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="px-2 py-0">
                      {article.category}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {article.readTime}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/dashboard/farmer/learning/articles/${article.id}`}>Read Article</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <Button variant="outline">Load More Articles</Button>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/50 p-3">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="px-2 py-0">
                      {video.category}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {video.duration}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-1 text-lg">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/farmer/learning/videos/${video.id}`}>Watch Video</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <Button variant="outline">Load More Videos</Button>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`border ${achievement.unlocked ? "border-green-200" : "border-gray-200 opacity-70"}`}
              >
                <CardHeader className="pb-2 text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    {achievement.unlocked ? (
                      <Award className="h-8 w-8 text-green-600" />
                    ) : (
                      <Award className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-base">{achievement.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </CardContent>
                <CardFooter className="justify-center pb-4">
                  {achievement.unlocked ? (
                    <Badge className="bg-green-600">Unlocked</Badge>
                  ) : (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
