'use server'

import { BASE_PROMPT, DIFF_PROMPT } from "@/lib/prompts-llm";
type ModelType = 'claude' | 'gemini' | 'openai';
import generateWithClaude from "@/app/actions/llms/claude";
import generateWithGemini from "@/app/actions/llms/gemini";
import generateWithOpenAI from "@/app/actions/llms/openai";  
import { Message } from "@/types/types";

export async function generateRoadmap(
  historyId: string,
  prompts: Message[],
  modelType: ModelType,
  modelName?: string,
  roadmapType: 'static' | 'interactive' = 'static'
) {
  try {
    

    let generatedContent = '';

    
    const userPrompt = `${DIFF_PROMPT}\n\n${prompts.map(x=>`${x.role}: ${x.content}`).join("\n")}`
    
    switch (modelType) {
      // case 'claude':
      //   generatedContent = await generateWithClaude(userPrompt, BASE_PROMPT, modelName || 'claude-3-opus-20240229');
      //   break;
      case 'gemini':
        generatedContent = await generateWithGemini(userPrompt,BASE_PROMPT, modelName || 'gemini-2.0-flash');
        break;
      // case 'openai':
      //   generatedContent = await generateWithOpenAI(userPrompt, BASE_PROMPT, modelName || 'gpt-4-turbo');
      //   break;
      default:
        return { success: false, error: "Invalid model type" };
    }

    return generatedContent;

    // if (!generatedContent) {
    //   return { success: false, error: "Failed to generate content" };
    // }

    // // Create a new roadmap entry
    // const roadmap = await prisma.roadMap.create({
    //   data: {
    //     chatHistoryId: historyId,
    //     content: generatedContent
    //   }
    // });

    // return { success: true, roadmap };
    
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return { success: false, error: "Failed to generate roadmap" };
  }
}
