import { z } from "zod";

export const roadMapSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RoadMap = z.infer<typeof roadMapSchema>; 