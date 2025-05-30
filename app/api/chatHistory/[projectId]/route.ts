import { getSession } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";
import { messageSchema } from "@/types/messageSchema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

//GET CHAT HISTORY
export async function GET(req:NextRequest,{params}:{params:Promise<{projectId:string}>}){
    try {
        const session = await auth.api.getSession({
            headers:await headers()
        })
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }


        const {projectId} = await params;
        if(!projectId){
            return NextResponse.json({error:'Project ID is required'},{status:400})
        }

        const project = await prisma.project.findUnique({
            where:{id:projectId}
        })

        if(!project){
            return NextResponse.json({error:'Project not found'},{status:404})
        }
        if(project.userId !== session.user.id){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }   

        const chatHistory = await prisma.chatHistory.findMany({
            where:{projectId:projectId,status:'ACTIVE'}
        })
        
        return NextResponse.json({chatHistory},{status:200})
    } catch (error) {
        return NextResponse.json({error:'Failed to get chat history'},{status:500})
    }
}








//DELETE CHAT HISTORY
export async function DELETE(req:NextRequest,{params}:{params:Promise<{projectId:string}>}){
    try {
        const {data:session} = await getSession();
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const {projectId} = await params;
        if(!projectId){
            return NextResponse.json({error:'Project ID is required'},{status:400})
        }

        const project = await prisma.project.findUnique({
            where:{id:projectId}
        })

        if(!project){
            return NextResponse.json({error:'Project not found'},{status:404})
        }

        if(project.userId !== session.user.id){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const chatHistory = await prisma.chatHistory.findUnique({
            where:{id:projectId}
        })

        if(!chatHistory){
            return NextResponse.json({error:'Chat history not found'},{status:404})
        }

        await prisma.chatHistory.update({
            where:{id:projectId},
            data:{status:'DELETED'}
        })
        
    

        return NextResponse.json({message:'Chat history deleted successfully'},{status:200})
        
    } catch (error) {
        return NextResponse.json({error:'Failed to delete chat history'},{status:500})
    }
}





export async function POST(req:NextRequest,{params}:{params:Promise<{projectId:string}>}){
    try{

        const session = await auth.api.getSession({
            headers:await headers()
        })
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const {projectId} = await params;
        if(!projectId){
            return NextResponse.json({error:'Project ID is required'},{status:400})
        }

        const project = await prisma.project.findUnique({
            where:{id:projectId}
        }) 
        if(!project){
            return NextResponse.json({error:'Project not found'},{status:404})
        }

        if(project.userId !== session.user.id){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const {prompt} = await req.json();
        if(!prompt){
            return NextResponse.json({error:'Prompt is required'},{status:400})
        }

        const chatHistory = await prisma.chatHistory.create({
            data:{
                name:prompt.slice(0,20),
                projectId:projectId,

            }
        })
        
         await prisma.message.create({
            data:{
                chatHistoryId:chatHistory.id,
                content:prompt,
                role:'USER'
            }
        })

        return NextResponse.json({
            chatHistoryId:chatHistory.id
        },{status:200})

    }
    catch(error){
        console.log(error)
        return NextResponse.json({error:'Failed to create chat history'},{status:500})
    }

}