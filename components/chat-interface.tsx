"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ChatArea } from "@/components/chat-area"
import { CodeEditor } from "@/components/code-editor"
import type { Project, Chat } from "@/types/types"
import { Step } from "@/types/stepType"
import { parseXml } from "@/lib/steps"
import { sampleProjects } from "@/temp/second"
import axios from "axios"
import { Message } from "@/types/types"
export function ChatInterface() {
  const params = useParams()
  const chatId = params.chatId as string

  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [selectedStep, setSelectedStep] = useState<Step | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const handleSendMessage = async (message: Message) => {
    // Add the user message to the messages array
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    
    // Reset steps before processing new message
    setSteps([]);
    
    try {
      // Call the API to get response from LLM
      const response = await axios.post<{ roadmap: string }>("/api/chat", {
        prompt: message.input
      });
        
      // Parse the XML response
      const parsedResult = parseXml(response.data.roadmap);
      console.log("parsedResult", parsedResult);
      
      // Set the steps from the parsed result
      setSteps(parsedResult.steps);
      
      // Add the assistant's response as const handleSendMessage = async (message: Message) => {
  // Add the user message to the messages array
  const updatedMessages = [...messages, message];
  setMessages(updatedMessages);
  
  // Reset steps before processing new message
  setSteps([]);
  
  try {
    // Call the API to get response from LLM
    const response = await axios.post<{ roadmap: string }>("/api/chat", {
      prompt: message.input
    });
      
    // Parse the XML response
    const parsedResult = parseXml(response.data.roadmap);
    console.log("parsedResult", parsedResult);
    
    // Set the steps from the parsed result
    setSteps(parsedResult.steps);
    
    // Add the assistant's response as a new message 
    // (not replacing the previous messages array)
    setMessages([
      ...updatedMessages, 
      { 
        input: "", // Empty input means it's from the assistant
        output: parsedResult.description 
      }
    ]);
  } catch (error) {
    console.error("Error processing response:", error);
    // Add an error message to the chat
    setMessages([
      ...updatedMessages,
      {
        input: "",
        output: "Sorry, there was an error processing your request."
      }
    ]);
  }
}
      // (not replacing the previous messages array)
      setMessages([
        ...updatedMessages, 
        { 
          input: "", // Empty input means it's from the assistant
          output: parsedResult.description 
        }
      ]);
    } catch (error) {
      console.error("Error processing response:", error);
      // Add an error message to the chat
      setMessages([
        ...updatedMessages,
        {
          input: "",
          output: "Sorry, there was an error processing your request."
        }
      ]);
    }
  }

  useEffect(() => {
    if (chatId) {
      // Find the chat and its project
      for (const project of sampleProjects) {
        const chat = project.chats.find(c => c.id === chatId)
        if (chat) {
          setActiveChat(chat)
          setActiveProject(project)
          break
        }
      }
    } else {
      setActiveChat(null)
      setActiveProject(null)
    }
  }, [chatId])

  // If no chat is selected, show a welcome message
  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
          <p className="text-muted-foreground">Select a chat from the sidebar to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 h-full bg-background text-foreground">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col border-r border-border/40 bg-background">
        <ChatArea
          activeChat={activeChat}
          activeProject={activeProject}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Code Editor - Always visible */}
      <div className="w-1/2 h-full">
        <CodeEditor
          steps={steps}
          onUpdate={(updatedSteps) => setSteps(updatedSteps)}
        />
      </div>
    </div>
  )
}
