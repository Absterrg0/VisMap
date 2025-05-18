"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ChatArea } from "@/components/chat-area"
import { CodeEditor, FileNode } from "@/components/code-editor"
import type { Project, Chat } from "@/types/types"
import { Step, StepType } from "@/types/stepType"
import { parseXml } from "@/lib/steps"
import { Message } from "@/types/types"
import { usePromptStore } from "@/zustand/store"
import { generateRoadmap } from "@/app/actions/llms/roadmap"
import axios from "axios"
import { useWebContainer } from "@/hooks/useWebcontainer"
import { PreviewFrame } from "./preview-frame"

const SERVER_URL = "http://localhost:8080"

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Modern E-commerce Website",
    chats: [
      {
        id: "1-1",
        name: "Initial Planning",
        lastUpdated: new Date(),
      },
      {
        id: "1-2",
        name: "Frontend Development",
        lastUpdated: new Date(),
      }
    ]
  },
  {
    id: "2",
    name: "Customer Churn Analysis",
    chats: [
      {
        id: "chat-1",
        name: "Data Exploration",
        lastUpdated: new Date(),
      },
      {
        id: "chat-2",
        name: "Model Development",
        lastUpdated: new Date(),
      }
    ]
  },
  {
    id: "3",
    name: "Fitness Tracking App",
    chats: [
      {
        id: "chat-1",
        name: "App Architecture",
        lastUpdated: new Date(),
      },
      {
        id: "chat-2",
        name: "UI/UX Design",
        lastUpdated: new Date(),
      }
    ]
  }
];

export function ChatInterface() {
  const params = useParams()
  const chatId = params.chatId as string
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const webContainer = useWebContainer();
  const [isPreview,setIsPreview]=useState(false);
  const [steps, setSteps] = useState<Step[]>([])
  const initialPrompt = usePromptStore((state) => state.prompt)
  const [llmPrompt, setLlmPrompt] = useState<Message[]>([
    { role: 'assistant', content: initialPrompt }
  ])
  const [messages, setMessages] = useState<Message[]>([
    { role: 'user', content: initialPrompt }
  ]);
  const [files, setFiles] = useState<FileNode[]>([])
  const [template, setTemplate] = useState<string>("static")


  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(step=> step.status === 'pending').map(step =>{
      updateHappened = true;
      if(step.type === StepType.CreateFile){
        let parsedPath = step.path?.split('/') || [];
        let currentFiles = [...originalFiles];
        let finalAnswerRef = currentFiles;

        let currentFolder = "";

    
        while(parsedPath.length){
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName =  parsedPath[0];
          parsedPath.shift();

          if(!parsedPath.length){
            let file = currentFiles.find(x=> x.path === currentFolder);
            if(!file){
              currentFiles.push({
                name: currentFolderName,
                type: "file",
                path: currentFolder,
                content: step.code || ""
              })
            }
            else{
              file.content = step.code || "";
            }
          }
          else{
            let folder = currentFiles.find(x=> x.path === currentFolder);
            if(!folder){
              currentFiles.push({
                name: currentFolderName,
                type: "directory",
                path: currentFolder,
                children: []
              })
            }
            currentFiles = currentFiles.find(x=> x.path ===currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    })

    if(updateHappened){
      console.log("originalFiles", originalFiles)
      setFiles(originalFiles);
      
    }
  },[steps,files])




  useEffect(()=>{
    const createMountStructure = (files:FileNode[]):Record<string,any> =>{ 
      const mountStructure:Record<string,any> = {};
      const processFile = (file:FileNode, isRootFolder:boolean)=>{
        if(file.type === "directory"){
          mountStructure[file.name]={
            directory:file.children ? Object.fromEntries(file.children.map(child=> [child.name,processFile(child,false)])) : {}
          }}
        else if(file.type === "file"){
          if(isRootFolder){
            mountStructure[file.name] = {
              file:{
                content:file.content || ""
              }
            }
          }
          else{
            return{
              file:{
                content:file.content || ""
              }
            }
          }
        }
        return mountStructure[file.name];
      }
      files.forEach(file=>processFile(file,true));
      return mountStructure;
    }

    const mountStructure = createMountStructure(files);
    console.log(mountStructure);

    webContainer?.mount(mountStructure);

  },[files,webContainer])

  
  

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
      for (const project of projects) {
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

      <div className="w-1/2 h-full">
          {isPreview ? (
            <div>
              <PreviewFrame webContainer={webContainer!} files={files} />
            </div>
          ) : (
            <div>
              <CodeEditor steps={steps} files={files} />
            </div>
          )}
      </div>
        
    </div>
  )
}