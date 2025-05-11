"use client"

import { PlusCircle, MessageSquare, FolderOpen } from "lucide-react"
import { format } from "date-fns"
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
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-background/50 backdrop-blur-sm border-border/40 hover:bg-accent/50"
          onClick={() => onNewChat(projects[0].id)}
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {projects.map((project) => (
          <SidebarGroup key={project.id}>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    {project.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNewChat(project.id)
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">New chat in {project.name}</span>
                  </Button>
                </CollapsibleTrigger>
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
                          onClick={() => onChatSelect(project.id, chat.id)}
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
