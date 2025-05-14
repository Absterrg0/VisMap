"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import type { Project, Chat } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarInset } from "@/components/ui/sidebar"

interface ChatAreaProps {
  activeChat: Chat
  activeProject: Project | null
  onSendMessage: (message: string) => void
}

export function ChatArea({ activeChat, activeProject,onSendMessage }: ChatAreaProps) {
  const [messages, setMessages] = useState<string[]>([])
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

    onSendMessage(input)
    setInput("")
    setIsLoading(true)

    try {


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

  return (
    <SidebarInset className="flex flex-col h-screen bg-background relative w-full border-r border-border/40">
      <header className="border-b border-border/40 p-4 flex items-center justify-between bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold">{activeChat.name}</h1>
          <p className="text-sm text-muted-foreground">{activeProject.name}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
      </div>

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
    </SidebarInset>
  )
}
