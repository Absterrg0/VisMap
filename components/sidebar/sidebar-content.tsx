"use client"

import type React from "react"

import type { ChatSidebarProps } from "./chat-sidebar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

import { MessageSquare, Search, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { ChatHistory, Project } from "@/types/types"

import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { ProjectSelector } from "@/components/sidebar/project-selector"
import { SearchInput } from "@/components/sidebar/search-input"
import { ChatItem } from "@/components/sidebar/chat-item"
import axios from 'axios'

export function SidebarContents({ projects, selectedProjectId }: ChatSidebarProps) {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const fetchProjectDetails = async ()=>{
    const response = await axios.get<{project:Project}>(`/api/project/${selectedProjectId}`)
    setSelectedProject(response.data.project)
  }

  useEffect(()=>{
    if(selectedProjectId){
      fetchProjectDetails()
    }
  },[projects])

  const handleChatSelect = (projectId: string, chatId: string) => {
    router.push(`/project/${projectId}/chat/${chatId}`)
  }

  const handleNewChat = () => {
    if (selectedProject) {

      router.push(`/${selectedProject.id}/chat/new`)
    }
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="flex flex-col h-full bg-sidebar-primary-foreground">
      <div className={cn("pt-4 pb-2", isCollapsed ? "px-1" : "px-3")}>
        <SidebarHeader className="border-none space-y-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <ProjectSelector
                projects={projects}
                selectedProject={selectedProject}
                isCollapsed={isCollapsed}
                onProjectSelect={handleProjectSelect}
              />
            </SidebarMenuItem>
          </SidebarMenu>

          {!isCollapsed && (
            <div>
              <SidebarGroup className="py-0">
                <SidebarGroupContent>
                  <SearchInput
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          )}

          {isCollapsed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 bg-sidebar-accent/30 text-sidebar-primary hover:bg-sidebar-accent/50 rounded-lg transition-all duration-200"
                    aria-label="Search chats"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-white/90 dark:bg-zinc-100/90 text-zinc-800 backdrop-blur-md border border-zinc-200/60 shadow-sm"
                >
                  Search chats
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </SidebarHeader>
      </div>

      <div className="h-px bg-sidebar-border/30 mx-3" />

      <div className="flex-1 overflow-hidden">
        <div className={cn("pt-3 h-full", isCollapsed ? "px-1" : "px-3")}>
          <SidebarContent className="h-full bg-sidebar-border/40 rounded-sm">
            {selectedProject && (
              <SidebarGroup key={selectedProject.id} className="h-full">
                {!isCollapsed && (
                  <div className="flex items-center justify-between px-2 mb-2">
                    <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/80">
                      Chats {selectedProject.chatHistory.length > 0 && `(${selectedProject.chatHistory.length})`}
                    </SidebarGroupLabel>

                    {searchQuery && selectedProject.chatHistory.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground/80 hover:text-sidebar-foreground"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}

                <SidebarGroupContent className="h-[calc(100%-2rem)]">
                  <ScrollArea className={cn("h-full", isCollapsed ? "pr-1" : "pr-3")}>
                    <SidebarMenu className={cn("space-y-2 pb-4", isCollapsed && "items-center")}>
                      {selectedProject.chatHistory.length > 0 ? (
                        selectedProject.chatHistory.map((chat:ChatHistory) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={selectedProject.id === chat.id}
                            isCollapsed={isCollapsed}
                            onSelect={() => handleChatSelect(selectedProject.id, chat.id)}
                          />
                        ))
                      ) : (
                        <div className={cn(
                          "flex flex-col items-center justify-center text-sm text-muted-foreground/80 bg-sidebar-accent/90 rounded-lg border border-dashed border-sidebar-border/40 my-2",
                          isCollapsed ? "px-1 py-2" : "px-6 py-6"
                        )}>
                          <MessageSquare className="h-8 w-8 mb-2 text-muted-foreground/50 " />
                          {!isCollapsed && <p className="text-center">{searchQuery ? "No chats found" : "No chats yet"}</p>}
                          {searchQuery && !isCollapsed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-7 text-xs"
                              onClick={() => setSearchQuery("")}
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      )}
                    </SidebarMenu>
                  </ScrollArea>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </div>
      </div>

      <div className="mt-auto">
        <div className="h-px bg-sidebar-border/30 mx-3" />

        <div className={cn("py-3", isCollapsed ? "px-1" : "px-3")}>
          <SidebarFooter className="border-none">
            <div className="flex flex-col items-center gap-3">
              <Button
                variant={isCollapsed ? "ghost" : "default"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  isCollapsed
                    ? "h-8 w-8  bg-primary/90 text-primary-foreground hover:bg-primary rounded-lg "
                    : "w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-10 ",
                  "shadow-sm transition-all duration-200 font-medium",
                )}
                onClick={handleNewChat}
                disabled={!selectedProject}
                aria-label="New Chat"
              >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span>New Chat</span>}
              </Button>

              <div className={cn("flex items-center justify-between pt-1", isCollapsed && "flex-col gap-3")}>
                <ModeToggle />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarTrigger
                        className={cn(
                          "h-8 w-8 flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/10 rounded-lg transition-all duration-200",
                          isCollapsed ? "rotate-180" : "",
                        )}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-white/90 dark:bg-zinc-100/90 text-zinc-800 backdrop-blur-md border border-zinc-200/60 shadow-sm"
                    >
                      {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </SidebarFooter>
        </div>
      </div>
    </div>
  )
}
