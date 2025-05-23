import { SidebarContents } from "./sidebar-content"
import { Sidebar, SidebarRail } from "../ui/sidebar"
import type { Project, ChatHistory } from "@/types/types"

export interface ChatSidebarProps {
  projects: Project[]
  selectedProjectId: string
}

export function ChatSidebar(props: ChatSidebarProps) {
  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon" 
      className="border-r border-border/40 h-full bg-gradient-to-b from-sidebar/95 to-sidebar/90 backdrop-blur-sm font-sans"
    >
      <div className="h-full flex flex-col bg-sidebar-accent/30 rounded-r-2xl">
        <SidebarContents {...props} />
        <SidebarRail />
      </div>
    </Sidebar>
  )
}