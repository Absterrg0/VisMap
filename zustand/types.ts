export interface PromptStore {
    prompt: string
    setPrompt: (prompt: string) => void
    template: "static" | "interactive"
    setTemplate: (template: "static" | "interactive") => void
  }
  