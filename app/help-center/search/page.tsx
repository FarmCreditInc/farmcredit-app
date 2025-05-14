"use client"

import React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronRight, Search, Bot, Loader2, X } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// This would typically come from a database or search index
const helpContent = [
  {
    id: "creating-account",
    title: "Creating an Account",
    category: "Account Management",
    excerpt: "Learn how to create and set up your FarmCredit account in a few simple steps.",
    url: "/help-center/account-management/creating-account",
  },
  {
    id: "updating-profile",
    title: "Updating Your Profile",
    category: "Account Management",
    excerpt: "Keep your profile information up-to-date to ensure the best experience on our platform.",
    url: "/help-center/account-management/updating-profile",
  },
  {
    id: "applying-loans",
    title: "Applying for Loans",
    category: "Farmer Resources",
    excerpt: "A step-by-step guide to applying for agricultural loans through our platform.",
    url: "/help-center/farmer-resources/applying-loans",
  },
  {
    id: "uploading-documents",
    title: "Uploading Farm Documents",
    category: "Farmer Resources",
    excerpt: "Learn how to properly upload and manage your farm documentation.",
    url: "/help-center/farmer-resources/uploading-documents",
  },
  {
    id: "becoming-lender",
    title: "Becoming a Lender",
    category: "Lender Information",
    excerpt: "Everything you need to know about becoming a lender on our platform.",
    url: "/help-center/lender-information/becoming-lender",
  },
  {
    id: "login-problems",
    title: "Login Problems",
    category: "Troubleshooting",
    excerpt: "Solutions for common login issues and account access problems.",
    url: "/help-center/troubleshooting/login-problems",
  },
  {
    id: "platform-overview",
    title: "Platform Overview",
    category: "Getting Started",
    excerpt: "An overview of the FarmCredit platform and its key features.",
    url: "/help-center/getting-started/platform-overview",
  },
]

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [isSearching, setIsSearching] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showAiResponse, setShowAiResponse] = useState(true)

  // Traditional search results
  const results = query
    ? helpContent.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      )
    : []

  // Fetch AI response on initial load if query exists
  useEffect(() => {
    if (query) {
      fetchAiResponse(query)
    }
  }, [query])

  const fetchAiResponse = async (queryText: string) => {
    setIsSearching(true)
    setAiResponse(null)
    setSearchError(null)
    setShowAiResponse(true)

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: queryText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response")
      }

      setAiResponse(data.answer || "No answer found.")
    } catch (error) {
      console.error("Error fetching AI response:", error)
      setSearchError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Update URL with new query
    const url = new URL(window.location.href)
    url.searchParams.set("q", searchQuery)
    window.history.pushState({}, "", url.toString())

    // Fetch AI response
    fetchAiResponse(searchQuery)
  }

  // Function to close the AI response
  const handleCloseAiResponse = () => {
    setShowAiResponse(false)
  }

  // Function to format the AI response with proper line breaks
  const formatAiResponse = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ))
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Search Results</h1>
              <p className="text-muted-foreground">
                {query ? `Showing results for "${query}"` : "Enter a search term to find help articles"}
              </p>
            </div>

            {/* Search form */}
            <div className="mb-10">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    name="q"
                    placeholder="Ask any question about FarmCredit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-input bg-background pl-9 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Asking...
                    </>
                  ) : (
                    <>Ask</>
                  )}
                </Button>
              </form>
            </div>

            {/* AI Response */}
            {showAiResponse && (isSearching || aiResponse || searchError) && (
              <Card className="mb-8 border-green-100 dark:border-green-800 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={handleCloseAiResponse}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-green-600" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
                      <p className="text-muted-foreground">Finding the best answer for you...</p>
                    </div>
                  ) : searchError ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
                      <p className="font-medium">Error</p>
                      <p className="text-sm">{searchError}</p>
                    </div>
                  ) : aiResponse ? (
                    <div className="prose dark:prose-invert max-w-none text-left">{formatAiResponse(aiResponse)}</div>
                  ) : null}
                </CardContent>
                {aiResponse && !isSearching && !searchError && (
                  <div className="px-6 pb-4 text-xs text-muted-foreground">
                    <p>Powered by FarmCredit AI</p>
                  </div>
                )}
              </Card>
            )}

            {/* Traditional Results */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Related Help Articles</h2>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="text-sm text-muted-foreground mb-1">{result.category}</div>
                        <CardTitle className="text-xl">
                          <Link href={result.url} className="hover:text-green-600 transition-colors">
                            {result.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>{result.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link href={result.url}>
                          <Button variant="link" className="p-0 h-auto text-green-600">
                            Read more <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : query ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    No related help articles found. Try browsing our help categories below.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Suggestions if no query */}
            {!query && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Popular Help Topics</h2>
                <p className="text-muted-foreground mb-6">Browse some of our most frequently accessed help articles</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {helpContent.slice(0, 4).map((item) => (
                    <Link key={item.id} href={item.url} className="text-left">
                      <Card className="h-full hover:border-green-300 transition-colors">
                        <CardHeader>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{item.excerpt}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
