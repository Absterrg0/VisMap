export interface Chat {
    id: string
    name: string
    lastUpdated: Date
  }
  
  export interface Project {
    id: string
    name: string
    chats: Chat[]
  }
  