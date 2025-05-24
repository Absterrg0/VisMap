'use server'

import { GoogleGenAI } from '@google/genai';
import { getSystemPrompt } from '@/lib/prompts-llm';

// Helper function to extract complete visAction blocks
function extractCompleteVisActions(text: string): any[] {
  const visActionRegex = /<visAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/visAction>/g;
  const actions: any[] = [];
  let match;
  let actionId = 1;

  while ((match = visActionRegex.exec(text)) !== null) {
    const [, type, filePath, content] = match;
    
    actions.push({
      id: actionId++,
      type: type,
      filePath: filePath || undefined,
      content: content.trim(),
      raw: match[0] // Include the full XML block
    });
  }

  return actions;
}

// Helper function to extract complete step blocks
function extractCompleteSteps(text: string): any[] {
  const stepRegex = /<step[^>]*>([\s\S]*?)<\/step>/g;
  const steps: any[] = [];
  let match;
  let stepId = 1;

  while ((match = stepRegex.exec(text)) !== null) {
    steps.push({
      id: stepId++,
      content: match[1].trim(),
      raw: match[0]
    });
  }

  return steps;
}

// Updated to return ReadableStream with incremental parsing
export default async function generateWithGemini(
  prompt: string, 
  BASE_PROMPT: string, 
  model: string
): Promise<ReadableStream> {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const response = await genAI.models.generateContentStream({
      model: `${model}`,
      contents: [
        { role: "user", parts: [{ text: BASE_PROMPT }] },
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: getSystemPrompt()
      }
    });

    // Create a ReadableStream that processes the Gemini stream
    const stream = new ReadableStream({
      async start(controller) {
        let accumulatedText = "";
        let lastParsedActions = 0;
        let lastParsedSteps = 0;
        
        try {
          for await (const chunk of response) {
            const chunkText = chunk.text;
            accumulatedText += chunkText;
            console.log('Raw chunk:', chunkText);
            
            // Send raw chunk immediately for real-time display
            controller.enqueue(new TextEncoder().encode(
              JSON.stringify({
                type: 'chunk',
                content: chunkText,
                timestamp: Date.now()
              }) + '\n'
            ));

            
           
          }
        
          // Send final complete response
          controller.enqueue(new TextEncoder().encode(
            JSON.stringify({
              type: 'complete',
              fullContent: accumulatedText,
              timestamp: Date.now()
            }) + '\n'
          ));

          controller.close();
        } catch (error) {
          console.error("Gemini streaming error:", error);
          controller.enqueue(new TextEncoder().encode(
            JSON.stringify({
              type: 'error',
              message: (error as Error).message,
              timestamp: Date.now()
            }) + '\n'
          ));
          controller.close();
        }
      }
    });

    return stream;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate with Gemini");
  }
}