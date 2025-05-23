import { z } from "zod";

export const nodeSchema = z.object({
  id: z.string(),
  roadMapId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  positionX: z.number(),
  positionY: z.number(),
  positionZ: z.number(),
  parentId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Node = z.infer<typeof nodeSchema>; 
