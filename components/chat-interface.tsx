"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ChatArea } from "@/components/chat-area"
import { CodeEditor } from "@/components/code-editor"
import type { Project, Chat } from "@/types/types"
import { Step, StepType } from "@/types/stepType"
import { parseXml } from "@/lib/steps"
import { mermaidPrompt } from "@/templates/mermaid"
import { FileText, Folder, TerminalSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data - In a real app, this would come from an API or state management
const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Personal Assistant",
    chats: [
      { id: "1-1", name: "Travel Planning", lastUpdated: new Date() },
      { id: "1-2", name: "Meal Prep Ideas", lastUpdated: new Date() },
      { id: "1-3", name: "Workout Routine", lastUpdated: new Date() },
    ],
  },
  // ... other projects
]



export function ChatInterface() {
  const params = useParams()
  const chatId = params.chatId as string


  const prompt = `I'll create a roadmap visualization for a simple todo list application using Mermaid.js, focusing on clear and maintainable code with a visually appealing design.
  
  \`\`\`xml
  <visArtifact id="todo-app-roadmap" title="Todo Application Roadmap">
    <visAction type="file" filePath="package.json">
      {
        "name": "todo-app-roadmap",
        "private": true,
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint"
        },
        "dependencies": {
          "next": "latest",
          "react": "^18.3.1",
          "react-dom": "^18.3.1",
          "mermaid": "^10.9.0",
          "lucide-react": "^0.344.0"
        },
        "devDependencies": {
          "@types/react": "^18.3.5",
          "@types/node": "^20.4.2",
          "typescript": "^5.5.3",
          "@eslint/js": "^9.9.1",
          "typescript-eslint": "^8.3.0",
          "eslint": "^9.9.1",
          "globals": "^15.9.0",
          "tailwindcss": "^3.4.1",
          "postcss": "^8.4.35",
          "autoprefixer": "^10.4.17"
        }
      }
    </visAction>
    <visAction type="file" filePath="postcss.config.js">
      module.exports = {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      }
    </visAction>
    <visAction type="file" filePath="tailwind.config.ts">
      import type { Config } from 'tailwindcss'
  
      const config: Config = {
        content: [
          './pages/**/*.{js,ts,jsx,tsx,mdx}',
          './components/**/*.{js,ts,jsx,tsx,mdx}',
          './app/**/*.{js,ts,jsx,tsx,mdx}',
        ],
        theme: {
          extend: {
            backgroundImage: {
              'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
              'gradient-conic':
                'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
          },
        },
        plugins: [],
      }
      export default config
    </visAction>
    <visAction type="file" filePath="components/TodoRoadmap.tsx">
      "use client";
      import { useEffect } from 'react';
      import mermaid from 'mermaid';
  
      export default function TodoRoadmap() {
        useEffect(() => {
          mermaid.initialize({ startOnLoad: true });
          mermaid.contentLoaded();
        }, []);
  
        return (
          <div className="mermaid">
            {\`graph TD
              A[Plan the App] --> B[Design UI]
              B --> C[Implement Core Features]
              C --> D[Add Data Persistence]
              D --> E[Implement User Authentication]
              E --> F[Test the App]
              F --> G[Deploy the App]
  
              subgraph Planning
                A1[Define Requirements] --> A2[Choose Tech Stack]
                A2 --> A3[Set Up Project]
              end
  
              subgraph UI Design
                B1[Wireframes] --> B2[Mockups]
                B2 --> B3[Prototype]
              end
  
              subgraph Core Features
                C1[Add Tasks] --> C2[View Tasks]
                C2 --> C3[Edit Tasks]
                C3 --> C4[Delete Tasks]
              end
  
              subgraph Data Persistence
                D1[Local Storage] --> D2[Backend API]
              end
  
              subgraph User Authentication
                E1[Sign-up] --> E2[Login]
                E2 --> E3[Logout]
              end
  
              A --> A1
              B --> B1
              C --> C1
              D --> D1
              E --> E1
            \`}
          </div>
        );
      }
    </visAction>
    <visAction type="file" filePath="app/page.tsx">
      import TodoRoadmap from '../components/TodoRoadmap';
      import { CheckCircle2, ListChecks } from 'lucide-react';
  
      export default function HomePage() {
        return (
          <main className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
              <div className="bg-white shadow-md rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <ListChecks className="text-blue-500 mr-2 w-6 h-6" />
                  <h1 className="text-2xl font-bold text-gray-800">
                    Todo Application Development Roadmap
                  </h1>
                </div>
                <p className="text-gray-600 mb-8">
                  This roadmap outlines the key steps in developing a simple todo
                  application, from planning to deployment.
                </p>
                <TodoRoadmap />
                <div className="mt-8 flex justify-center">
                  <a
                    href="https://unsplash.com/photos/a-pile-of-books-lying-on-a-table-PTAmVvVbCAY"
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CheckCircle2 className="mr-2 w-4 h-4" />
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </main>
        );
      }
    </visAction>
    <visAction type="shell">
      npm install
      npm run dev
    </visAction>
  </visArtifact>
  \`\`\``

  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [selectedStep, setSelectedStep] = useState<Step | null>(null)
  const [steps, setSteps] = useState<Step[]>(parseXml(prompt))

  console.log(steps)
  // Update active chat and project when URL changes
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

  const getStepIcon = (type: StepType) => {
    switch (type) {
      case StepType.CreateFile:
        return <FileText className="h-4 w-4" />
      case StepType.CreateFolder:
        return <Folder className="h-4 w-4" />
      case StepType.RunScript:
        return <TerminalSquare className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const toggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor)
  }

  // If no chat is selected, show a welcome message
  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
          <p className="text-muted-foreground">Select a chat from the sidebar to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 h-full">
      {/* Main Chat Area with Steps */}
      <div className="flex-1 flex flex-col border-r border-border/40">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="border-b border-border/40 px-4">
            <TabsList className="bg-transparent h-10">
              <TabsTrigger value="chat" className="data-[state=active]:bg-background/60">
                Chat
              </TabsTrigger>
              <TabsTrigger value="steps" className="data-[state=active]:bg-background/60">
                Steps
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 p-0 m-0">
            <ChatArea
              activeChat={activeChat}
              activeProject={activeProject}
              onToggleCodeEditor={toggleCodeEditor}
              showCodeEditor={showCodeEditor}
            />
          </TabsContent>

          <TabsContent value="steps" className="flex-1 p-0 m-0">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border/40">
                <h2 className="text-lg font-medium">Project Steps</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Steps generated from your chat conversation
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setSelectedStep(step)}
                      className={cn(
                        "w-full p-3 text-left rounded-lg flex items-center gap-3 hover:bg-accent/50 transition-colors",
                        selectedStep?.id === step.id && "bg-accent"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getStepIcon(step.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{step.title}</div>
                        {step.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          step.status === 'completed' && "bg-green-500/10 text-green-500",
                          step.status === 'in-progress' && "bg-blue-500/10 text-blue-500",
                          step.status === 'pending' && "bg-gray-500/10 text-gray-500"
                        )}>
                          {step.status}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Code Editor */}
      {showCodeEditor && <CodeEditor />}
    </div>
  )
}
