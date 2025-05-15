import { generateRoadmap } from "@/app/actions/llms/roadmap";
import prisma from "@/db";
import { getSession } from "@/lib/client";
import { TextBlock } from "@anthropic-ai/sdk/resources/messages.mjs";
import { NextResponse } from "next/server";





export async function POST(req: Request) {

    //         const { data: session } = await getSession();
    //     if (!session) {
    //       return NextResponse.json({ success: false, error: "Unauthorized" });
    //     }


    //     const body = await req.json();
        
    //     const { historyId, prompt, modelType, modelName, roadmapType } = body;

    const {prompt} = await req.json();

    //     const chatHistory = await prisma.chatHistory.findFirst({
    //       where: {
    //         id: historyId,
    //         project: {
    //           userId: session.user.id
    //         }
    //       }
    //     });

    // if (!chatHistory) {
    //   return NextResponse.json({ success: false, error: "Chat history not found" });
    // }

  const roadmap = await generateRoadmap("123", prompt, "gemini", "gemini-2.0-flash", "static")
  return NextResponse.json({
    roadmap:roadmap as string
  });
} 