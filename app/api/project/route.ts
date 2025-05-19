import { NextRequest } from "next/server";
import { getSession } from "@/lib/client";
import { NextResponse } from "next/server";
import prisma from "@/db";
import { projectSchema } from "@/types/projectSchema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

//GET ALL PROJECTS
export async function GET(req:NextRequest){
    try{
        const session = await auth.api.getSession({
            headers:await headers()
        })
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
    
        const projects = await prisma.project.findMany({
            where:{
                userId:session.user.id
            },
            include:{
                chatHistory:{
                    include:{
                        messages:true
                    }
                }
            }
        })
        
        return NextResponse.json({projects},{status:200})
    }catch(error){
        return NextResponse.json({error:'Failed to get projects'},{status:500})
    }
}       

//CREATE PROJECT
export async function POST(req:NextRequest){
    try{
        const session = await auth.api.getSession({
            headers:await headers()
        })
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
    
        const data = await req.json();
    
        const validatedProject = projectSchema.safeParse(data)      ;
        
        if(!validatedProject.success){
            return NextResponse.json({error:'Invalid project data'},{status:400})
        }
    
        const project = await prisma.project.create({
            data:{
                name:validatedProject.data.name,
                systemPrompt:validatedProject.data.systemPrompt,
                userId:session.user.id
            }
        })      

        const chatHistory = await prisma.chatHistory.create({
            data:{
                projectId:project.id
            }
        })

        await prisma.roadMap.create({
            data:{
                chatHistoryId:chatHistory.id,
                content:''
            }
        })
    
        return NextResponse.json({projectId:project.id},{status:201})
    }catch(error){
        console.error('Error in POST /api/project:', error);
        return NextResponse.json({error:'Failed to create project'},{status:500})
    }
}   

