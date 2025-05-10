'use server'

import { getSession } from "@/lib/client";
import prisma from "@/db";
import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

type ModelType = 'claude' | 'gemini' | 'openai';



const adminSystemPrompt = `
You are a project manager.
You are responsible for creating a roadmap for a project.
You are responsible for creating a roadmap for a project.
You are responsible for creating a roadmap for a project.
`

export async function generateRoadmap(
  historyId: string,
  prompt: string,
  modelType: ModelType,
  modelName?: string
) {
  try {
    const { data: session } = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the chat history exists and belongs to the user
    const chatHistory = await prisma.chatHistory.findFirst({
      where: {
        id: historyId,
        project: {
          userId: session.user.id
        }
      },
      include: {
        project: {
          include: {
            user: true
          }
        }
      }
    });

    if (!chatHistory) {
      return { success: false, error: "Chat history not found" };
    }

    // Combine prompts
    const combinedPrompt = [
      adminSystemPrompt,
      chatHistory.project.user.customPrompt,
      prompt
    ].filter(Boolean).join('\n\n');

    // Generate content based on the selected model
    let generatedContent = '';
    
    switch (modelType) {
      case 'claude':
        generatedContent = await generateWithClaude(combinedPrompt, modelName || 'claude-3-opus-20240229');
        break;
      case 'gemini':
        generatedContent = await generateWithGemini(combinedPrompt, modelName || 'gemini-pro');
        break;
      case 'openai':
        generatedContent = await generateWithOpenAI(combinedPrompt, modelName || 'gpt-4-turbo');
        break;
      default:
        return { success: false, error: "Invalid model type" };
    }

    if (!generatedContent) {
      return { success: false, error: "Failed to generate content" };
    }

    // Create a new roadmap entry
    const roadmap = await prisma.roadMap.create({
      data: {
        chatHistoryId: historyId,
        content: generatedContent
      }
    });

    return { success: true, roadmap };
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

    const response = await anthropic.messages.create({
      model,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content.reduce((acc, item) => {
      if (item.type === 'text') {
        return acc + item.text;
      }
      return acc;
    }, '');
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error("Failed to generate with Claude");
  }
}

async function generateWithGemini(prompt: string, model: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    const geminiModel = genAI.getGenerativeModel({ model });
    
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    return response.text();
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

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000
    });

    return response.choices[0]?.message.content || '';
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate with OpenAI");
  }
}
