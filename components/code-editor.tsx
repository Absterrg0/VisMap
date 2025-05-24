"use client"

import { useState, useEffect } from "react"
import { Check, Copy, Download, Play, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createMountStructure, FileExplorer } from "@/components/file-explorer"
import { PreviewFrame } from "@/components/preview-frame"
import { cn } from "@/lib/utils"
import Editor from "@monaco-editor/react"
import type { FileItem, Step } from "@/types/stepType"
import { useWebContainer } from "@/hooks/useWebcontainer"

interface CodeEditorProps {
  steps: Step[]
  files: FileNode[]
}

export interface FileNode {
  name: string
  type: "file" | "folder"
  content?: string
  children?: FileNode[]
  path?: string
}

export function CodeEditor({ files }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileNode>()
  const [activeTab, setActiveTab] = useState("editor")
  const [editorContent, setEditorContent] = useState("")  
  const webContainer = useWebContainer()  


  useEffect(() => {
    const createMountStructure = (files: FileNode[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileNode, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log("Mounting structure", mountStructure);
    webContainer?.mount(mountStructure);
  }, [files, webContainer]);

  
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

  const getFileLanguage = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "js":
      case "jsx":
        return "javascript"
      case "ts":
      case "tsx":
        return "typescript"
      case "css":
        return "css"
      case "html":
        return "html"
      case "json":
        return "json"
      case "md":
        return "markdown"
      case "py":
        return "python"
      default:
        return "plaintext"
    }
  }

  return (
    <div className="w-full h-full flex flex-col border-l border-border/40 bg-background">
      <div className="border-b border-border/40 p-4 flex items-center justify-between bg-background/95 backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-semibold">Code Editor</h2>
          <p className="text-sm text-muted-foreground">Edit and preview your project files</p>
        </div>
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
        <div className="w-64 border-r border-border/40 overflow-y-auto bg-muted/20">
          <div className="p-3 border-b border-border/40 bg-background/50">
            <h3 className="text-sm font-medium text-muted-foreground">PROJECT FILES</h3>
          </div>
          <FileExplorer files={files} onSelectFile={handleFileSelect} selectedFile={selectedFile} />
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border/40 px-4 bg-background/50">
              <TabsList className="bg-transparent h-12 gap-1">
                <TabsTrigger
                  value="editor"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4"
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      selectedFile && selectedFile.type === "file" ? "bg-green-500" : "bg-muted-foreground/30",
                    )}
                  />
                  {selectedFile && selectedFile.type === "file" ? selectedFile.name : "Editor"}
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 p-0 m-0 data-[state=inactive]:hidden">
              {selectedFile && selectedFile.type === "file" ? (
                <div className="h-full relative">
                  <Editor
                    height="100%"
                    width="100%"
                    value={editorContent}
                    onChange={handleEditorChange}
                    language={getFileLanguage(selectedFile.name)}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                      wordWrap: "on",
                      tabSize: 2,
                      insertSpaces: true,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      glyphMargin: false,
                    }}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                      <Copy className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">No file selected</h3>
                      <p className="text-sm">Choose a file from the explorer to start editing</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="flex-1 p-0 m-0 data-[state=inactive]:hidden">
              <div className="h-full w-full bg-background">
              <PreviewFrame files={files} webContainer={webContainer!} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Status Bar */}
          <div className="h-8 border-t border-border/40 bg-background/95 px-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {selectedFile && selectedFile.type === "file" && (
                <>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    {getFileLanguage(selectedFile.name).toUpperCase()}
                  </span>
                  <span>UTF-8</span>
                  <span>LF</span>
                </>
              )}
              {activeTab === "preview" && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  Live Preview
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "preview" ? "default" : "ghost"}
                size="sm"
                className="h-6 px-3 text-xs gap-1 disabled:opacity-50"
                onClick={() => setActiveTab("preview")}
                disabled={!webContainer}
              >
                <Play className="h-3 w-3" />
                {activeTab === "preview" && webContainer ? "Running" : "Preview"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
