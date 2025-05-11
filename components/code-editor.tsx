"use client"

import { useState } from "react"
import { Check, Copy, Download, Play, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileExplorer } from "@/components/file-explorer"
import { cn } from "@/lib/utils"
import Editor from "@monaco-editor/react"

// Sample file structure for demonstration
const sampleFiles = [
  {
    id: "1",
    name: "src",
    type: "directory",
    children: [
      {
        id: "2",
        name: "components",
        type: "directory",
        children: [
          {
            id: "3",
            name: "Button.tsx",
            type: "file",
            language: "tsx",
            content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick 
}: ButtonProps) {
  return (
    <button 
      className={\`btn btn-\${variant} btn-\${size}\`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}`,
          },
          {
            id: "4",
            name: "Card.tsx",
            type: "file",
            language: "tsx",
            content: `import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}`,
          },
        ],
      },
      {
        id: "5",
        name: "pages",
        type: "directory",
        children: [
          {
            id: "6",
            name: "index.tsx",
            type: "file",
            language: "tsx",
            content: `import React from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to My App</h1>
      <Card title="Getting Started">
        <p className="mb-4">This is a sample application.</p>
        <Button>Learn More</Button>
      </Card>
    </div>
  );
}`,
          },
        ],
      },
      {
        id: "7",
        name: "styles",
        type: "directory",
        children: [
          {
            id: "8",
            name: "globals.css",
            type: "file",
            language: "css",
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
  
  .btn-outline {
    @apply border border-gray-300 hover:bg-gray-100;
  }
  
  .btn-sm {
    @apply text-sm px-3 py-1;
  }
  
  .btn-md {
    @apply text-base px-4 py-2;
  }
  
  .btn-lg {
    @apply text-lg px-5 py-3;
  }
}`,
          },
        ],
      },
    ],
  },
  {
    id: "9",
    name: "package.json",
    type: "file",
    language: "json",
    content: `{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "13.4.19",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "20.5.7",
    "@types/react": "18.2.21",
    "@types/react-dom": "18.2.7",
    "autoprefixer": "10.4.15",
    "postcss": "8.4.29",
    "tailwindcss": "3.3.3",
    "typescript": "5.2.2"
  }
}`,
  },
  {
    id: "10",
    name: "README.md",
    type: "file",
    language: "markdown",
    content: `# My App

This is a sample Next.js application with TypeScript and Tailwind CSS.

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
`,
  },
]

export function CodeEditor() {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState(sampleFiles[0].children?.[1].children?.[0])
  const [activeTab, setActiveTab] = useState("editor")
  const [editorContent, setEditorContent] = useState("")

  const copyToClipboard = () => {
    if (selectedFile && selectedFile.type === "file") {
      navigator.clipboard.writeText(editorContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFileSelect = (file: any) => {
    if (file.type === "file") {
      setSelectedFile(file)
      setEditorContent(file.content)
      setActiveTab("editor")
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value)
      if (selectedFile) {
        selectedFile.content = value
      }
    }
  }

  return (
    <div className="w-1/2 h-full flex flex-col border-l border-border/40 bg-background/95">
      <div className="border-b border-border/40 p-4 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <h2 className="text-lg font-medium">Project Files</h2>
        <div className="flex items-center gap-2">
          {selectedFile && selectedFile.type === "file" && (
            <>
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 border-r border-border/40 overflow-y-auto bg-background/30">
          <FileExplorer files={sampleFiles} onSelectFile={handleFileSelect} selectedFile={selectedFile} />
        </div>

        {/* Code Editor / Terminal */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border/40 px-4">
              <TabsList className="bg-transparent h-10">
                <TabsTrigger value="editor" className="data-[state=active]:bg-background/60 gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      selectedFile && selectedFile.type === "file" ? "bg-green-500" : "bg-muted-foreground/30",
                    )}
                  />
                  {selectedFile && selectedFile.type === "file" ? selectedFile.name : "Editor"}
                </TabsTrigger>
                <TabsTrigger value="terminal" className="data-[state=active]:bg-background/60 gap-2">
                  <Terminal className="h-4 w-4" />
                  Terminal
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 p-0 m-0">
              {selectedFile && selectedFile.type === "file" ? (
                <Editor
                  height="100%"
                  defaultLanguage={selectedFile.language}
                  value={editorContent}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select a file to view its contents
                </div>
              )}
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 p-0 m-0">
              <div className="h-full bg-black/90 p-4 font-mono text-sm text-green-400 overflow-auto">
                <div className="animate-pulse">$</div>
                <div className="mt-2">
                  <span className="text-blue-400">user@machine</span>:<span className="text-purple-400">~/project</span>
                  $ npm run dev
                </div>
                <div className="mt-1">
                  <span className="text-gray-400">&gt; my-app@0.1.0 dev</span>
                </div>
                <div className="mt-1">
                  <span className="text-gray-400">&gt; next dev</span>
                </div>
                <div className="mt-2">- ready started server on 0.0.0.0:3000, url: http://localhost:3000</div>
                <div className="mt-1">- event compiled client and server successfully in 188 ms (17 modules)</div>
                <div className="mt-1">- wait compiling...</div>
                <div className="mt-1">- event compiled client and server successfully in 157 ms (19 modules)</div>
                <div className="mt-4 animate-pulse">$</div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Status Bar */}
          <div className="h-6 border-t border-border/40 bg-background/50 px-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {selectedFile && selectedFile.type === "file" && (
                <>
                  <span>{selectedFile.language.toUpperCase()}</span>
                  <span>UTF-8</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-5 px-2 text-xs gap-1">
                <Play className="h-3 w-3" />
                Run
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
