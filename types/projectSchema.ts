import { z } from "zod";

export const projectSchema = z.object({
  name: z.string(),
  systemPrompt: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;



const userId = "JQ3y5Day2sgOsyTJhZj2StQQIgf6aGMm"


const projectId = "fa803cfa-8c40-406b-99f7-eeb865f93bc0"