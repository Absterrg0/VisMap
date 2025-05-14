"use client"

import { useState, useEffect } from "react"
import { Check, Copy, Download, Play, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileExplorer } from "@/components/file-explorer"
import { cn } from "@/lib/utils"
import Editor from "@monaco-editor/react"
import { Step, StepType } from "@/types/stepType"

interface CodeEditorProps {
  steps: Step[]
  onUpdate: (steps: Step[]) => void
}

export interface FileNode {
  name: string
  type: "file" | "directory"
  content?: string
  children?: FileNode[]
  path?: string
}

export function CodeEditor({ steps, onUpdate }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileNode >()
  const [activeTab, setActiveTab] = useState("editor")
  const [editorContent, setEditorContent] = useState("")
  const [files, setFiles] = useState<FileNode[]>([])


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
      onUpdate(steps.map((s:Step)=>{
        return{
          ...s,
          status: "completed"
        }
      }))
    }
  },[steps])




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

  },[files])

  const copyToClipboard = () => {
    if (selectedFile && selectedFile.type === "file") {
      navigator.clipboard.writeText(editorContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      setSelectedFile(file)
      setEditorContent(file.content || "")
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
    <div className="w-full h-full flex flex-col border-l border-border/40 bg-background/95">
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
          <FileExplorer files={files} onSelectFile={handleFileSelect} selectedFile={selectedFile} />
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
                <div className="space-y-2">
                  <div className="animate-pulse">$</div>
                  <div>
                      <span className="text-blue-400">user@machine</span>:<span className="text-purple-400">~/project</span>
                      $ npm run dev
                    </div>
                    <div className="text-gray-400">&gt; Ready to run the project</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Status Bar */}
          <div className="h-6 border-t border-border/40 bg-background/50 px-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {selectedFile && selectedFile.type === "file" && (
                <>
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
