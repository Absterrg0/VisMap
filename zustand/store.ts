import { create } from "zustand";
import { PromptStore, UserProjectStore, ActiveProjectStore } from "./types";
import { Project } from "@/types/types";

export const usePromptStore = create<PromptStore>((set) => ({
    prompt: "",
    setPrompt: (prompt: string) => set({ prompt }),
  }))




  export const useUserProjectStore = create<UserProjectStore>((set) => ({
    projects: [],
    setProjects: (projects: Project[]) => set({ projects }),
  }))


  export const useActiveProjectStore = create<ActiveProjectStore>((set) => ({
    activeProject: null,
    setActiveProject: (project: Project) => set({ activeProject: project }),
  }))