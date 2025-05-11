import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  userId: z.string(),
  status: z.enum(['ACTIVE','DELETED']),
  systemPrompt: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof projectSchema>;
