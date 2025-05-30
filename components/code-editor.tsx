"use client"

import { useState, useEffect, useRef } from "react"
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
  onStepComplete?: (stepId: string) => void // Add callback for step completion
  onStreamingStart?: () => void // Add callback for when streaming starts
  streamingConfig?: {
    chunkSize?: number
    delayMs?: number
    enabled?: boolean
  }
}

export interface FileNode {
  name: string
  type: "file" | "folder"
  content?: string
  children?: FileNode[]
  path?: string
}

export function CodeEditor({ steps, files, onStepComplete, onStreamingStart, streamingConfig }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileNode>()
  const [activeTab, setActiveTab] = useState("editor")
  const [editorContent, setEditorContent] = useState("")  
  const [isStreaming, setIsStreaming] = useState(false)
  const [mountStructure, setMountStructure] = useState<Record<string, any>>({})
  const streamingTimeoutRef = useRef<NodeJS.Timeout[]>([])
  const currentStreamingStepId = useRef<number | null>(null) // Track which step is currently streaming
  const webContainer = useWebContainer()  

  // Clear any ongoing streaming when component unmounts or file changes
  const clearStreaming = () => {
    streamingTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
    streamingTimeoutRef.current = []
    setIsStreaming(false)
    // Don't reset currentStreamingStepId here as it should only be reset when step completes
  }

  // Stream content with chunking effect
  const streamContent = (content: string, onComplete?: () => void) => {
    clearStreaming()
    
    setIsStreaming(true)
    setEditorContent("") // Start with empty content

    // Notify parent that streaming has started
    if (onStreamingStart) {
      onStreamingStart()
    }

    if (!content) {
      setIsStreaming(false)
      onComplete?.()
      return
    }

    // Configuration for streaming speed - made more visible
    const CHUNK_SIZE = streamingConfig?.chunkSize || 5 // Characters per chunk (increased)
    const DELAY_MS = streamingConfig?.delayMs || 25 // Milliseconds between chunks (increased for visibility)

    let currentIndex = 0
    const chunks: string[] = []

    // Split content into chunks
    while (currentIndex < content.length) {
      chunks.push(content.slice(currentIndex, currentIndex + CHUNK_SIZE))
      currentIndex += CHUNK_SIZE
    }

    console.log(`Starting to stream ${content.length} characters in ${chunks.length} chunks`);

    // Stream chunks
    let streamedContent = ""
    chunks.forEach((chunk, index) => {
      const timeout = setTimeout(() => {
        streamedContent += chunk
        setEditorContent(streamedContent)

        // If this is the last chunk, mark streaming as complete
        if (index === chunks.length - 1) {
          setIsStreaming(false)
          console.log('Streaming completed for file');
          // Add a small delay before calling onComplete to let the user see the final content
          setTimeout(() => {
            onComplete?.()
          }, 500) // Increased delay
        }
      }, index * DELAY_MS)

      streamingTimeoutRef.current.push(timeout)
    })
  }

  const handlePreviewClick = () => {
    
      webContainer!.mount(mountStructure);
      setActiveTab("preview");
      console.log("Mounted structure", webContainer!);
    
  }

  // Auto-open file that's currently being worked on
  useEffect(() => {
    const inProgressStep = steps.find(step => step.status === 'in-progress' && step.path);
    
    console.log('Steps updated in CodeEditor:', steps.map(s => ({ 
      id: s.id, 
      title: s.title, 
      status: s.status, 
      path: s.path,
      hasContent: !!s.code 
    })));
    
    if (inProgressStep && inProgressStep.path) {
      console.log('Looking for in-progress step file:', inProgressStep.path, inProgressStep);
      
      // Check if this is a different step than what's currently streaming
      const isDifferentStep = currentStreamingStepId.current !== inProgressStep.id;
      
      if (isDifferentStep) {
        console.log('New step detected for streaming:', inProgressStep.id, 'Previous:', currentStreamingStepId.current);
        
        // Clear any ongoing streaming first
        clearStreaming();
        
        // Update the tracking reference
        currentStreamingStepId.current = inProgressStep.id;
        
        // Find the corresponding file in the files array with improved matching
        const findFileByPath = (files: FileNode[], targetPath: string): FileNode | null => {
          // Normalize the target path
          const normalizedTargetPath = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;
          const targetFileName = targetPath.split('/').pop();
          
          for (const file of files) {
            if (file.type === 'file') {
              // Try exact path match first
              if (file.path === targetPath) {
                return file;
              }
              
              // Try normalized path match
              const normalizedFilePath = file.path?.startsWith('/') ? file.path.slice(1) : file.path;
              if (normalizedFilePath === normalizedTargetPath) {
                return file;
              }
              
              // Try name-only match as fallback
              if (file.name === targetFileName) {
                return file;
              }
              
              // Try path ending match
              if (file.path?.endsWith(targetPath) || targetPath.endsWith(file.path || '')) {
                return file;
              }
            }
            
            if (file.type === 'folder' && file.children) {
              const found = findFileByPath(file.children, targetPath);
              if (found) return found;
            }
          }
          return null;
        };

        const targetFile = findFileByPath(files, inProgressStep.path!);
        console.log('Found target file:', targetFile?.name, 'Content length:', targetFile?.content?.length);
        
        if (targetFile) {
          console.log('Auto-opening file with content:', targetFile.name);
          setSelectedFile(targetFile);
          setActiveTab("editor"); // Switch to editor tab
          
          // Always stream the content if available, otherwise wait for content
          if (targetFile.content) {
            console.log('Starting stream for file:', targetFile.name, 'Content length:', targetFile.content.length);
            streamContent(targetFile.content || "", () => {
              // After streaming is complete, mark step as complete and move to next
              if (onStepComplete && inProgressStep.id) {
                console.log('Streaming complete, marking step as done:', inProgressStep.id);
                currentStreamingStepId.current = null; // Reset tracking
                onStepComplete(String(inProgressStep.id));
              }
            });
          } else {
            console.log('File found but no content yet, waiting...');
            // Set empty content and wait for file to be populated
            setEditorContent("");
            // Check again in a short while for content
            setTimeout(() => {
              const updatedFile = findFileByPath(files, inProgressStep.path!);
              if (updatedFile?.content) {
                console.log('Content now available, starting stream');
                streamContent(updatedFile.content, () => {
                  if (onStepComplete && inProgressStep.id) {
                    console.log('Delayed streaming complete, marking step as done:', inProgressStep.id);
                    currentStreamingStepId.current = null;
                    onStepComplete(String(inProgressStep.id));
                  }
                });
              }
            }, 100);
          }
        } else {
          console.log('File not found in files array:', inProgressStep.path);
          console.log('Available files:', files.map(f => ({ name: f.name, path: f.path, type: f.type, hasContent: !!f.content })));
          // Reset tracking and mark as complete if file not found
          currentStreamingStepId.current = null;
          if (onStepComplete && inProgressStep.id) {
            onStepComplete(String(inProgressStep.id));
          }
        }
      } else {
        console.log('Same step still in progress:', inProgressStep.id);
      }
    } else {
      console.log('No in-progress step with path found');
      // Reset tracking if no in-progress step
      if (currentStreamingStepId.current !== null) {
        console.log('Resetting tracking - no in-progress step');
        currentStreamingStepId.current = null;
      }
    }
  }, [steps, files, onStepComplete, onStreamingStart]);

  // Update editor content when selected file content changes (only if not currently streaming)
  useEffect(() => {
    if (selectedFile && !isStreaming) {
      setEditorContent(selectedFile.content || "");
    }
  }, [selectedFile?.content, selectedFile?.path, isStreaming]);

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
    console.log("Mounting structure", mountStructure);
    setMountStructure(mountStructure);
    // Mount the structure if WebContainer is available
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearStreaming()
      currentStreamingStepId.current = null // Reset step tracking on unmount
    }
  }, [])

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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard} 
                className="gap-2"
                disabled={isStreaming}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" disabled={isStreaming}>
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
                      isStreaming ? "bg-blue-500 animate-pulse" : 
                      selectedFile && selectedFile.type === "file" ? "bg-green-500" : "bg-muted-foreground/30",
                    )}
                  />
                  {selectedFile && selectedFile.type === "file" ? 
                    `${selectedFile.name}${isStreaming ? " (populating...)" : ""}` : "Editor"}
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => handlePreviewClick()}
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
                      readOnly: isStreaming,
                      automaticLayout: true,
                      wordWrap: "on",
                      tabSize: 2,
                      insertSpaces: true,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      glyphMargin: false,
                      renderValidationDecorations: "off",
                      
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
              <PreviewFrame webContainer={webContainer!} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Status Bar */}
          <div className="h-8 border-t border-border/40 bg-background/95 px-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {selectedFile && selectedFile.type === "file" && (
                <>
                  <span className="flex items-center gap-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isStreaming ? "bg-blue-500 animate-pulse" : "bg-green-500"
                    )}></div>
                    {isStreaming ? "STREAMING" : getFileLanguage(selectedFile.name).toUpperCase()}
                  </span>
                  {!isStreaming && (
                    <>
                      <span>UTF-8</span>
                      <span>LF</span>
                    </>
                  )}
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
                onClick={() => handlePreviewClick()}
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
