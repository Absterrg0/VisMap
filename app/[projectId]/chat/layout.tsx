"use client"

import { ReactNode } from "react"
import { ChatSidebar } from "@/components/sidebar/chat-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react"
import { Chat, Project } from "@/types/types"
import { ModeToggle } from "@/components/ui/mode-toggle"
interface ChatLayoutProps {
  children: ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {

  const [projects, setProjects] = useState<Project[]>([])

  const [activeChat, setActiveChat] = useState<Chat | null>(null)

  const handleChatSelect = (projectId: string, chatId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const chat = project.chats.find((c) => c.id === chatId)
      if (chat) {
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
      setActiveChat(newChat)
    }
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
          
          {children}
        </div>
      </SidebarProvider>
    </div>
  )
}
