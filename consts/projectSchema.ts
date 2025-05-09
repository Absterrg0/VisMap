import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  userId: z.string(),
  systemPrompt: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof projectSchema>;
