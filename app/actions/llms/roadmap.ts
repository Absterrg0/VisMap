'use server'

import { BASE_PROMPT, DIFF_PROMPT } from "@/lib/prompts-llm";
import { parseXml, parseXmlStreaming } from '@/lib/steps';
import generateWithGemini from "@/app/actions/llms/gemini";
import { Message } from "@/types/types";

type ModelType = 'claude' | 'gemini' | 'openai';

// Updated generateRoadmap to return streaming response
export async function generateRoadmap(
  historyId: string,
  prompts: Message[],
  modelType: ModelType,
  modelName?: string,
  roadmapType: 'static' | 'interactive' = 'static'
): Promise<ReadableStream> {
  try {
    const userPrompt = `${DIFF_PROMPT}\n\n${prompts.map(x => `${x.role}: ${x.content}`).join("\n")}`;
    
    let geminiStream: ReadableStream;
    
    switch (modelType) {
      case 'gemini':
        geminiStream = await generateWithGemini(userPrompt, BASE_PROMPT, modelName || 'gemini-2.0-flash');
        break;
      default:
        throw new Error("Invalid model type");
    }

    // Create a transform stream that processes the Gemini output
    const transformStream = new ReadableStream({
      async start(controller) {
        const reader = geminiStream.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let processedActionCount = 0;
        let hasProcessedIntro = false;
        let hasProcessedOutro = false;
        let existingSteps: any[] = [];

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
                  case 'chunk':
                    // Accumulate content
                    fullContent += data.content;
                    
                    // Send raw chunk for real-time display
                    controller.enqueue(new TextEncoder().encode(
                      JSON.stringify({
                        type: 'raw_chunk',
                        content: data.content,
                        timestamp: data.timestamp
                      }) + '\n'
                    ));
                    

                    // Try parsing current accumulated content with streaming parser
                    try {
                      const streamingResult = parseXmlStreaming(
                        fullContent, 
                        processedActionCount, 
                        hasProcessedIntro,
                        existingSteps
                      );
                      
                      // Send new steps if any were parsed
                      if (streamingResult.newSteps.length > 0) {
                        controller.enqueue(new TextEncoder().encode(
                          JSON.stringify({
                            type: 'new_steps',
                            steps: streamingResult.newSteps,
                            timestamp: Date.now()
                          }) + '\n'
                        ));
                        
                        // Add new steps to existing steps
                        existingSteps = [...existingSteps, ...streamingResult.newSteps];
                      }
                      
                      // Send updated steps if any were updated
                      if (streamingResult.updatedSteps.length > 0) {
                        controller.enqueue(new TextEncoder().encode(
                          JSON.stringify({
                            type: 'updated_steps',
                            steps: streamingResult.updatedSteps,
                            timestamp: Date.now()
                          }) + '\n'
                        ));
                        
                        // Update existing steps
                        streamingResult.updatedSteps.forEach(updatedStep => {
                          const index = existingSteps.findIndex(s => s.id === updatedStep.id);
                          if (index !== -1) {
                            existingSteps[index] = updatedStep;
                          }
                        });
                      }
                      
                      // Update tracking variables
                      processedActionCount = streamingResult.processedActionCount;
                      hasProcessedIntro = streamingResult.hasIntro;
                      hasProcessedOutro = streamingResult.hasOutro;
                    } catch (parseError) {
                      // Parsing not ready yet or incomplete, continue accumulating
                      console.log('Parsing not ready, continuing...', parseError);
                    }
                    break;
                    
                  case 'complete':
                    // Final parse with complete content to ensure we didn't miss anything
                    const finalSteps = parseXml(data.fullContent);
                    
                    controller.enqueue(new TextEncoder().encode(
                      JSON.stringify({
                        type: 'final_result',
                        steps: finalSteps,
                        fullContent: data.fullContent,
                        historyId: historyId,
                        timestamp: data.timestamp
                      }) + '\n'
                    ));
                    
                    // Optional: Save to database here
                    // await saveRoadmapToDatabase(historyId, finalSteps, data.fullContent);
                    break;
                    
                  case 'error':
                    controller.enqueue(new TextEncoder().encode(
                      JSON.stringify({
                        type: 'error',
                        message: data.message,
                        timestamp: data.timestamp
                      }) + '\n'
                    ));
                    break;
                }
              } catch (parseError) {
                console.error('Error parsing stream data:', parseError);
              }
            }
          }

          controller.enqueue(new TextEncoder().encode(
            JSON.stringify({
              type: 'stream_complete',
              timestamp: Date.now()
            }) + '\n'
          ));

          controller.close();
        } catch (error) {
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

    return transformStream;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    
    // Return error stream
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(
          JSON.stringify({
            type: 'error',
            message: (error as Error).message,
            timestamp: Date.now()
          }) + '\n'
        ));
        controller.close();
      }
    });
  }
}