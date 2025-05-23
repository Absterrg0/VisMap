import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/types"

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: Project | null
  isCollapsed: boolean
  onProjectSelect: (project: Project) => void
}

export function ProjectSelector({ 
  projects, 
  selectedProject, 
  isCollapsed, 
  onProjectSelect 
}: ProjectSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          tooltip="Select Project"
          className={cn(
            "data-[state=open]:bg-sidebar-primary/50 data-[state=open]:text-sidebar-primary-foreground bg-sidebar-primary/5 text-sidebar-foreground hover:bg-sidebar-primary/10 border border-sidebar-border/40 rounded-lg transition-all duration-200 w-full hover:text-sidebar-primary",
            isCollapsed && "p-0"
          )}
        >
          <div className={cn("flex items-center w-full", isCollapsed && "justify-center")}>
            <div className={cn("bg-sidebar-primary/20 rounded-md p-2", isCollapsed ? "mr-0" : "mr-2")}>
              <FolderOpen className="h-4 w-4 text-sidebar-primary" />
            </div>
            {!isCollapsed && (
              <span className="truncate font-medium flex-1">
                {selectedProject ? selectedProject.name : "Select Project"}
              </span>
            )}
            {!isCollapsed && <ArrowLeftRight className="h-3 w-3 text-sidebar-foreground/50 ml-1" />}
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] bg-sidebar-foreground/10 backdrop-blur-md border border-sidebar-border/60 rounded-lg shadow-lg"
        align="start"
      >
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onSelect={() => onProjectSelect(project)}
            className="gap-2  text-sidebar-foreground  hover:text-sidebar-primary-foreground group rounded-md m-1 py-2"
          >
            <div className="bg-sidebar-primary/20 rounded-md p-1">
              <FolderOpen className="h-3.5 w-3.5 text-sidebar-primary" />
            </div>
            <span className="truncate">{project.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 