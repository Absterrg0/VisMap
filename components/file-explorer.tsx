"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileNode } from "./code-editor"

interface FileExplorerProps {
  files: FileNode[]
  onSelectFile: (file: FileNode) => void
  selectedFile?: FileNode
}

export function FileExplorer({ files, onSelectFile, selectedFile }: FileExplorerProps) {
  return (
    <div className="p-2">
      <div className="text-sm font-medium px-2 py-1.5 text-muted-foreground">PROJECT</div>
      <div className="mt-1">
        {files.map((file) => (
          <FileTreeItem key={file.name} file={file} level={0} onSelectFile={onSelectFile} selectedFile={selectedFile} />
        ))}
      </div>
    </div>
  )
}

interface FileTreeItemProps {
  file: FileNode
  level: number
  onSelectFile: (file: FileNode) => void
  selectedFile?: FileNode
}

function FileTreeItem({ file, level, onSelectFile, selectedFile }: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(true)
  const isSelected = selectedFile && selectedFile.path === file.path

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  const handleClick = () => {
    onSelectFile(file)
  }

  const isDirectory = file.type === "directory"

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 text-sm rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
          isSelected && "bg-accent text-accent-foreground",
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isDirectory ? (
          <span className="mr-1.5 cursor-pointer" onClick={toggleExpand}>
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        ) : (
          <span className="w-5 mr-1.5"></span>
        )}

        <span className="mr-1.5">
          {isDirectory ? (
            expanded ? (
              <FolderOpen className="h-4 w-4 text-blue-400" />
            ) : (
              <Folder className="h-4 w-4 text-blue-400" />
            )
          ) : (
            <FileIcon fileName={file.name} />
          )}
        </span>

        <span className="truncate">{file.name}</span>
      </div>

      {isDirectory && expanded && file.children && (
        <div>
          {file.children.map((child: any) => (
            <FileTreeItem
              key={child}
              file={child}
              level={level + 1}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FileIcon({ fileName }: { fileName: string }) {
  const extension = fileName.split(".").pop()?.toLowerCase()

  // Color mapping based on file extension
  const getIconColor = () => {
    switch (extension) {
      case "js":
      case "jsx":
        return "text-yellow-400"
      case "ts":
      case "tsx":
        return "text-blue-400"
      case "css":
      case "scss":
      case "sass":
        return "text-pink-400"
      case "html":
        return "text-orange-400"
      case "json":
        return "text-yellow-300"
      case "md":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  return <File className={`h-4 w-4 ${getIconColor()}`} />
}
