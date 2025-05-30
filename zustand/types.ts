import { Project } from "@/types/types"

export interface PromptStore {
    prompt: string
    setPrompt: (prompt: string) => void
  }
  
  export interface ActiveProjectStore {
    activeProject: Project | null
    setActiveProject: (project: Project) => void
  }



  export interface UserProjectStore {
    projects: Project[]
    setProjects: (projects: Project[]) => void
  }