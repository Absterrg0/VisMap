"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ChatArea } from "@/components/chat-area"
import { CodeEditor } from "@/components/code-editor"
import type { Project, Chat } from "@/types/types"
import { Step, StepType } from "@/types/stepType"
import { parseXml } from "@/lib/steps"
import { mermaidPrompt } from "@/templates/mermaid"
import { FileText, Folder, TerminalSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sampleProjects } from "@/temp/second"
import { prompt } from "@/temp/second"


export function ChatInterface() {
  const params = useParams()
  const chatId = params.chatId as string




  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [selectedStep, setSelectedStep] = useState<Step | null>(null)
  const [steps, setSteps] = useState<Step[]>(parseXml(prompt))


  
  useEffect(() => {
    if (chatId) {
      // Find the chat and its project
      for (const project of sampleProjects) {
        const chat = project.chats.find(c => c.id === chatId)
        if (chat) {
          setActiveChat(chat)
          setActiveProject(project)
          break
        }
      }
    } else {
      setActiveChat(null)
      setActiveProject(null)
    }
  }, [chatId])

  const getStepIcon = (type: StepType) => {
    switch (type) {
      case StepType.CreateFile:
        return <FileText className="h-4 w-4" />
      case StepType.CreateFolder:
        return <Folder className="h-4 w-4" />
      case StepType.RunScript:
        return <TerminalSquare className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const toggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor)
  }

  // If no chat is selected, show a welcome message
  if (!activeChat) {
    return (
      <div className="flex-1  flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
          <p className="text-muted-foreground">Select a chat from the sidebar to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1  h-full">
      {/* Main Chat Area with Steps */}
      <div className="flex-1 flex flex-col border-r border-border/40">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="border-b border-border/40 px-4">
            <TabsList className="bg-transparent h-10">
              <TabsTrigger value="chat" className="data-[state=active]:bg-background/60">
                Chat
              </TabsTrigger>
              <TabsTrigger value="steps" className="data-[state=active]:bg-background/60">
                Steps
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 p-0 m-0">
            <ChatArea
              activeChat={activeChat}
              activeProject={activeProject}
              onToggleCodeEditor={toggleCodeEditor}
              showCodeEditor={showCodeEditor}
            />
          </TabsContent>

          <TabsContent value="steps" className="flex-1 p-0 m-0">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border/40">
                <h2 className="text-lg font-medium">Project Steps</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Steps generated from your chat conversation
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setSelectedStep(step)}
                      className={cn(
                        "w-full p-3 text-left rounded-lg flex items-center gap-3 hover:bg-accent/50 transition-colors",
                        selectedStep?.id === step.id && "bg-accent"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getStepIcon(step.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{step.title}</div>
                        {step.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          step.status === 'completed' && "bg-green-500/10 text-green-500",
                          step.status === 'in-progress' && "bg-blue-500/10 text-blue-500",
                          step.status === 'pending' && "bg-gray-500/10 text-gray-500"
                        )}>
                          {step.status}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Code Editor */}
      {showCodeEditor && <CodeEditor />}
    </div>
  )
}
