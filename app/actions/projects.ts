'use server'

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateSystemPrompt(projectId: string, systemPrompt: string) {
    try {
        const session = await auth.api.getSession({
            headers:await headers()
        });
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
        console.log(error)
        return { success: false, error: "Failed to update system prompt" };
    }
}




