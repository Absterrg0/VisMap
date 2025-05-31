"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {  SendHorizontal, Sparkles, Zap, Brain, Rocket, ArrowRight } from "lucide-react"
import { usePromptStore } from "@/zustand/store"

export function NewChatComponent() {
  const prompt = usePromptStore((state) => state.prompt)
  const setPrompt = usePromptStore((state) => state.setPrompt)

  const [inputRows, setInputRows] = useState(1)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const MIN_ROWS = 1
  const MAX_ROWS = 4
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
    const currentRows = Math.max(MIN_ROWS, Math.floor(textarea.scrollHeight / LINE_HEIGHT))
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
      handleFormSubmit()
    }
  }

  const handleFormSubmit = () => {
    if (!prompt.trim()) return
    router.push("/builder")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleFormSubmit()
  }

  const handleQuickAction = (actionPrompt: string) => {
    // Set the prompt and navigate immediately with the new prompt
    setPrompt(actionPrompt)
    // Navigate immediately since we know the prompt will be set
    router.push("/builder")
  }

  const quickActions = [
    {
      icon: Brain,
      title: "Analyze",
      description: "Break down complex problems",
      prompt: "Help me analyze and understand this complex problem: ",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Generate",
      description: "Create content and ideas",
      prompt: "Generate creative ideas for: ",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500"
    },
    {
      icon: Rocket,
      title: "Build",
      description: "Code and develop projects",
      prompt: "Help me build a project that: ",
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500"
    }
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Sophisticated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl animate-pulse opacity-60" 
             style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-primary/3 to-transparent rounded-full blur-3xl animate-pulse opacity-40" 
             style={{ animationDuration: "12s", animationDelay: "2s" }} />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.15) 1px, transparent 0)`,
               backgroundSize: "40px 40px"
             }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-4xl mx-auto space-y-12">
            
            {/* Hero Section */}
            <div className="text-center space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-full blur-xl opacity-60" />
                <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-2xl border border-primary/20 backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-primary mx-auto" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  What can I help you build today?
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Start a conversation and let&apos;s create something amazing together
                </p>
              </div>
            </div>

            {/* Main Input Area */}
            <div className="animate-in fade-in-0 slide-in-from-bottom-6 duration-700 delay-200">
              <form ref={formRef} onSubmit={handleSubmit} className="relative group">
                <div className={`relative transition-all duration-300 ${
                  isInputFocused 
                    ? 'ring-2 ring-primary/30 shadow-lg shadow-primary/10' 
                    : 'hover:shadow-md'
                } rounded-2xl bg-card/50 backdrop-blur-sm border border-border/60`}>
                  
                  <div className="p-4">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="Describe what you want to build or ask any question..."
                      className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base leading-relaxed"
                      rows={inputRows}
                      style={{ minHeight: `${MIN_ROWS * LINE_HEIGHT + 8}px` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20">
                    <div className="flex items-center gap-2">
                      {/* <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                        title="Attach file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button> */}
                      <div className="text-xs text-muted-foreground">
                        Press Enter to send, Shift+Enter for new line
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        prompt.trim()
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      <span className="text-sm">Send</span>
                      <SendHorizontal className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-300">
              <div className="text-center mb-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.prompt)}
                    className={`group relative p-6 rounded-xl border border-border/50 bg-gradient-to-br ${action.gradient} hover:border-border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-left`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-background/80 ${action.iconColor}`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <h4 className="font-semibold text-foreground">{action.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 bg-muted/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <span>Powered by AI • Start typing to begin your journey</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}