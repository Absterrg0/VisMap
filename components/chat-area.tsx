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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useActiveProjectStore } from "@/zustand/store"

interface ChatAreaProps {
  onSendMessage: (message: Message) => void
  messages: Message[]
  steps: Step[]
  activeTab: "chat" | "steps"
  setActiveTab: (tab: "chat" | "steps") => void
}

// Custom scrollbar styles
const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .scrollbar-track-transparent::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thumb-border::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border));
    border-radius: 3px;
  }
  
  .scrollbar-thumb-border:hover::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border) / 0.8);
  }
  
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
`

export function ChatArea({  onSendMessage, messages, steps, activeTab, setActiveTab }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const { activeProject } = useActiveProjectStore()
  const [isLoading, setIsLoading] = useState(false)
  const [inputRows, setInputRows] = useState(1)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const stepsContainerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)


  // Calculate progress metrics
  const completedSteps = useMemo(
    () => steps.filter((step) => step.status === "completed").length,
    [steps],
  )

  const progressPercentage = useMemo(
    () => (steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0),
    [completedSteps, steps.length],
  )

  const scrollChatToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
    // Fallback to ref method
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }


  // Handle keyboard navigation for accessibility
  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, containerType: 'chat' | 'steps') => {
    if (e.key === 'Home' && e.ctrlKey) {
      e.preventDefault()
      if (containerType === 'chat' && chatContainerRef.current) {
        chatContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (containerType === 'steps' && stepsContainerRef.current) {
        stepsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (e.key === 'End' && e.ctrlKey) {
      e.preventDefault()
      if (containerType === 'chat') {
        scrollChatToBottom()
      } else if (containerType === 'steps' && stepsContainerRef.current) {
        stepsContainerRef.current.scrollTo({ 
          top: stepsContainerRef.current.scrollHeight, 
          behavior: 'smooth' 
        })
      }
    }
  }

  useEffect(() => {
    scrollChatToBottom()
  }, [messages])

  useEffect(() => {
    if (activeTab === "steps" && stepsContainerRef.current) {
      const inProgressStepIndex = steps.findIndex(step => step.status === 'in-progress')
      if (inProgressStepIndex !== -1) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          const stepCards = stepsContainerRef.current?.querySelectorAll('[data-step-card]')
          if (stepCards && stepCards[inProgressStepIndex]) {
            stepCards[inProgressStepIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
          }
        }, 100)
      }
    }
  }, [steps, activeTab])

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
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <header className="border-b border-border/40 p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">{activeProject?.name || "No Project Selected"}</h1>
            <p className="text-sm text-muted-foreground">Development Chat & Progress</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 border-primary/20 px-3 py-1.5">
            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
            {completedSteps}/{steps.length} Steps
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
                  {completedSteps}/{steps.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Tab Content */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <div 
              ref={chatContainerRef}
              className="flex-1 px-4 py-6 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-border/80"
              onKeyDown={(e) => handleContainerKeyDown(e, 'chat')}
            >
              <div className="space-y-2 max-w-4xl mx-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex gap-3 w-full", message.role === "USER" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "flex gap-1 max-w-[80%] md:max-w-[70%]",
                        message.role === "USER" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <div
                        className={cn(
                          "shadow-sm border rounded-2xl p-4",
                          message.role === "USER"
                            ? "bg-primary text-primary-foreground border-primary/20"
                            : "bg-card border-border/50",
                        )}
                      >
                        <div className="px-2">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      </div>
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
            </div>
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
                  {completedSteps}/{steps.length} Completed
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div 
                ref={stepsContainerRef}
                className="flex-1 overflow-y-auto scroll-smooth pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-border/80"
                onKeyDown={(e) => handleContainerKeyDown(e, 'steps')}
              >
                <div className="space-y-3 pr-4">
                  {steps.map((step, index) => (
                    <Card
                      key={step.id}
                      data-step-card
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
              </div>
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
