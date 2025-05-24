"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ChatArea } from "@/components/chat-area"
import { CodeEditor, FileNode } from "@/components/code-editor"
import type { Project, ChatHistory, MountStructure } from "@/types/types"
import { Step, StepType } from "@/types/stepType"
import { parseXml } from "@/lib/steps"
import { Message } from "@/types/types"
import { usePromptStore } from "@/zustand/store"
import { generateRoadmap } from "@/app/actions/llms/roadmap"
import axios from "axios"
import { useWebContainer } from "@/hooks/useWebcontainer"
import { PreviewFrame } from "./preview-frame"
import Loader from "./ui/loader"

export function ChatInterface() {
  const params = useParams()
  const chatId = params.chatId as string
  const projectId = params.projectId as string

  const [isPreview,setIsPreview]=useState(false);
  const [steps, setSteps] = useState<Step[]>([])
  const [llmPrompt, setLlmPrompt] = useState<Message[]>([])
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<FileNode[]>([])
  const [template, setTemplate] = useState<string>("static")



  useEffect(()=>{
    const fetchChatHistory = async () => {
      const response = await axios.get<{messages:Message[]}>(`/api/chatHistory/${projectId}/${chatId}`)
      setMessages(response.data.messages)
    }
    fetchChatHistory()
  },[chatId])


  useEffect(() => {
    const pendingSteps = steps.filter(step => step.status === 'pending');
    if (pendingSteps.length === 0) return;

    let originalFiles = [...files];
    let updateHappened = false;
    
    pendingSteps.forEach(step => {
      if(step.type === StepType.CreateFile && step.path){
        updateHappened = true;
        
        // Clean and normalize the path
        const cleanPath = step.path.startsWith('/') ? step.path : `/${step.path}`;
        const pathParts = cleanPath.split('/').filter(part => part.length > 0);
        
        let currentFiles = originalFiles;
        let currentPath = '';
        
        // Navigate/create directory structure
        for(let i = 0; i < pathParts.length - 1; i++){
          const folderName = pathParts[i];
          currentPath += `/${folderName}`;
          
          let folder = currentFiles.find(f => f.path === currentPath && f.type === "folder");
          if(!folder){
            folder = {
              name: folderName,
              type: "folder",
              path: currentPath,
              children: []
            };
            currentFiles.push(folder);
          }
          currentFiles = folder.children!;
        }
        
        // Create or update the file
        const fileName = pathParts[pathParts.length - 1];
        const filePath = cleanPath;
        
        let existingFile = currentFiles.find(f => f.path === filePath && f.type === "file");
        if(!existingFile){
          currentFiles.push({
            name: fileName,
            type: "file",
            path: filePath,
            content: step.code || ""
          });
        } else {
          existingFile.content = step.code || "";
        }
      }
    });

    if(updateHappened){
      console.log("Updated files:", originalFiles);
      setFiles(originalFiles);
    }
  }, [steps])





  

//  const handleInitialMessage = async (message: Message) => {

//   const response = await axios.get<{roadmapPrompt:string,intiialFiles:string}>(`/api/road-map/template?template=${template}`);

//   const roadmapPrompt = response.data.roadmapPrompt;
//   const intiialFiles = response.data.intiialFiles;

//   const initialSteps = await parseXml(intiialFiles);
//   setSteps(initialSteps)
//   setLlmPrompt(x=>[...x, {role:'assistant', content: roadmapPrompt}])

//   const roadmap = await generateRoadmap("123", [...llmPrompt, message], "gemini", "gemini-2.0-flash", "interactive")       

//   if(typeof roadmap !== 'string'){
//     throw new Error(roadmap.error);
//   }

//   const parsedResult = parseXml(roadmap).map((step:Step)=>({
//     ...step,
//     status:'pending' as 'pending'
//   }))
//   setSteps(parsedResult)
//   setMessages(x=>[...x, {role:'assistant', content: parsedResult[0].description}])
//   setLlmPrompt(x=>[...x, {role:'assistant', content: roadmap}])
//   setLlmPrompt(x=>[...x, {role:'user', content: message.content}])
//  }


  const handleSendMessage = async (message: Message) => {
    // Add the user message to the messages array
    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)

    try {
      // Call the API to get response from LLM
     const roadmap = await generateRoadmap("123", [...llmPrompt, { role: 'USER', content: message.content }], "gemini", "gemini-2.0-flash", "interactive")       

      if (typeof roadmap !== 'string') {
        throw new Error(roadmap.error);
      }

      // Parse the XML response
      const parsedResult = parseXml(roadmap).map((step:Step)=>({
        ...step,
        status:'pending' as 'pending'
      }))
      console.log("parsedResult", parsedResult)

      setSteps(parsedResult)
      setLlmPrompt(x=>[...x, {role:'USER', content: message.content}])

      setLlmPrompt(x=>[...x, {role:'ASSISTANT', content: roadmap}])

      setMessages(x=>[...x, {role:'ASSISTANT', content: parsedResult[0].description}])
    } catch (error) {
      console.error("Error processing response:", error)

      setMessages(x=>[...x, {
          role:'ASSISTANT',
          content: "Sorry, there was an error processing your request.",
        },
      ])
    }
  }

  return (
    <div className="flex flex-1 h-full bg-background text-foreground">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col border-r border-border/40 bg-background">
        <ChatArea
          chatId={chatId}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      <div className="w-1/2 h-full flex">

      {files.length > 0 ? (<CodeEditor steps={steps} files={files} />):(<div className="flex-1 flex items-center justify-center">
        <Loader/>
      </div>)}
      </div>
        
    </div>
  )
}