"use client"

import { useState } from "react"
import { Check, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CodeEditor() {
  const [copied, setCopied] = useState(false)

  // Sample code for demonstration
  const sampleCode = `import React from 'react';

function HelloWorld() {
  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h1 className="text-2xl font-bold">Hello, World!</h1>
      <p>This is a sample React component.</p>
    </div>
  );
}

export default HelloWorld;`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-1/2 h-full flex flex-col border-l border-border/40 bg-background/95">
      <div className="border-b border-border/40 p-4 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <h2 className="text-lg font-medium">Code Editor</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Tabs defaultValue="code" className="flex-1 flex flex-col">
        <div className="border-b border-border/40 px-4">
          <TabsList className="bg-transparent h-10">
            <TabsTrigger value="code" className="data-[state=active]:bg-background/60">
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-background/60">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="code" className="flex-1 p-0 m-0">
          <div className="h-full overflow-auto p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{sampleCode}</pre>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 p-0 m-0">
          <div className="h-full overflow-auto p-4">
            <div className="p-4 bg-blue-100 rounded-lg text-black">
              <h1 className="text-2xl font-bold">Hello, World!</h1>
              <p>This is a sample React component.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
