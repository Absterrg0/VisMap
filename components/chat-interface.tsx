"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ChatArea } from "@/components/chat-area"
import { CodeEditor } from "@/components/code-editor"
import type { Project, Chat } from "@/types/types"
import { Step } from "@/types/stepType"
import { parseXml } from "@/lib/steps"
import { sampleProjects } from "@/temp/second"
import { Message } from "@/types/types"
import { usePromptStore } from "@/zustand/store"
import { generateRoadmap } from "@/app/actions/llms/roadmap"
import axios from "axios"


const SERVER_URL = "http://localhost:8080"

export function ChatInterface() {
  const params = useParams()
  const chatId = params.chatId as string

  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const initialPrompt = usePromptStore((state) => state.prompt)
  const [llmPrompt, setLlmPrompt] = useState<Message[]>([
    { role: 'assistant', content: initialPrompt }
  ])
  const [messages, setMessages] = useState<Message[]>([
    { role: 'user', content: initialPrompt }
  ]);
  const [template, setTemplate] = useState<string>("static")
  

  async function init(){

    handleInitialMessage({
      role:'user',
      content:initialPrompt
    })

    
  }

  useEffect(()=>{
    init()
  },[])


 const handleInitialMessage = async (message: Message) => {

  const response = await axios.get<{roadmapPrompt:string,intiialFiles:string}>(`/api/road-map/template?template=${template}`);

  const roadmapPrompt = response.data.roadmapPrompt;
  const intiialFiles = response.data.intiialFiles;

  const initialSteps = await parseXml(intiialFiles);
  setSteps(initialSteps)
  setLlmPrompt(x=>[...x, {role:'assistant', content: roadmapPrompt}])

  const roadmap = await generateRoadmap("123", [...llmPrompt, message], "gemini", "gemini-2.0-flash", "interactive")       

  if(typeof roadmap !== 'string'){
    throw new Error(roadmap.error);
  }

  const parsedResult = parseXml(roadmap).map((step:Step)=>({
    ...step,
    status:'pending' as 'pending'
  }))
  setSteps(parsedResult)
  setMessages(x=>[...x, {role:'assistant', content: parsedResult[0].description}])
  setLlmPrompt(x=>[...x, {role:'assistant', content: roadmap}])
  setLlmPrompt(x=>[...x, {role:'user', content: message.content}])
 }


  const handleSendMessage = async (message: Message) => {
    // Add the user message to the messages array
    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)

    try {
      // Call the API to get response from LLM
     const roadmap = await generateRoadmap("123", [...llmPrompt, { role: 'user', content: message.content }], "gemini", "gemini-2.0-flash", "interactive")       

      if (typeof roadmap !== 'string') {
        throw new Error(roadmap.error);
      }

      // Parse the XML response
      const parsedResult = parseXml(roadmap).map((step:Step)=>({
        ...step,
        status:'pending' as 'pending'
      }))
      console.log("parsedResult", parsedResult)

      // Set the steps from the parsed result
      setSteps([...steps, ...parsedResult])

      setLlmPrompt(x=>[...x, {role:'user', content: message.content}])

      setLlmPrompt(x=>[...x, {role:'assistant', content: roadmap}])

      setMessages(x=>[...x, {role:'assistant', content: parsedResult[0].description}])
    } catch (error) {
      console.error("Error processing response:", error)

      setMessages(x=>[...x, {
          role:'assistant',
          content: "Sorry, there was an error processing your request.",
        },
      ])
    }
  }

  useEffect(() => {
    if (chatId) {
      // Find the chat and its project
      for (const project of sampleProjects) {
        const chat = project.chats.find((c) => c.id === chatId)
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
  }, []);
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
          steps={steps}
          setSteps={setSteps}
        />
      </div>

      {/* Code Editor - Always visible */}
      <div className="w-1/2 h-full">
      <iframe src={`${SERVER_URL}/`} width={"100%"} height={"100%"} title="Project Worker" className="rounded-lg" />
      </div>
    </div>
  )
}