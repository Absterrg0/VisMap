import { create } from "zustand";
import { PromptStore } from "./types";

export const usePromptStore = create<PromptStore>((set) => ({
    prompt: "",
    setPrompt: (prompt: string) => set({ prompt }),
    template: "static",
    setTemplate: (template: "static" | "interactive") => set({ template }),
  }))