'use server'

import prisma from "@/db";
import { getSession } from "@/lib/client";

export async function updateSystemPrompt(projectId: string, systemPrompt: string) {
    try {
        const {data:session} = await getSession();
        if(!session){
            return { success: false, error: "Unauthorized" };
        }
        const updatedProject = await prisma.project.update({
            where: {
                id: projectId,
                userId: session.user.id
            },
            data: {
                systemPrompt: systemPrompt
            }
        });

        return { success: true, project: updatedProject };
    } catch (error) {
        return { success: false, error: "Failed to update system prompt" };
    }
}




