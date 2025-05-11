import { Anthropic } from "@anthropic-ai/sdk";
import { getSystemPrompt } from "@/lib/prompts-llm";

export default async function generateWithClaude(prompt: string,templatePrompt: string[], model: string): Promise<string> {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
  
      const stream = await anthropic.messages.create({
        model,
        system: getSystemPrompt(),
        max_tokens: 4000,
        messages: [{ role: 'assistant', content: templatePrompt[0] }
            ,{role:'assistant', content: templatePrompt[1]}
            ,{role:'user', content: prompt}
        ],
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