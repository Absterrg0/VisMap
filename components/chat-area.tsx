"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import type { Project, Chat } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal, Bot, User, Sparkles, Code } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarInset } from "@/components/ui/sidebar"

interface ChatAreaProps {
  activeChat: Chat | null
  activeProject: Project | null
  showCodeEditor: boolean
  onToggleCodeEditor: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatArea({ activeChat, activeProject, showCodeEditor, onToggleCodeEditor }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [inputRows, setInputRows] = useState(1)
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await axios.post("/api/chat", {
        message: userMessage.content
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.message
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      // Optionally add error handling UI here
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
    const maxRows = 5

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

  const focusTextarea = () => {
    textareaRef.current?.focus()
  }

  // Check if this is a new chat with no messages
  const isNewChat = activeChat && messages.length === 0

  return (
    <SidebarInset
      className={cn(
        "flex flex-col h-screen bg-background relative",
        showCodeEditor ? "w-full border-r border-border/40" : "w-full",
      )}
    >
      <header className="border-b border-border/40 p-4 flex items-center justify-between bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          {activeProject && activeChat ? (
            <div>
              <h1 className="text-xl font-semibold">{activeChat.name}</h1>
              <p className="text-sm text-muted-foreground">{activeProject.name}</p>
            </div>
          ) : (
            <h1 className="text-xl font-semibold">Select a chat or create a new one</h1>
          )}
        </div>
        {activeChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCodeEditor}
            className="gap-2 bg-background/50 backdrop-blur-sm border-border/40 hover:bg-accent/50"
          >
            <Code className="h-4 w-4" />
            {showCodeEditor ? "Hide Code" : "Show Code"}
          </Button>
        )}
      </header>

      <div
        className={cn("flex-1 overflow-y-auto p-4 space-y-6", isNewChat && "flex flex-col justify-center items-center")}
      >
        {!activeChat && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground">
            <Sparkles className="h-12 w-12" />
            <h2 className="text-2xl font-semibold">Welcome to your Professional Chat Interface</h2>
            <p className="max-w-md">Select a chat from the sidebar or create a new one to get started</p>
          </div>
        )}

        {isNewChat ? (
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-6 px-4">
            <div className="text-center space-y-4">
              <Sparkles className="h-12 w-12 mx-auto" />
              <h2 className="text-2xl font-semibold">Start a new conversation</h2>
              <p className="max-w-md text-muted-foreground">Type your message below to begin chatting</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="w-full">
              <div className="relative w-full metallic-accent rounded-lg p-1">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    handleInputChange(e)
                    adjustRows(e)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="resize-none min-h-[6rem] py-3 pr-12 bg-background/60 border-border/20 rounded-md focus-visible:ring-primary/30"
                  rows={Math.max(3, inputRows)}
                  autoFocus
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-3 bottom-3 h-8 w-8 bg-primary/90 hover:bg-primary"
                  disabled={isLoading || !input.trim()}
                >
                  <SendHorizontal className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              <Button variant="outline" size="sm" onClick={focusTextarea} className="bg-background/50 border-border/40">
                Help me with a coding problem
              </Button>
              <Button variant="outline" size="sm" onClick={focusTextarea} className="bg-background/50 border-border/40">
                Explain a complex concept
              </Button>
              <Button variant="outline" size="sm" onClick={focusTextarea} className="bg-background/50 border-border/40">
                Generate creative content
              </Button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-3xl mx-auto",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "flex gap-3 rounded-lg p-4 max-w-[85%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-accent/40 text-accent-foreground border border-border/40",
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className="prose dark:prose-invert prose-sm">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-3xl mx-auto">
                <div className="flex gap-3 rounded-lg p-4 bg-accent/40 text-accent-foreground border border-border/40">
                  <div className="flex-shrink-0 mt-1">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="prose dark:prose-invert prose-sm">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce delay-75"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {!isNewChat && activeChat && (
        <div className="border-t border-border/40 p-4 bg-background/80 backdrop-blur-sm">
          <form ref={formRef} onSubmit={handleSubmit} className="flex items-end gap-2 max-w-3xl mx-auto relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                handleInputChange(e)
                adjustRows(e)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="resize-none min-h-[2.5rem] py-2 pr-10 bg-background border-border/40"
              rows={inputRows}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 bg-primary/90 hover:bg-primary"
              disabled={isLoading || !input.trim()}
            >
              <SendHorizontal className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      )}
    </SidebarInset>
  )
}
