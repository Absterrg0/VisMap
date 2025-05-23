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
    role:'user' | 'assistant'
    content:string
  }

 
 