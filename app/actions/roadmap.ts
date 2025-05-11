'use server'

import { getSession } from "@/lib/client";
import prisma from "@/db";
import { Anthropic } from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {GoogleGenAI} from '@google/genai'
import { getSystemPrompt } from "@/lib/prompts-llm";

type ModelType = 'claude' | 'gemini' | 'openai';


export async function generateRoadmap(
  historyId: string,
  prompt: string,
  modelType: ModelType,
  modelName?: string
) {
  try {
    // const { data: session } = await getSession();
    // if (!session) {
    //   return { success: false, error: "Unauthorized" };
    // }

    // // Verify the chat history exists and belongs to the user
    // const chatHistory = await prisma.chatHistory.findFirst({
    //   where: {
    //     id: historyId,
    //     project: {
    //       userId: session.user.id
    //     }
    //   },
    //   include: {
    //     project: {
    //       include: {
    //         user: true
    //       }
    //     }
    //   }
    // });

    // if (!chatHistory) {
    //   return { success: false, error: "Chat history not found" };
    // }

    // Combine prompts
    const combinedPrompt = [
      
      prompt
    ].filter(Boolean).join('\n\n');

    // Generate content based on the selected model
    let generatedContent = '';
    
    switch (modelType) {
      case 'claude':
        generatedContent = await generateWithClaude(combinedPrompt, modelName || 'claude-3-opus-20240229');
        break;
      case 'gemini':
        generatedContent = await generateWithGemini(combinedPrompt, modelName || 'gemini-2.0-flash');
        break;
      case 'openai':
        generatedContent = await generateWithOpenAI(combinedPrompt, modelName || 'gpt-4-turbo');
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

async function generateWithClaude(prompt: string, model: string): Promise<string> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const stream = await anthropic.messages.create({
      model,
      system: getSystemPrompt(),
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });

    let result = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        result += chunk.delta.text;
      }
    }

    console.log(result)
    return result;
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error("Failed to generate with Claude");
  }
}

async function generateWithGemini(prompt: string, model: string): Promise<string> {
  try {

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const response = await genAI.models.generateContentStream({
      model: `${model}`,
      contents: [
        { role: "model", parts: [{ text: getSystemPrompt() }] },
        { role: "user", parts: [{ text: prompt }] }
      ],
    });
    let text = "";
    for await (const chunk of response) {
      console.log(chunk.text);
      text += chunk.text;
    }
    return 'DONE';
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate with Gemini");
  }
}

async function generateWithOpenAI(prompt: string, model: string): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4000,
      stream: true
    });

    let result = '';
    for await (const chunk of stream) {
      result += chunk.choices[0]?.delta?.content || '';
    }

    console.log(result)
    return result;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate with OpenAI");
  }
}
