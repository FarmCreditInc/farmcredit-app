"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  Bell,
  Tractor,
  Filter,
  Search,
  ArrowLeft,
  AlertCircle,
  ChevronRight,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type TaskType =
  | "loan_repayment"
  | "farming_milestone"
  | "document_completion"
  | "unread_notification"
  | "inactive_farm"
  | "all"
type TaskPriority = "high" | "medium" | "low" | "all"

interface TaskDetails {
  [key: string]: any
}

interface Task {
  id: string
  type: TaskType
  title: string
  description: string
  dueDate?: string
  actionUrl?: string
  actionText?: string
  priority: "high" | "medium" | "low"
  details?: TaskDetails
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<TaskType>("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)

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
            type: "loan_repayment" as TaskType,
            title: "Loan Repayment Due",
            description: `₦${r.amount.toLocaleString()} due on ${new Date(r.dueDate).toLocaleDateString()}`,
            dueDate: r.dueDate,
            actionUrl: "/dashboard/farmer/loan-history",
            actionText: "View Repayment Plan",
            priority: getDaysRemaining(r.dueDate) <= 7 ? "high" : "medium",
            details: r.details || {},
          })),
          ...farmingMilestones.data.map((fm: any) => ({
            id: `milestone-${fm.id}`,
            type: "farming_milestone" as TaskType,
            title: fm.title,
            description: fm.description,
            dueDate: fm.date,
            actionUrl: `/dashboard/farmer/farms/${fm.farmId}`,
            actionText: "View Farm Details",
            priority: fm.priority,
            details: fm.details || {},
          })),
          ...profileCompletion.data.map((pc: any) => ({
            id: `profile-${pc.id}`,
            type: "document_completion" as TaskType,
            title: pc.title,
            description: pc.description,
            actionUrl: pc.actionUrl,
            actionText: pc.actionText,
            priority: "medium",
            details: pc.details || {},
          })),
          ...notifications.data.map((n: any) => ({
            id: `notification-${n.id}`,
            type: "unread_notification" as TaskType,
            title: "Unread Notifications",
            description: `You have ${n.count} unread notification${n.count > 1 ? "s" : ""}`,
            actionUrl: "/dashboard/farmer/notifications",
            actionText: "View Notifications",
            priority: "low",
            details: n.details || {},
          })),
          ...inactiveFarms.data.map((f: any) => ({
            id: `farm-${f.id}`,
            type: "inactive_farm" as TaskType,
            title: "Inactive Farm",
            description: `Your farm "${f.name}" has no production data`,
            actionUrl: `/dashboard/farmer/farms/${f.id}`,
            actionText: "Add Production Data",
            priority: "medium",
            details: f.details || {},
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

        setTasks(allTasks)
        setFilteredTasks(allTasks)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching tasks:", err)
        setError("Failed to load tasks. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    let result = [...tasks]

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((task) => task.type === typeFilter)
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
      )
    }

    setFilteredTasks(result)
  }, [typeFilter, priorityFilter, searchQuery, tasks])

  // Helper function to get days remaining
  function getDaysRemaining(dateString: string): number {
    const dueDate = new Date(dateString)
    const today = new Date()
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Get the appropriate icon for each task type
  function getTaskIcon(type: TaskType) {
    switch (type) {
      case "loan_repayment":
        return <CreditCard className="h-4 w-4 text-yellow-600" />
      case "farming_milestone":
        return <Calendar className="h-4 w-4 text-green-600" />
      case "document_completion":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "unread_notification":
        return <Bell className="h-4 w-4 text-purple-600" />
      case "inactive_farm":
        return <Tractor className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  // Get background color for the icon container based on task type
  function getIconBgColor(type: TaskType) {
    switch (type) {
      case "loan_repayment":
        return "bg-yellow-100"
      case "farming_milestone":
        return "bg-green-100"
      case "document_completion":
        return "bg-blue-100"
      case "unread_notification":
        return "bg-purple-100"
      case "inactive_farm":
        return "bg-orange-100"
      default:
        return "bg-gray-100"
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

  // Get task type label
  function getTaskTypeLabel(type: TaskType) {
    switch (type) {
      case "loan_repayment":
        return "Loan Repayment"
      case "farming_milestone":
        return "Farming Milestone"
      case "document_completion":
        return "Document Completion"
      case "unread_notification":
        return "Notification"
      case "inactive_farm":
        return "Inactive Farm"
      case "all":
        return "All Types"
      default:
        return "Task"
    }
  }

  // Open task details dialog
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }

  // Render task details based on type
  const renderTaskDetails = (task: Task) => {
    if (!task.details) return null

    switch (task.type) {
      case "loan_repayment":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Loan Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Loan Name:</span> {task.details.loanName}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Loan Amount:</span> ₦
                  {task.details.loanAmount?.toLocaleString()}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Loan Term:</span> {task.details.loanTerm}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Interest Rate:</span> {task.details.interestRate}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Lender:</span> {task.details.lender}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium">Payment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Payment Method:</span> {task.details.paymentMethod}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Account Number:</span> {task.details.accountNumber}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Bank Name:</span> {task.details.bankName}
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Instructions:</span> {task.details.paymentInstructions}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Late payments may affect your credit score and future loan eligibility.
              </AlertDescription>
            </Alert>
          </div>
        )

      case "farming_milestone":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Farm Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Farm Name:</span> {task.details.farmName}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Location:</span> {task.details.location}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Crop Type:</span> {task.details.cropType}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Expected Yield:</span> {task.details.expectedYield}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium">Required Resources</h4>
              {task.details.requiredSupplies && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Supplies:</span>
                  <ul className="list-disc list-inside text-sm ml-2 mt-1">
                    {task.details.requiredSupplies.map((supply: string, index: number) => (
                      <li key={index}>{supply}</li>
                    ))}
                  </ul>
                </div>
              )}
              {task.details.requiredEquipment && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Equipment:</span>
                  <ul className="list-disc list-inside text-sm ml-2 mt-1">
                    {task.details.requiredEquipment.map((equipment: string, index: number) => (
                      <li key={index}>{equipment}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium">Instructions</h4>
              <p className="text-sm mt-1">{task.details.instructions}</p>
            </div>

            {task.details.weatherForecast && (
              <div>
                <h4 className="text-sm font-medium">Weather Forecast</h4>
                <p className="text-sm mt-1">{task.details.weatherForecast}</p>
              </div>
            )}

            {task.details.additionalNotes && (
              <div>
                <h4 className="text-sm font-medium">Additional Notes</h4>
                <p className="text-sm mt-1">{task.details.additionalNotes}</p>
              </div>
            )}
          </div>
        )

      case "document_completion":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Importance</h4>
              <p className="text-sm mt-1">{task.details.importance}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium">Required Information</h4>
              {task.details.requiredInformation && (
                <ul className="list-disc list-inside text-sm ml-2 mt-1">
                  {task.details.requiredInformation.map((info: string, index: number) => (
                    <li key={index}>{info}</li>
                  ))}
                </ul>
              )}
              {task.details.acceptedDocuments && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Accepted Documents:</span>
                  <ul className="list-disc list-inside text-sm ml-2 mt-1">
                    {task.details.acceptedDocuments.map((doc: string, index: number) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
              {task.details.fileRequirements && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">File Requirements:</span> {task.details.fileRequirements}
                </div>
              )}
            </div>

            {task.details.verificationProcess && (
              <div>
                <h4 className="text-sm font-medium">Verification Process</h4>
                <p className="text-sm mt-1">{task.details.verificationProcess}</p>
              </div>
            )}

            {task.details.verificationTimeline && (
              <div>
                <h4 className="text-sm font-medium">Verification Timeline</h4>
                <p className="text-sm mt-1">{task.details.verificationTimeline}</p>
              </div>
            )}

            {task.details.supportContact && (
              <div>
                <h4 className="text-sm font-medium">Support Contact</h4>
                <p className="text-sm mt-1">{task.details.supportContact}</p>
              </div>
            )}

            {task.details.privacyNote && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Privacy Note</AlertTitle>
                <AlertDescription>{task.details.privacyNote}</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case "unread_notification":
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              {task.details.length > 0 &&
                task.details.map((notification: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <Badge
                        variant="outline"
                        className={
                          notification.type === "success"
                            ? "bg-green-100 text-green-800"
                            : notification.type === "warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      {notification.actionUrl && (
                        <Button variant="link" size="sm" className="h-auto p-0" asChild>
                          <Link href={notification.actionUrl}>View Details</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )

      case "inactive_farm":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Farm Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Farm Name:</span> {task.details.farmName || task.details.name}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Location:</span> {task.details.location}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Size:</span> {task.details.size} {task.details.size_units}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {new Date(task.details.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium">Farm Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {task.details.cropTypes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Crop Types:</span>{" "}
                    {Array.isArray(task.details.cropTypes) ? task.details.cropTypes.join(", ") : task.details.cropTypes}
                  </div>
                )}
                {task.details.soilType && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Soil Type:</span> {task.details.soilType}
                  </div>
                )}
                {task.details.waterSource && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Water Source:</span> {task.details.waterSource}
                  </div>
                )}
                {task.details.lastActivity && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last Activity:</span>{" "}
                    {new Date(task.details.lastActivity).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {task.details.recommendations && (
              <div>
                <h4 className="text-sm font-medium">Recommendations</h4>
                <ul className="list-disc list-inside text-sm ml-2 mt-1">
                  {task.details.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No additional details available for this task.</p>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage all your pending tasks</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage all your pending tasks</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was a problem loading your tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-muted-foreground">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage all your pending tasks</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TaskType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="loan_repayment">Loan Repayments</SelectItem>
                <SelectItem value="farming_milestone">Farming Milestones</SelectItem>
                <SelectItem value="document_completion">Document Completion</SelectItem>
                <SelectItem value="unread_notification">Notifications</SelectItem>
                <SelectItem value="inactive_farm">Inactive Farms</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="high">High Priority ({tasks.filter((t) => t.priority === "high").length})</TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({tasks.filter((t) => t.dueDate && getDaysRemaining(t.dueDate) <= 7).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Tasks</span>
                {filteredTasks.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {filteredTasks.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>All tasks that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => openTaskDetails(task)}
                    >
                      <div className={`rounded-full ${getIconBgColor(task.type)} p-2 shrink-0`}>
                        {getTaskIcon(task.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{task.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {getTaskTypeLabel(task.type)}
                            </Badge>
                          </div>
                          <Badge variant="outline" className={`text-xs ${getPriorityBadgeColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                              {getDaysRemaining(task.dueDate) <= 7 && (
                                <span className="text-red-500 ml-1">({getDaysRemaining(task.dueDate)} days left)</span>
                              )}
                            </p>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              openTaskDetails(task)
                            }}
                          >
                            View Details <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-2 text-lg font-semibold">All Caught Up!</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchQuery || typeFilter !== "all" || priorityFilter !== "all"
                        ? "No tasks match your current filters."
                        : "You have no pending tasks at the moment."}
                    </p>
                    {(searchQuery || typeFilter !== "all" || priorityFilter !== "all") && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearchQuery("")
                          setTypeFilter("all")
                          setPriorityFilter("all")
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Tasks</CardTitle>
              <CardDescription>Tasks that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTasks.filter((t) => t.priority === "high").length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks
                    .filter((t) => t.priority === "high")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => openTaskDetails(task)}
                      >
                        <div className={`rounded-full ${getIconBgColor(task.type)} p-2 shrink-0`}>
                          {getTaskIcon(task.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{task.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {getTaskTypeLabel(task.type)}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                            {task.dueDate && (
                              <p className="text-xs text-muted-foreground">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                {getDaysRemaining(task.dueDate) <= 7 && (
                                  <span className="text-red-500 ml-1">
                                    ({getDaysRemaining(task.dueDate)} days left)
                                  </span>
                                )}
                              </p>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 ml-auto"
                              onClick={(e) => {
                                e.stopPropagation()
                                openTaskDetails(task)
                              }}
                            >
                              View Details <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-2 text-lg font-semibold">No High Priority Tasks</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You don't have any high priority tasks at the moment.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTasks.filter((t) => t.dueDate && getDaysRemaining(t.dueDate) <= 7).length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks
                    .filter((t) => t.dueDate && getDaysRemaining(t.dueDate) <= 7)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => openTaskDetails(task)}
                      >
                        <div className={`rounded-full ${getIconBgColor(task.type)} p-2 shrink-0`}>
                          {getTaskIcon(task.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{task.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {getTaskTypeLabel(task.type)}
                              </Badge>
                            </div>
                            <Badge variant="outline" className={`text-xs ${getPriorityBadgeColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                            {task.dueDate && (
                              <p className="text-xs text-muted-foreground">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                <span className="text-red-500 ml-1">({getDaysRemaining(task.dueDate)} days left)</span>
                              </p>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 ml-auto"
                              onClick={(e) => {
                                e.stopPropagation()
                                openTaskDetails(task)
                              }}
                            >
                              View Details <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-2 text-lg font-semibold">No Upcoming Tasks</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You don't have any tasks due in the next 7 days.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Details Dialog */}
      <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`rounded-full ${selectedTask ? getIconBgColor(selectedTask.type) : ""} p-1`}>
                {selectedTask && getTaskIcon(selectedTask.type)}
              </div>
              {selectedTask?.title}
              {selectedTask && (
                <Badge variant="outline" className={`ml-2 ${getPriorityBadgeColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{selectedTask?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">{selectedTask && renderTaskDetails(selectedTask)}</ScrollArea>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {selectedTask?.actionUrl && (
              <Button onClick={() => router.push(selectedTask.actionUrl!)}>
                {selectedTask.actionText || "Take Action"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
