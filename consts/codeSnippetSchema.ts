import { z } from "zod";

export const codeSnippetSchema = z.object({
  id: z.string(),
  content: z.string(),
  nodeId: z.string(),
  createdAt: z.date(),
});

export type CodeSnippet = z.infer<typeof codeSnippetSchema>; 