"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import type { Message } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal, Bot, User, CheckCircle2, Clock, Circle, ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarInset } from "@/components/ui/sidebar"
import type { Step } from "@/types/stepType"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useActiveProjectStore } from "@/zustand/store"

interface ChatAreaProps {
  chatId: string
  onSendMessage: (message: Message) => void
  messages: Message[]
}

export function ChatArea({ chatId, onSendMessage, messages }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const { activeProject } = useActiveProjectStore()
  const [isLoading, setIsLoading] = useState(false)
  const [inputRows, setInputRows] = useState(1)
  const [activeTab, setActiveTab] = useState<"chat" | "steps">("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mock steps data - in a real app, this would come from the project or API
  const displaySteps: Step[] = useMemo(
    () => [
      {
        id: 1,
        title: "Initialize Project",
        description: "Set up project structure",
        type: 0, // CreateFile
        status: "completed",
        path: "/src",
      },
      {
        id: 2,
        title: "Create Components",
        description: "Build UI components",
        type: 0, // CreateFile
        status: "in-progress",
        path: "/src/components",
      },
      {
        id: 3,
        title: "Setup Routing",
        description: "Configure application routes",
        type: 0, // CreateFile
        status: "pending",
        path: "/src/routes",
      },
      {
        id: 4,
        title: "Add Styling",
        description: "Style the application",
        type: 1, // CreateFolder
        status: "pending",
        path: "/src/styles",
      },
    ],
    [],
  )

  // Calculate progress metrics
  const completedSteps = useMemo(
    () => displaySteps.filter((step) => step.status === "completed").length,
    [displaySteps],
  )

  const progressPercentage = useMemo(
    () => (displaySteps.length > 0 ? Math.round((completedSteps / displaySteps.length) * 100) : 0),
    [completedSteps, displaySteps.length],
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    adjustRows(e)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    onSendMessage({
      role: "USER",
      content: input,
    })
    setInput("")
    setIsLoading(true)

    try {
      // API call would go here
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) form.requestSubmit()
    }
  }

  const adjustRows = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textareaLineHeight = 24
    const minRows = 1
    const maxRows = 20

    const previousRows = e.target.rows
    e.target.rows = minRows

    const currentRows = Math.floor(e.target.scrollHeight / textareaLineHeight)

    if (currentRows === previousRows) {
      e.target.rows = currentRows
    } else {
      e.target.rows = currentRows > maxRows ? maxRows : currentRows
    }

    setInputRows(e.target.rows)
  }

  return (
    <SidebarInset className="flex flex-col h-screen bg-background relative w-full border-r border-border/40">
      <header className="border-b border-border/40 p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">{activeProject?.name || "No Project Selected"}</h1>
            <p className="text-sm text-muted-foreground">Development Chat & Progress</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 border-primary/20 px-3 py-1.5">
            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
            {completedSteps}/{displaySteps.length} Steps
          </Badge>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "chat" | "steps")}
          className="flex-1 flex flex-col"
        >
          <div className="border-b border-border/40 bg-muted/30 px-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto my-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="steps" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Steps
                <Badge variant="secondary" className="ml-1">
                  {completedSteps}/{displaySteps.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Tab Content */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <ScrollArea className="flex-1 px-4 py-6">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex gap-3 w-full", message.role === "USER" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "flex gap-3 max-w-[80%] md:max-w-[70%]",
                        message.role === "USER" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                          message.role === "USER"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border border-border",
                        )}
                      >
                        {message.role === "USER" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <Card
                        className={cn(
                          "shadow-sm border",
                          message.role === "USER"
                            ? "bg-primary text-primary-foreground border-primary/20"
                            : "bg-card border-border/50",
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="m-0 leading-relaxed">{message.content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 w-full justify-start">
                    <div className="flex gap-3 max-w-[80%] md:max-w-[70%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <Card className="bg-card border-border/50 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"></div>
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce delay-75"></div>
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce delay-150"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Steps Tab Content */}
          <TabsContent value="steps" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Project Progress</h2>
                  <p className="text-sm text-muted-foreground mt-1">Track your development milestones</p>
                </div>
                <Badge variant="outline" className="bg-primary/10 border-primary/20 px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {completedSteps}/{displaySteps.length} Completed
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  {displaySteps.map((step, index) => (
                    <Card
                      key={step.id}
                      className={cn(
                        "transition-all duration-200 hover:shadow-md border",
                        step.status === "completed"
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30"
                          : step.status === "in-progress"
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30"
                            : "bg-card border-border/50 hover:border-border/80",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {step.status === "completed" ? (
                              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                            ) : step.status === "in-progress" ? (
                              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge variant="outline" className="bg-background/80 text-xs px-2 py-1 flex-shrink-0">
                                  Step {index + 1}
                                </Badge>
                                <h3 className="font-medium text-sm truncate">{step.title}</h3>
                              </div>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs flex-shrink-0",
                                  step.status === "completed"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : step.status === "in-progress"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                      : "bg-muted text-muted-foreground",
                                )}
                              >
                                {step.status === "completed"
                                  ? "Completed"
                                  : step.status === "in-progress"
                                    ? "In Progress"
                                    : "Pending"}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                            {step.path && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Path:</span>
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono border">{step.path}</code>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t border-border/40 p-4 bg-background/95 backdrop-blur-sm">
        <form ref={formRef} onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="resize-none min-h-[3rem] py-3 pr-12 bg-background border-border/60 rounded-xl shadow-sm focus:shadow-md transition-all focus:border-primary/50"
              rows={inputRows}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <SendHorizontal className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>
    </SidebarInset>
  )
}
