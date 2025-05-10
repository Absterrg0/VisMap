import prisma from "@/db";
import { getSession } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

//UPDATE CHAT HISTORY
export async function PUT(req:NextRequest,{params}:{params:Promise<{projectId:string,historyId:string}>}){
    try {
        const {data:session} = await getSession();
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const {projectId,historyId} = await params;
        if(!projectId || !historyId){
            return NextResponse.json({error:'Project ID and history ID are required'},{status:400})
        }

        // Get visibility from query parameters
        const searchParams = req.nextUrl.searchParams;
        const visibility = searchParams.get('visibility');
        
        if (!visibility || !['PUBLIC', 'PRIVATE'].includes(visibility)) {
            return NextResponse.json({error:'Invalid visibility parameter'},{status:400})
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
        // Update chat history visibility
        const updatedChat = await prisma.chatHistory.update({
            where: {
                id: historyId
            },
            data: {
                visibility: visibility as 'PUBLIC' | 'PRIVATE'
            }
        });

        return NextResponse.json(updatedChat);
        
    } catch (error) {
        console.error('Error updating chat visibility:', error);
        return NextResponse.json({error:'Internal server error'},{status:500})
    }
}


export async function GET(req:NextRequest,{params}:{params:Promise<{projectId:string,historyId:string}>}){
    try {
        const {data:session} = await getSession();
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const {projectId,historyId} = await params;
        if(!projectId || !historyId){
            return NextResponse.json({error:'Project ID and history ID are required'},{status:400})
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
            where:{id:historyId}
        })  

        if(!chatHistory){
            return NextResponse.json({error:'Chat history not found'},{status:404})
        }

        const messages = await prisma.message.findMany({
            where:{chatHistoryId:historyId}
        })
        
        return NextResponse.json({messages},{status:200})
        
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json({error:'Failed to fetch chat history'},{status:500})
    }
}






