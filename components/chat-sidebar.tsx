import { SidebarContents } from "./sidebar-content"
import { Sidebar, SidebarRail } from "./ui/sidebar"
import type { Project, Chat } from "@/types/types"

export interface ChatSidebarProps {
  projects: Project[]
  activeChat: Chat | null
  onChatSelect: (projectId: string, chatId: string) => void
  onNewChat: (projectId: string) => void
}


export function ChatSidebar(props: ChatSidebarProps) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border/40 h-full">
      <SidebarContents {...props} />
      <SidebarRail />
    </Sidebar>
  )
}