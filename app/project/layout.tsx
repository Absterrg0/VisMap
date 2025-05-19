"use client"

import { ReactNode, useEffect } from "react"
import { ChatSidebar } from "@/components/sidebar/chat-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react"
import { Chat, Project } from "@/types/types"
import OnboardingComponent from "@/components/onboarding"
import axios from "axios"
interface ChatLayoutProps {
  children: ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {

  const [projects, setProjects] = useState<Project[]>([])
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)


  useEffect(()=>{
    async function init(){
      const response = await axios.get<{projects:Project[]}>('/api/project')
      if(response.data.projects.length === 0){
        setIsOnboarding(true);  
      }
      if(response.status === 200){
        setProjects(response.data.projects)
      }
    }
    init()
  },[])

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
        <div className="relative flex flex-1 flex-col h-screen">

          {children}
        </div>
        {isOnboarding && <div className="absolute inset-0  z-50 backdrop-blur-sm bg-background/50 flex flex-col items-center justify-center h-full">
            <OnboardingComponent onProjectCreated={()=>setIsOnboarding(false)} />
          </div>}
      </SidebarProvider>
    </div>
  )
}
