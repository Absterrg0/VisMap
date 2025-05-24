export interface ChatHistory {
    id: string
    name: string
    messages: Message[]
    lastUpdated: Date
  }
  
  export interface Project {
    id: string
    name: string
    chatHistory: ChatHistory[]
  }
  


  export interface Message{
    role:'USER' | 'ASSISTANT'
    content:string
  }

  // Mount structure types for WebContainer
  export interface MountStructureItem {
    file?: {
      content: string
    }
    directory?: Record<string, MountStructureItem>
  }

  export type MountStructure = Record<string, MountStructureItem>

 
 