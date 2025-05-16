import { getSystemPrompt } from "@/lib/prompts-llm";
import { GoogleGenAI } from "@google/genai";

export default async function generateWithGemini(prompt: string, BASE_PROMPT: string, model: string): Promise<string> {
    try {
  
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const response = await genAI.models.generateContentStream({
        model: `${model}`,
        contents: [
          { role: "user", parts: [{ text: BASE_PROMPT }] },
          { role: "user", parts: [{ text: prompt }] }
        ],
        config:{
          systemInstruction: getSystemPrompt()
        }
      });
      let text = "";
      for await (const chunk of response) {
        text += chunk.text;
        console.log(chunk.text)
      }
      return text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate with Gemini");
    }
  } 