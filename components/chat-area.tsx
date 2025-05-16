"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Project, Chat, Message } from "@/types/types"
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

interface ChatAreaProps {
  activeChat: Chat
  activeProject: Project | null
  onSendMessage: (message: Message) => void
  messages: Message[]
  steps: Step[]
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>
}

export function ChatArea({ activeChat, activeProject, onSendMessage, messages, steps, setSteps }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [inputRows, setInputRows] = useState(1)
  const [activeTab, setActiveTab] = useState<"chat" | "steps">("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      role: 'user',
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

  // Filter out the 0th and last index as mentioned by the user
  const displaySteps = steps.slice(1, -1)

  // Calculate progress based on displaySteps only
  const completedSteps = displaySteps.filter((step) => step.status === "completed").length
  const progressPercentage = displaySteps.length > 0 ? (completedSteps / displaySteps.length) * 100 : 0

  return (
    <SidebarInset className="flex flex-col h-screen bg-background relative w-full border-r border-border/40">
      <header className="border-b border-border/40 p-4 flex items-center justify-between bg-gradient-to-r from-background to-background/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">{activeChat.name}</h1>
          <p className="text-sm text-muted-foreground">{activeProject?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-primary" />
              </div>
              {completedSteps}/{displaySteps.length} Steps
            </div>
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
                <Badge variant="secondary"  className="ml-1">
                  {completedSteps}/{displaySteps.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Tab Content */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 max-w-3xl mx-auto pb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex gap-3", message.role === 'user' ? "justify-end" : "justify-start")}
                  >
                    <Card
                      className={cn(
                        "max-w-[85%] shadow-sm",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground border-primary/50"
                          : "bg-muted/50 border-border/40 hover:bg-muted/70 transition-colors",
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              "flex-shrink-0 mt-1 flex items-center justify-center rounded-full w-8 h-8",
                              message.role === 'user' ? "bg-primary-foreground/20" : "bg-background/70",
                            )}
                          >
                            {message.role === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={cn(
                              "prose prose-sm max-w-none",
                              message.role === 'user' ? "prose-invert" : "dark:prose-invert",
                            )}
                          >
                            {message.content}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <Card className="bg-muted border-border/40 max-w-[85%]">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1 flex items-center justify-center rounded-full w-8 h-8 bg-background/50">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"></div>
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce delay-75"></div>
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Steps Tab Content */}
          <TabsContent value="steps" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
            <div className="p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Project Progress</h2>
                <Badge variant="outline" className="bg-primary/10 px-3 py-1">
                  {completedSteps}/{displaySteps.length} Completed
                </Badge>
              </div>

              <Progress value={progressPercentage} className="mb-6" />

              <ScrollArea className="h-[calc(100vh-250px)] overflow-y-auto">
                <div className="space-y-4">
                  {displaySteps.map((step, index) => (
                    <Card
                      key={step.id}
                      className={cn(
                        "transition-all duration-200 hover:shadow-md",
                        step.status === "completed"
                          ? "bg-green-500/10 border-green-500/30"
                          : step.status === "in-progress"
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-card border-border/50",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {step.status === "completed" ? (
                              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                            ) : step.status === "in-progress" ? (
                              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium flex items-center gap-2">
                                <Badge variant="outline" className="bg-background/50 ">
                                  Step {index + 1}
                                </Badge>
                                {step.title.split(" ")[0]} 
                            {step.path && (
                              <div className=" flex items-center">
                                <div className="text-xs bg-background px-3 py-1.5 rounded-md font-mono truncate max-w-full border border-border/30">
                                  {step.path}
                                </div>
                              </div>
                            )}
                              </div>
                              <Badge
                                variant={
                                  step.status === "completed"
                                    ? "default"
                                    : step.status === "in-progress"
                                      ? "default"
                                      : "outline"
                                }
                                className={cn(
                                  "whitespace-nowrap",
                                  step.status === "completed"
                                    ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                                    : step.status === "in-progress"
                                      ? "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30"
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

      <div className="border-t border-border/40 p-4 bg-gradient-to-b from-background/70 to-background backdrop-blur-sm">
        <form ref={formRef} onSubmit={handleSubmit} className="flex items-end gap-2 max-w-3xl mx-auto relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="resize-none min-h-[2.5rem] py-3 pr-12 bg-background/80 border-border/40 rounded-xl shadow-sm focus:shadow-md transition-shadow"
            rows={inputRows}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-3 bottom-3 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-sm"
            disabled={isLoading || !input.trim()}
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </SidebarInset>
  )
}
