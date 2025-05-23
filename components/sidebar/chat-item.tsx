import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { MessageSquare, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { ChatHistory } from "@/types/types"

interface ChatItemProps {
  chat: ChatHistory
  isActive: boolean
  isCollapsed: boolean
  onSelect: () => void
}

export function ChatItem({ chat, isActive, isCollapsed, onSelect }: ChatItemProps) {

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={chat.name}
        className={cn(
          "group relative",
          "text-sidebar-foreground/80 hover:text-sidebar-foreground",
          "transition-all duration-200 ease-in-out",
          isActive && "text-sidebar-foreground"
        )}
      >
        <button
          onClick={onSelect}
          className={cn(
            "w-full flex items-center gap-2",
            "px-2 py-6 rounded-md",
            "hover:bg-sidebar-accent/10 active:bg-sidebar-accent/20",
            "transition-colors duration-200",
            isActive && "bg-sidebar-accent/15",
            isCollapsed && "justify-center px-1"
          )}
          aria-label={`Open chat: ${chat.name}`}
        >
          <div className={cn(
            "rounded-md p-2",
            "transition-colors duration-200",
            isActive 
              ? "bg-sidebar-primary/20 text-sidebar-primary" 
              : "bg-sidebar-accent/10 text-sidebar-foreground/70 group-hover:text-sidebar-foreground",
            isCollapsed ? "p-2" : "p-2"
          )}>
            <MessageSquare className="h-4 w-4 shrink-0" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col flex-1 min-w-0">
              <span className="truncate text-sm font-medium">{chat.name}</span>
            </div>
          )}
        </button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
} 