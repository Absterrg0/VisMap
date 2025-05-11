"use client"

import { PlusCircle, MessageSquare, FolderOpen } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import type { Project, Chat } from "@/types/types"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  projects: Project[]
  activeChat: Chat | null
  onChatSelect: (projectId: string, chatId: string) => void
  onNewChat: (projectId: string) => void
}

export function ChatSidebar({ projects, activeChat, onChatSelect, onNewChat }: ChatSidebarProps) {
  const router = useRouter()

  const handleChatSelect = (projectId: string, chatId: string) => {
    onChatSelect(projectId, chatId)
    router.push(`/chat/${chatId}`)
  }

  const handleNewChat = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const newChat: Chat = {
        id: `${projectId}-${project.chats.length + 1}`,
        name: "New Chat",
        lastUpdated: new Date(),
      }
      onNewChat(projectId)
      router.push(`/chat/${newChat.id}`)
    }
  }

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-background/50 backdrop-blur-sm border-border/40 hover:bg-accent/50"
          onClick={() => handleNewChat(projects[0].id)}
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {projects.map((project) => (
          <SidebarGroup key={project.id}>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel>
                <div className="flex w-full items-center justify-between">
                  <CollapsibleTrigger className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    {project.name}
                  </CollapsibleTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNewChat(project.id)
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">New chat in {project.name}</span>
                  </Button>
                </div>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {project.chats.map((chat) => (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeChat?.id === chat.id}
                          className={cn(
                            "group relative",
                            activeChat?.id === chat.id && "bg-accent/60 text-accent-foreground",
                          )}
                          onClick={() => handleChatSelect(project.id, chat.id)}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                              <span className="truncate">{chat.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground block mt-1">
                              {format(chat.lastUpdated, "MMM d, yyyy")}
                            </span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
