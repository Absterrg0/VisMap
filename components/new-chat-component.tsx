


"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SendHorizontal, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function NewChatComponent() {
  const [prompt, setPrompt] = useState("")
  const [inputRows, setInputRows] = useState(1)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    adjustRows(e)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) form.requestSubmit()
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!prompt.trim()) return

    // In a real app, you would create a new chat and get its ID
    // For now, we'll just redirect to a mock chat ID
    const mockChatId = Date.now().toString()
    router.push(`/chat/${mockChatId}`)
  }

  const focusTextarea = () => {
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-8 px-4">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto" />
          <h2 className="text-2xl font-semibold">Start a new conversation</h2>
          <p className="max-w-md text-muted-foreground">Type your message below to begin chatting</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="w-full">
          <div className="relative w-full metallic-accent rounded-lg p-1">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className={cn(
                "resize-none p-4 pr-12 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 border-0",
                "bg-background/80 backdrop-blur-sm",
                inputRows > 1 ? "pb-10" : ""
              )}
              rows={inputRows}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!prompt.trim()}
              className={cn(
                "absolute right-3",
                inputRows > 1 ? "bottom-3" : "top-1/2 -translate-y-1/2",
                "bg-transparent hover:bg-accent/50"
              )}
            >
              <SendHorizontal className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
