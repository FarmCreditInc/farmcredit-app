"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CheckCircle, AlertTriangle, Info, MessageSquare, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createNotification } from "@/actions/notification-actions"
import { toast } from "@/components/ui/use-toast"

const notificationFormSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters.",
    })
    .max(100, {
      message: "Title must not be longer than 100 characters.",
    }),
  message: z
    .string()
    .min(10, {
      message: "Message must be at least 10 characters.",
    })
    .max(500, {
      message: "Message must not be longer than 500 characters.",
    }),
  type: z.enum(["info", "success", "warning", "message"]),
  recipient_type: z.enum(["farmers", "lenders", "both"]),
})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

export function NotificationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
      recipient_type: "farmers",
    },
  })

  async function onSubmit(data: NotificationFormValues) {
    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("message", data.message)
      formData.append("type", data.type)
      formData.append("recipient_type", data.recipient_type)

      const result = await createNotification(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to send notification")
      }

      toast({
        title: "Notification sent",
        description: `Your notification has been sent to ${data.recipient_type}.`,
      })

      // Reset form
      form.reset()

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Notification</CardTitle>
        <CardDescription>
          Send notifications to farmers, lenders, or both. Notifications will appear in their dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Notification title" {...field} />
                  </FormControl>
                  <FormDescription>A short, descriptive title for your notification.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the notification message here..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The main content of your notification. Be clear and concise.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">
                          <div className="flex items-center">
                            <Info className="mr-2 h-4 w-4 text-blue-500" />
                            Information
                          </div>
                        </SelectItem>
                        <SelectItem value="success">
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Success
                          </div>
                        </SelectItem>
                        <SelectItem value="warning">
                          <div className="flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                            Warning
                          </div>
                        </SelectItem>
                        <SelectItem value="message">
                          <div className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
                            Message
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The type of notification determines its appearance.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipient_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipients</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="farmers">Farmers Only</SelectItem>
                        <SelectItem value="lenders">Lenders Only</SelectItem>
                        <SelectItem value="both">Both Farmers and Lenders</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Who should receive this notification.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>Sending Notification...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
