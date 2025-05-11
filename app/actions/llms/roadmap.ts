'use server'

import { BASE_PROMPT, DIFF_PROMPT } from "@/lib/prompts-llm";
type ModelType = 'claude' | 'gemini' | 'openai';
import generateWithClaude from "@/app/actions/llms/claude";
import generateWithGemini from "@/app/actions/llms/gemini";
import generateWithOpenAI from "@/app/actions/llms/openai";  
import { templatePrompt } from "@/lib/template-prompt";

export async function generateRoadmap(
  historyId: string,
  prompt: string,
  modelType: ModelType,
  modelName?: string,
  roadmapType: 'static' | 'dynamic' = 'static'
) {
  try {
    const template = templatePrompt(roadmapType)

    let generatedContent = '';

    const userPrompt = `${DIFF_PROMPT}\n\n${prompt}`
    
    switch (modelType) {
      case 'claude':
        generatedContent = await generateWithClaude(userPrompt, template, modelName || 'claude-3-opus-20240229');
        break;
      case 'gemini':
        generatedContent = await generateWithGemini(userPrompt,template, modelName || 'gemini-2.0-flash');
        break;
      case 'openai':
        generatedContent = await generateWithOpenAI(userPrompt, template, modelName || 'gpt-4-turbo');
        break;
      default:
        return { success: false, error: "Invalid model type" };
    }

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
