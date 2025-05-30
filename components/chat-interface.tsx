"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { ChatArea } from "@/components/chat-area"
import { CodeEditor, FileNode } from "@/components/code-editor"
import { Step } from "@/types/stepType"
import { Message } from "@/types/types"
import { usePromptStore } from "@/zustand/store"
import { generateRoadmap } from "@/app/actions/llms/roadmap"
import axios from "axios"
import Loader from "./ui/loader"

export function ChatInterface() {
  const params = useParams()
  const chatId = params.chatId as string
  const projectId = params.projectId as string
  const prompt = usePromptStore((state) => state.prompt)
  const setPrompt = usePromptStore((state) => state.setPrompt)
  const [steps, setSteps] = useState<Step[]>([])
  const [llmPrompt, setLlmPrompt] = useState<Message[]>([])
  const [messages, setMessages] = useState<Message[]>(prompt ? [{ role: 'USER', content: prompt }] : []);
  const [files, setFiles] = useState<FileNode[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "steps">("chat")
  const processedStepIds = useRef<Set<number>>(new Set())
  useEffect(() => {
    const init = async () => {
      try {
        const response = await axios.get<{messages: Message[]}>(`/api/chatHistory/${projectId}/${chatId}`)
  

        if(prompt) {
          await axios.post<{messages: Message[]}>(`/api/chatHistory/${projectId}`, { prompt })
          setPrompt("") 
        }
        setMessages([{ role: 'USER', content: prompt }, ...response.data.messages])
            await handleSendMessage({ role: 'USER', content: prompt });
      } catch (error) {
        console.error("Error fetching chat history:", error)
      }
    }
    init()

  }, [chatId, projectId])
  // Handle streaming start - switch to steps tab
  const handleStreamingStart = () => {
    console.log('Streaming started, switching to steps tab')
    setActiveTab("steps")
  }

  // Handle step completion
  const handleStepComplete = (stepId: string) => {
    console.log('Step completed:', stepId)
    
    const stepIdNum = parseInt(stepId);
    if (isNaN(stepIdNum)) {
      console.error('Invalid step ID:', stepId);
      return;
    }
  
    setSteps(prevSteps => {
      const currentStep = prevSteps.find(step => step.id === stepIdNum);
      if (!currentStep) {
        console.log('Step not found:', stepIdNum);
        return prevSteps; 
      }

      // Mark the current step as completed
      const updatedSteps = prevSteps.map(step => {
        if (step.id === stepIdNum) {
          return { ...step, status: 'completed' as const }
        }
        return step
      })

      // Find the next pending step and mark it as in-progress
      const nextPendingStep = updatedSteps.find(step => 
        step.status === 'pending' && 
        step.id > stepIdNum &&
        step.path // Only process steps with file paths for streaming
      )

      if (nextPendingStep) {
        console.log('Starting next step:', nextPendingStep.id, nextPendingStep.path);
        return updatedSteps.map(step => {
          if (step.id === nextPendingStep.id) {
            return { ...step, status: 'in-progress' as const }
          }
          return step
        })
      } else {
        console.log('No more pending steps with files to process');
        return updatedSteps;
      }
    })
  }

  // Process files when steps change
  useEffect(() => {
    const processSteps = () => {
      // Safety check: prevent processing if we have too many steps (potential infinite loop)
      if (steps.length > 100) {
        console.error('Too many steps detected, potential infinite loop prevented')
        return;
      }

      // Process ALL steps that have file content - including pending ones with content
      // This ensures files are available even before they become in-progress
      const stepsToProcess = steps.filter(step => 
        step.code && 
        step.path && 
        (step.status === 'completed' || step.status === 'in-progress' || step.status === 'pending')
      );

      if (stepsToProcess.length === 0) {
        return; // No steps to process
      }

      console.log('Processing steps with file content:', stepsToProcess.map(s => ({ id: s.id, path: s.path, status: s.status })));

      setFiles(prevFiles => {
        try {
          // Create a map of existing files for efficient lookup
          const existingFilesMap = new Map<string, FileNode>();
          
          const buildFileMap = (files: FileNode[], parentPath = '') => {
            files.forEach(file => {
              const fullPath = parentPath ? `${parentPath}/${file.name}` : file.name;
              if (file.type === 'file') {
                existingFilesMap.set(file.path || fullPath, file);
              }
              if (file.type === 'folder' && file.children) {
                buildFileMap(file.children, fullPath);
              }
            });
          };
          
          buildFileMap(prevFiles);

          // Start with existing files structure
          const updatedFiles: FileNode[] = JSON.parse(JSON.stringify(prevFiles));
          const processedPaths = new Set<string>();

          stepsToProcess.forEach(step => {
            if (step.path && step.code && !processedPaths.has(step.path)) {
              processedPaths.add(step.path);
              
              // Mark this step as processed only after successful file creation
              processedStepIds.current.add(step.id);
              
              // Clean and normalize the path
              const cleanPath = step.path.startsWith('/') ? step.path : `/${step.path}`;
              const pathParts = cleanPath.split('/').filter(part => part.length > 0);
              
              let currentFiles = updatedFiles;
              let currentPath = '';
              
              // Navigate/create directory structure
              for (let i = 0; i < pathParts.length - 1; i++) {
                const folderName = pathParts[i];
                currentPath += `/${folderName}`;
                
                let folder = currentFiles.find(f => f.path === currentPath && f.type === "folder");
                if (!folder) {
                  folder = {
                    name: folderName,
                    type: "folder",
                    path: currentPath,
                    children: []
                  };
                  currentFiles.push(folder);
                }
                if (folder.children) {
                  currentFiles = folder.children;
                }
              }
              
              // Create or update the file
              const fileName = pathParts[pathParts.length - 1];
              const filePath = cleanPath;
              
              // Remove existing file if it exists to ensure latest content
              const existingIndex = currentFiles.findIndex(f => f.path === filePath);
              if (existingIndex !== -1) {
                currentFiles.splice(existingIndex, 1);
              }
              
              // Add the file with content from the step
              currentFiles.push({
                name: fileName,
                type: "file",
                path: filePath,
                content: step.code || ""
              });
            }
          });

          console.log('Files updated from steps:', updatedFiles.length, 'files created');
          return updatedFiles;
        } catch (error) {
          console.error('Error processing steps:', error);
          return prevFiles; // Return previous state on error
        }
      });
    };

    processSteps();
  }, [steps])


  // Process streaming response
  const processStreamingResponse = async (stream: ReadableStream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let accumulatedSteps: Step[] = [];

    try {
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            switch (data.type) {
              case 'raw_chunk':
                // Handle raw chunks for real-time display if needed
                console.log('Raw chunk:', data.content);
                break;
                
              case 'new_steps':
                // Add new steps as they become available
                if (data.steps && data.steps.length > 0) {
                  console.log('New steps received:', data.steps);
                  
                  // If this is the first batch of new steps, clear processed IDs
                  if (accumulatedSteps.length === 0) {
                    processedStepIds.current.clear()
                  }
                  
                  accumulatedSteps = [...accumulatedSteps, ...data.steps];
                  setSteps([...accumulatedSteps]);
                  
                  // Update messages with the latest step description
                  const latestStep = data.steps[data.steps.length - 1];
                  if (latestStep.description) {
                    setMessages(prev => {
                      const newMessages = [...prev];
                      // Update or add assistant message
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.role === 'ASSISTANT') {
                        lastMessage.content = latestStep.description;
                      } else {
                        newMessages.push({ role: 'ASSISTANT', content: latestStep.description });
                      }
                      return newMessages;
                    });
                  }
                }
                break;
                
              case 'updated_steps':
 
                if (data.steps && data.steps.length > 0) {
                  console.log('Updated steps received:', data.steps);
                  
                  // Update the accumulated steps
                  data.steps.forEach((updatedStep: Step) => {
                    const index = accumulatedSteps.findIndex(s => s.id === updatedStep.id);
                    if (index !== -1) {
                      accumulatedSteps[index] = updatedStep;
                    }
                  });
                  
                  setSteps([...accumulatedSteps]);
                }
                break;
                
              case 'final_result':
                // Final validation and cleanup
                console.log('Final result received, processing all accumulated steps');
                
                // Immediately update files from accumulated steps
                if (accumulatedSteps.length > 0) {
                  console.log('Processing accumulated steps into files:', accumulatedSteps.length);
                  
                  // Process all file steps immediately
                  const fileSteps = accumulatedSteps.filter(step => 
                    step.code && 
                    step.path && 
                    (step.status === 'completed' || step.status === 'in-progress' || step.status === 'pending')
                  );
                  
                  console.log('File steps found:', fileSteps.length);
                  
                  if (fileSteps.length > 0) {
                    // Force update files state with all accumulated file content
                    setFiles(prevFiles => {
                      const updatedFiles: FileNode[] = [];
                      const processedPaths = new Set<string>();
                      
                      fileSteps.forEach(step => {
                        if (step.path && step.code && !processedPaths.has(step.path)) {
                          processedPaths.add(step.path);
                          
                          // Clean and normalize the path
                          const cleanPath = step.path.startsWith('/') ? step.path : `/${step.path}`;
                          const pathParts = cleanPath.split('/').filter(part => part.length > 0);
                          
                          // Create folder structure if needed
                          let currentFiles = updatedFiles;
                          let currentPath = '';
                          
                          // Navigate/create directory structure
                          for (let i = 0; i < pathParts.length - 1; i++) {
                            const folderName = pathParts[i];
                            currentPath += `/${folderName}`;
                            
                            let folder = currentFiles.find(f => f.path === currentPath && f.type === "folder");
                            if (!folder) {
                              folder = {
                                name: folderName,
                                type: "folder",
                                path: currentPath,
                                children: []
                              };
                              currentFiles.push(folder);
                            }
                            if (folder.children) {
                              currentFiles = folder.children;
                            }
                          }
                          
                          // Create or update the file
                          const fileName = pathParts[pathParts.length - 1];
                          const filePath = cleanPath;
                          
                          // Remove existing file if it exists
                          const existingIndex = currentFiles.findIndex(f => f.path === filePath);
                          if (existingIndex !== -1) {
                            currentFiles.splice(existingIndex, 1);
                          }
                          
                          // Add the file with latest content
                          currentFiles.push({
                            name: fileName,
                            type: "file",
                            path: filePath,
                            content: step.code || ""
                          });
                        }
                      });
                      
                      console.log('Updated files with LLM content:', updatedFiles);
                      return updatedFiles;
                    });
                  }
                }
                break;
                
              case 'error':
                console.error('Stream error:', data.message);
                setMessages(prev => [...prev, {
                  role: 'ASSISTANT',
                  content: `Error: ${data.message}`,
                }]);
                break;
                
              case 'stream_complete':
                console.log('Stream completed');
                break;
            }
          } catch (parseError) {
            console.error('Error parsing stream data:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        content: "Sorry, there was an error processing the stream.",
      }]);
    } finally {
    }
  };


  const handleSendMessage = async (message: Message) => {
    // Add the user message to the messages array
    setMessages(prev => [...prev, message]);

    try {
      const stream = await generateRoadmap("123", [...llmPrompt, { role: 'USER', content: message.content }], "gemini", "gemini-2.0-flash", "interactive");
      
      await processStreamingResponse(stream);
      
      setLlmPrompt(x => [...x, { role: 'USER', content: message.content }]);
    } catch (error) {
      console.error("Error processing response:", error);
      setMessages(x => [...x, {
        role: 'ASSISTANT',
        content: "Sorry, there was an error processing your request.",
      }]);
    }
  }

  return (
    <div className="flex flex-1 h-full bg-background text-foreground">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col border-r border-border/40 bg-background">
        <ChatArea
          steps={steps}
          messages={messages}
          onSendMessage={handleSendMessage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="w-1/2 h-full flex">
        {files.length > 0 ? (
          <CodeEditor 
            steps={steps} 
            files={files} 
            onStepComplete={handleStepComplete}
            onStreamingStart={handleStreamingStart}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Loader />
          </div>
        )}
      </div>
    </div>
  )
}