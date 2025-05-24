"use client"

import { useState, useRef, useEffect } from "react"
import {  useParams, useRouter } from "next/navigation"
import { Paperclip, SendHorizontal, Sparkles } from "lucide-react"
import { usePromptStore } from "@/zustand/store"
import axios from 'axios'


export function NewChatComponent() {
  const prompt = usePromptStore((state) => state.prompt)
  const setPrompt = usePromptStore((state) => state.setPrompt)

  const [inputRows, setInputRows] = useState(2)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const projectId = useParams().projectId
  const router = useRouter()
  const MIN_ROWS = 2
  const MAX_ROWS = 6
  const LINE_HEIGHT = 24

  // Sync textarea rows with prompt on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = prompt
      adjustRows({ target: textareaRef.current } as React.ChangeEvent<HTMLTextAreaElement>)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    adjustRows(e)
  }

  const adjustRows = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.rows = MIN_ROWS
    const currentRows = Math.floor(textarea.scrollHeight / LINE_HEIGHT)
    if (currentRows > MAX_ROWS) {
      textarea.rows = MAX_ROWS
      setInputRows(MAX_ROWS)
    } else {
      textarea.rows = currentRows
      setInputRows(currentRows)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) form.requestSubmit()
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!prompt.trim()) return

    const response = await axios.post<{chatHistoryId:string}>(`/api/chatHistory/${projectId}`, { prompt })

    router.push(`/project/${projectId}/chat/${response.data.chatHistoryId}`)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-background text-foreground">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-8 px-4">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-primary drop-shadow-[0_2px_8px_var(--tw-shadow-color)]" />
          <h2 className="text-2xl font-semibold">Start a new conversation</h2>
          <p className="max-w-md text-muted-foreground">Type your message below to begin chatting</p>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="w-full">
          <div className="relative w-full rounded-xl p-1 shadow-lg bg-card border border-border">
            <div className="relative rounded-lg transition-all duration-200 bg-card focus-within:ring-1 focus-within:ring-primary/30 focus-within:shadow-[0_0_0_1px_var(--tw-ring-color)]">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="w-full resize-none p-4 rounded-lg focus:outline-none text-foreground bg-transparent placeholder:text-muted-foreground text-base font-medium"
                rows={inputRows}
                style={{
                  minHeight: `${MIN_ROWS * LINE_HEIGHT}px`,
                  maxHeight: `${MAX_ROWS * LINE_HEIGHT}px`,
                }}
              />
              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted rounded-b-lg">
                <div className="flex items-center space-x-2">
                  <button type="button" className="p-2 rounded-full hover:bg-accent/30 text-muted-foreground hover:text-foreground transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className={`flex items-center justify-center h-9 w-9 rounded-full transition-all shadow-md
                    ${prompt.trim() ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-muted/50 text-muted-foreground cursor-not-allowed'}`}
                >
                  <SendHorizontal className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
