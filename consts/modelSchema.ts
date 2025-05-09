import { z } from "zod";

export const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Model = z.infer<typeof modelSchema>; 