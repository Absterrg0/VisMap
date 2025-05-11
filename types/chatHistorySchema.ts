import { z } from "zod";

export const chatHistorySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ChatHistory = z.infer<typeof chatHistorySchema>; 