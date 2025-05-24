import { Project } from "@/types/types"

export interface PromptStore {
    prompt: string
    setPrompt: (prompt: string) => void
    finalFile: Record<string, any> | null
    setFinalFile: (finalFile: Record<string, any> | null) => void
    template: "static" | "interactive"
    setTemplate: (template: "static" | "interactive") => void
  }
  
  export interface ActiveProjectStore {
    activeProject: Project | null
    setActiveProject: (project: Project) => void
  }



  export interface UserProjectStore {
    projects: Project[]
    setProjects: (projects: Project[]) => void
  }