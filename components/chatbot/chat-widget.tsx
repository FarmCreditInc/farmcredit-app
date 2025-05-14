"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, Send, X, Loader2, Sparkles, RefreshCw, User, AlertCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createOrGetChatSession, saveChatMessage, getChatHistory, getUserInfoForAI } from "@/actions/chat-actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "error"
  timestamp: Date
}

interface AIMessage {
  message_position: number
  sender: "user" | "ai"
  message: string
}

interface UserInfo {
  name: string
  wallet_balance: number | null
  available_loans: any[]
  credit_score: number | null
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatWidgetRef = useRef<HTMLDivElement>(null)

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsInitializing(true)
        setError(null)

        // Get or create session token from localStorage
        let token = localStorage.getItem("ai_chat_session_token")
        if (!token) {
          token = crypto.randomUUID()
          localStorage.setItem("ai_chat_session_token", token)
        }
        setSessionToken(token)

        // Create or get chat session in database
        const { success, session, error: sessionError } = await createOrGetChatSession(token)
        if (sessionError) {
          console.error("Session error:", sessionError)
          setError(`Failed to initialize chat: ${sessionError}`)
          return
        }

        if (success && session) {
          setSessionId(session.id)

          // Get chat history
          const historyResult = await getChatHistory(session.id)
          if (historyResult.success && historyResult.messages.length > 0) {
            // Convert history to our message format
            const historyMessages = historyResult.messages.map((msg) => ({
              id: `history-${msg.message_position}`,
              content: msg.message,
              role: msg.sender === "user" ? "user" : "assistant",
              timestamp: new Date(),
            }))
            setMessages(historyMessages)
          } else if (historyResult.messages.length === 0) {
            // Add welcome message if no history
            setMessages([
              {
                id: "welcome",
                content: "Hello! I'm your FarmCredit AI assistant. How can I help you today?",
                role: "assistant",
                timestamp: new Date(),
              },
            ])
          }
        }

        // Get user info for AI context
        const userInfoResult = await getUserInfoForAI()
        if (userInfoResult.success) {
          setUserInfo(userInfoResult.userInfo)
        }
      } catch (error) {
        console.error("Error initializing chat:", error)
        setError("Failed to initialize chat. Please try again later.")
      } finally {
        setIsInitializing(false)
      }
    }

    if (isOpen) {
      initializeChat()
    }
  }, [isOpen])

  // Add this effect to check for session inactivity
  useEffect(() => {
    if (!sessionId || !sessionToken) return

    // Check for inactivity when the component mounts or when messages change
    const checkInactivity = async () => {
      if (messages.length === 0) return

      // Get the timestamp of the last message
      const lastMessage = messages[messages.length - 1]
      const lastMessageTime = lastMessage.timestamp.getTime()
      const currentTime = Date.now()

      // If it's been more than an hour (3600000 ms) since the last message
      if (currentTime - lastMessageTime > 3600000) {
        console.log("Chat inactive for more than an hour, starting new session")
        await resetChat()
      }
    }

    checkInactivity()

    // Also set up a timer to periodically check for inactivity
    const inactivityTimer = setInterval(checkInactivity, 60000) // Check every minute

    return () => {
      clearInterval(inactivityTimer)
    }
  }, [messages, sessionId, sessionToken])

  // Auto-scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      scrollToBottom()
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && !isInitializing) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen, isInitializing])

  // Prevent body scrolling when chat is open
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (chatWidgetRef.current && chatWidgetRef.current.contains(e.target as Node)) {
        e.stopPropagation()
      }
    }

    window.addEventListener("wheel", preventScroll, { passive: false })

    return () => {
      window.removeEventListener("wheel", preventScroll)
    }
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle manual scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 20
      setShowScrollButton(!isScrolledToBottom)
    }
  }

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading || !sessionId) return

    // Clear any previous errors
    setError(null)

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Save user message to database
      await saveChatMessage(sessionId, "user", userMessage.content)

      // Prepare context for AI API
      const context: AIMessage[] = messages
        .filter((msg) => msg.role !== "error") // Filter out error messages
        .map((msg, index) => ({
          message_position: index,
          sender: msg.role === "user" ? "user" : "ai",
          message: msg.content,
        }))

      // Add the new user message to context
      context.push({
        message_position: context.length,
        sender: "user",
        message: userMessage.content,
      })

      // Prepare user info with proper defaults
      const safeUserInfo = {
        name: userInfo?.name || "guest",
        wallet_balance: 0, // Default to 0
        available_loans:
          Array.isArray(userInfo?.available_loans) && userInfo.available_loans.length > 0
            ? userInfo.available_loans.map((loan) => ({
                id: loan.id || "string",
                loan_application_id: loan.loan_application_id || "string",
                amount_disbursed: Number(loan.amount_disbursed || 0),
                interest_rate: Number(loan.interest_rate || 0),
                created_at: new Date().toISOString(),
              }))
            : [
                {
                  id: "string",
                  loan_application_id: "string",
                  amount_disbursed: 0,
                  interest_rate: 0,
                  created_at: new Date().toISOString(),
                },
              ],
        credit_score: 0, // Default to 0
      }

      // Call AI API
      console.log("Sending request to AI service:", {
        user_info: safeUserInfo,
        query: userMessage.content,
        context: context,
      })

      const response = await fetch("/api/chat/converse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_info: safeUserInfo,
          query: userMessage.content,
          context: context,
        }),
      })

      const data = await response.json()
      console.log("AI service response:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to get response from AI service")
      }

      // Extract AI response
      const aiResponse = data.response || "I'm sorry, I couldn't process your request at this time."

      // Add AI response to UI
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Save AI message to database
      await saveChatMessage(sessionId, "ai", aiResponse)
    } catch (error) {
      console.error("Error sending message:", error)

      // Set error state
      setError(error instanceof Error ? error.message : "An unknown error occurred")

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again later.",
        role: "error",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const resetChat = async () => {
    if (!sessionToken) return

    setError(null)

    // Generate new session token
    const newToken = crypto.randomUUID()
    localStorage.setItem("ai_chat_session_token", newToken)
    setSessionToken(newToken)

    // Create new session in database
    const { success, session } = await createOrGetChatSession(newToken)
    if (success && session) {
      setSessionId(session.id)

      // Reset messages
      setMessages([
        {
          id: "welcome",
          content: "Hello! I'm your FarmCredit AI assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ])
    }
  }

  // Format message content with line breaks and links
  const formatMessageContent = (content: string) => {
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const withLinks = content.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:underline">${url}</a>`,
    )

    // Replace line breaks with <br> tags
    const withLineBreaks = withLinks.replace(/\n/g, "<br>")

    return withLineBreaks
  }

  // Prevent wheel events from propagating to parent
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 p-0 shadow-lg bg-green-600 hover:bg-green-700 text-white"
        aria-label={isOpen ? "Close chat" : "Open AI chat assistant"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWidgetRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-[90vw] sm:w-[400px] h-[500px] max-h-[80vh] rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
            onWheel={handleWheel}
          >
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-green-50 dark:bg-green-900/20 flex justify-between items-center">
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                  <Bot className="h-4 w-4 text-green-700 dark:text-green-300" />
                </div>
                <div className="ml-2">
                  <h3 className="font-medium">FarmCredit AI Assistant</h3>
                  {userInfo && userInfo.name !== "guest" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {userInfo.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetChat}
                        className="h-8 w-8 rounded-full"
                        aria-label="Reset chat"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start a new conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleChat}
                  className="h-8 w-8 rounded-full"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Error alert */}
            {error && (
              <Alert variant="destructive" className="m-2 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* Chat content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Messages area */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-visible"
              >
                {isInitializing ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex max-w-[85%] rounded-lg p-3",
                          message.role === "user"
                            ? "ml-auto bg-green-100 dark:bg-green-900/30 text-gray-800 dark:text-gray-100"
                            : message.role === "error"
                              ? "bg-red-100 dark:bg-red-900/30 text-gray-800 dark:text-gray-100"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100",
                        )}
                      >
                        <div className="flex flex-col w-full">
                          <div className="flex items-center mb-1">
                            {message.role === "assistant" ? (
                              <div className="h-6 w-6 mr-2 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                            ) : message.role === "error" ? (
                              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                            ) : (
                              <div className="h-6 w-6 mr-2 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(message.timestamp, "HH:mm")}
                            </span>
                          </div>
                          <div
                            className="text-sm whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                          />
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex max-w-[85%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-green-600 dark:text-green-400" />
                          <p className="text-sm">FarmCredit AI is thinking...</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <Button
                  onClick={scrollToBottom}
                  className="absolute bottom-20 right-4 rounded-full h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white shadow-md"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}

              {/* Chat input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-end space-x-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the FarmCredit AI..."
                    className="min-h-[60px] resize-none flex-1"
                    maxRows={4}
                    disabled={isInitializing || isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={input.trim() === "" || isLoading || isInitializing}
                    className="h-10 w-10 rounded-full p-0 bg-green-600 hover:bg-green-700 text-white"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                  <span className="flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" /> Powered by FarmCredit AI
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
