
'use client'

import { ChatSidebarProps } from "./chat-sidebar"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
  } from "@/components/ui/dropdown-menu"
  import { Button } from "@/components/ui/button"
  import { ModeToggle } from "@/components/mode-toggle"
  import { Label } from "@/components/ui/label"
  import { cn } from "@/lib/utils"
  import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
  } from "@/components/ui/tooltip"

import { MessageSquare, FolderOpen, Search, Plus } from "lucide-react"
import { format } from "date-fns" 
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import type { Project, Chat } from "@/types/types"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInput,
  useSidebar,
} from "@/components/ui/sidebar"


export function SidebarContents({ projects, activeChat, onChatSelect, onNewChat }: ChatSidebarProps) {
    const router = useRouter()
    const params = useParams()
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
  
    useEffect(() => {
      const projectId = params?.projectId as string
      if (projectId) {
        const project = projects.find((p) => p.id === projectId)
        if (project) {
          setSelectedProject(project)
        }
      } else if (projects.length > 0) {
        setSelectedProject(projects[0])
      }
    }, [params?.projectId, projects])
  
    const filteredChats = useMemo(() => {
      if (!selectedProject) return []
      if (!searchQuery.trim()) return selectedProject.chats
      
      return selectedProject.chats.filter((chat) => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }, [selectedProject, searchQuery])
  
    const handleChatSelect = (projectId: string, chatId: string) => {
      onChatSelect(projectId, chatId)
      router.push(`/${projectId}/chat/${chatId}`)
    }
  
    const handleNewChat = () => {
      if (selectedProject) {
        router.push(`/${selectedProject.id}/chat/new`)
      }
    }
  
    const handleProjectSelect = (project: Project) => {
      setSelectedProject(project)
      router.push(`/${project.id}/chat/new`)
    }
  
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    }
  
    return (
      <>
        <SidebarHeader className="px-2 py-4  border-b border-border/40">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Select Project"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="truncate font-medium">
                      {selectedProject ? selectedProject.name : "Select Project"}
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
                  {projects.map((project) => (
                    <DropdownMenuItem 
                      key={project.id} 
                      onSelect={() => handleProjectSelect(project)}
                      className="gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span className="truncate">{project.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
  
          {!isCollapsed && (
            <div className="mt-4">
              <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                  <Label htmlFor="search" className="sr-only">
                    Search chats
                  </Label>
                  <SidebarInput 
                    id="search" 
                    placeholder="Search chats..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 select-none text-muted-foreground" />
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
                    className="h-8 w-8 mt-2"
                    aria-label="Search chats"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Search chats</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </SidebarHeader>
  
        <SidebarContent className={isCollapsed ? "px-0" : "px-1"}>
          {selectedProject && (
            <SidebarGroup key={selectedProject.id}>
              {!isCollapsed && (
                <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
                  Chats
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={activeChat?.id === chat.id} 
                          tooltip={chat.name}
                          className="py-2"
                        >
                          <button 
                            onClick={() => handleChatSelect(selectedProject.id, chat.id)}
                            className="w-full flex items-center"
                            aria-label={`Open chat: ${chat.name}`}
                          >
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate mx-2">{chat.name}</span>
                            {!isCollapsed && (
                              <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                                {format(chat.lastUpdated, "MMM d")}
                              </span>
                            )}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      {searchQuery ? "No chats found" : "No chats yet"}
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
  
        <SidebarFooter className=" border-t border-border/40">
          <div className="flex flex-col gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isCollapsed ? "ghost" : "default"}
                    size={isCollapsed ? "icon" : "default"}
                    className={cn(
                      isCollapsed ? "h-8 w-8" : "w-full gap-2",
                      ""
                    )}
                    onClick={handleNewChat}
                    disabled={!selectedProject}
                    aria-label="New Chat"
                  >
                    <Plus className="h-4 w-4" />
                    {!isCollapsed && <span>New Chat</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className={cn(!isCollapsed && "hidden")}>
                  New Chat
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
  
            <div className={cn(
              "flex items-center", 
              isCollapsed ? "flex-col gap-4" : "justify-between"
            )}>
              <ModeToggle />
    
              {isCollapsed ? (
                <SidebarTrigger className="h-8 w-8" aria-label="Expand sidebar" />
              ) : (
                <SidebarTrigger aria-label="Collapse sidebar" />
              )}
            </div>
          </div>
        </SidebarFooter>
      </>
    )
  }
  