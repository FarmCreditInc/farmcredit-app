"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, ChevronRight, CreditCard, Calendar, Bell, Tractor } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  type: string
  title: string
  description: string
  dueDate?: string
  actionUrl?: string
  actionText?: string
  priority: "high" | "medium" | "low"
}

export function UpcomingTasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)

        // Fetch all the data we need in parallel
        const [
          repaymentResponse,
          farmingMilestonesResponse,
          profileCompletionResponse,
          notificationsResponse,
          inactiveFarmsResponse,
        ] = await Promise.all([
          fetch(`/api/dashboard/upcoming-repayments`),
          fetch(`/api/dashboard/farming-milestones`),
          fetch(`/api/dashboard/profile-completion`),
          fetch(`/api/dashboard/unread-notifications`),
          fetch(`/api/dashboard/inactive-farms`),
        ])

        // Check if any of the responses failed
        if (
          !repaymentResponse.ok ||
          !farmingMilestonesResponse.ok ||
          !profileCompletionResponse.ok ||
          !notificationsResponse.ok ||
          !inactiveFarmsResponse.ok
        ) {
          throw new Error("Failed to fetch tasks data")
        }

        // Parse the responses
        const repayments = await repaymentResponse.json()
        const farmingMilestones = await farmingMilestonesResponse.json()
        const profileCompletion = await profileCompletionResponse.json()
        const notifications = await notificationsResponse.json()
        const inactiveFarms = await inactiveFarmsResponse.json()

        // Combine all tasks
        const allTasks: Task[] = [
          ...repayments.data.map((r: any) => ({
            id: `repayment-${r.id}`,
            type: "loan_repayment",
            title: "Loan Repayment Due",
            description: `₦${r.amount.toLocaleString()} due on ${new Date(r.dueDate).toLocaleDateString()}`,
            dueDate: r.dueDate,
            actionUrl: "/dashboard/farmer/loan-history",
            actionText: "View Repayment Plan",
            priority: getDaysRemaining(r.dueDate) <= 7 ? "high" : "medium",
          })),
          ...farmingMilestones.data.map((fm: any) => ({
            id: `milestone-${fm.id}`,
            type: "farming_milestone",
            title: fm.title,
            description: fm.description,
            dueDate: fm.date,
            actionUrl: `/dashboard/farmer/farms/${fm.farmId}`,
            actionText: "View Farm Details",
            priority: fm.priority,
          })),
          ...profileCompletion.data.map((pc: any) => ({
            id: `profile-${pc.id}`,
            type: "document_completion",
            title: pc.title,
            description: pc.description,
            actionUrl: pc.actionUrl,
            actionText: pc.actionText,
            priority: "medium",
          })),
          ...notifications.data.map((n: any) => ({
            id: `notification-${n.id}`,
            type: "unread_notification",
            title: "Unread Notifications",
            description: `You have ${n.count} unread notification${n.count > 1 ? "s" : ""}`,
            actionUrl: "/dashboard/farmer/notifications",
            actionText: "View Notifications",
            priority: "low",
          })),
          ...inactiveFarms.data.map((f: any) => ({
            id: `farm-${f.id}`,
            type: "inactive_farm",
            title: "Inactive Farm",
            description: `Your farm "${f.name}" has no production data`,
            actionUrl: `/dashboard/farmer/farms/${f.id}`,
            actionText: "Add Production Data",
            priority: "medium",
          })),
        ]

        // Sort tasks by priority and due date
        allTasks.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]

          if (priorityDiff !== 0) return priorityDiff

          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          }

          return 0
        })

        // Take only the top 3 tasks
        setTasks(allTasks.slice(0, 3))
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching tasks:", err)
        setError("Failed to load tasks. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Helper function to get days remaining
  function getDaysRemaining(dateString: string): number {
    const dueDate = new Date(dateString)
    const today = new Date()
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Get the appropriate icon for each task type
  function getTaskIcon(type: string) {
    switch (type) {
      case "loan_repayment":
        return <CreditCard className="h-4 w-4" />
      case "farming_milestone":
        return <Calendar className="h-4 w-4" />
      case "unread_notification":
        return <Bell className="h-4 w-4" />
      case "inactive_farm":
        return <Tractor className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Get priority badge color
  function getPriorityBadgeColor(priority: "high" | "medium" | "low") {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Tasks that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Tasks that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>Tasks that need your attention</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3">
                <div className="rounded-full bg-accent p-2 mt-0.5">{getTaskIcon(task.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium leading-none">{task.title}</p>
                    <Badge variant="outline" className={getPriorityBadgeColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  {task.actionUrl && (
                    <Button variant="link" size="sm" className="h-auto p-0" asChild>
                      <Link href={task.actionUrl}>
                        {task.actionText || "View Details"} <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No upcoming tasks</p>
            <Button variant="outline" className="mt-2" asChild>
              <Link href="/dashboard/farmer/tasks">View All Tasks</Link>
            </Button>
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/farmer/tasks">
              View All Tasks <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
