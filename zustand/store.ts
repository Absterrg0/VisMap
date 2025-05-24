import { create } from "zustand";
import { PromptStore, UserProjectStore, ActiveProjectStore } from "./types";
import { Project } from "@/types/types";

export const usePromptStore = create<PromptStore>((set) => ({
    prompt: "",
    setPrompt: (prompt: string) => set({ prompt }),
    finalFile: null,
    setFinalFile: (finalFile: Record<string, any> | null) => set({ finalFile }),
    template: "static",
    setTemplate: (template: "static" | "interactive") => set({ template }),
  }))




  export const useUserProjectStore = create<UserProjectStore>((set) => ({
    projects: [],
    setProjects: (projects: Project[]) => set({ projects }),
  }))





  export const useActiveProjectStore = create<ActiveProjectStore>((set) => ({
    activeProject: null,
    setActiveProject: (project: Project) => set({ activeProject: project }),
  }))