import { getSystemPrompt } from "@/lib/prompts-llm";
import OpenAI from "openai";

export default async function generateWithOpenAI(prompt: string, templatePrompt: string[], model: string): Promise<string> {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
  
      const stream = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'system', content: templatePrompt[0] },
          { role: 'system', content: templatePrompt[1] },
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
  