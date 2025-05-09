import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  chatHistoryId: z.string(),
  input: z.string(),
  output: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Message = z.infer<typeof messageSchema>; 