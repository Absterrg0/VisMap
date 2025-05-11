"use client"

import { useState } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatArea } from "@/components/chat-area"

import { SidebarProvider } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/mode-toggle"
import type { Project, Chat } from "@/types/types"

export function ChatInterface() {
  // Sample data for projects and chats
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Personal Assistant",
      chats: [
        { id: "1-1", name: "Travel Planning", lastUpdated: new Date() },
        { id: "1-2", name: "Meal Prep Ideas", lastUpdated: new Date() },
        { id: "1-3", name: "Workout Routine", lastUpdated: new Date() },
      ],
    },
    {
      id: "2",
      name: "Work Projects",
      chats: [
        { id: "2-1", name: "Q2 Strategy", lastUpdated: new Date() },
        { id: "2-2", name: "Marketing Campaign", lastUpdated: new Date() },
        { id: "2-3", name: "Product Roadmap", lastUpdated: new Date() },
      ],
    },
    {
      id: "3",
      name: "Learning",
      chats: [
        { id: "3-1", name: "JavaScript Advanced", lastUpdated: new Date() },
        { id: "3-2", name: "Machine Learning Basics", lastUpdated: new Date() },
        { id: "3-3", name: "Design Patterns", lastUpdated: new Date() },
      ],
    },
  ])

  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)

  const handleChatSelect = (projectId: string, chatId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const chat = project.chats.find((c) => c.id === chatId)
      if (chat) {
        setActiveProject(project)
        setActiveChat(chat)
      }
    }
  }

  const handleNewChat = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const newChat: Chat = {
        id: `${projectId}-${project.chats.length + 1}`,
        name: "New Chat",
        lastUpdated: new Date(),
      }

      const updatedProjects = projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            chats: [...p.chats, newChat],
          }
        }
        return p
      })

      setProjects(updatedProjects)
      setActiveProject(project)
      setActiveChat(newChat)
    }
  }

  const toggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor)
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider>
        <ChatSidebar
          projects={projects}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          activeChat={activeChat}
        />
        <div className="flex flex-1 flex-col h-screen relative">
          <div className="absolute top-4 right-4 z-20">
            <ModeToggle />
          </div>
          <div className="flex flex-1">
            <ChatArea
              activeChat={activeChat}
              activeProject={activeProject}
              onToggleCodeEditor={toggleCodeEditor}
              showCodeEditor={showCodeEditor}
            />
            {showCodeEditor && <>Hello</>}
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}
