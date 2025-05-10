import { NextRequest } from "next/server";
import { getSession } from "@/lib/client";
import { NextResponse } from "next/server";
import { projectSchema } from "@/consts/projectSchema";
import prisma from "@/db";


//UPDATE PROJECT
export async  function PUT(req:NextRequest,{params}:{params:Promise<{projectId:string}>}){
    try{
        const {data:session} = await getSession();
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
    
        const {projectId} = await params;
    
        const data = await req.json();
    
        const validatedProject = projectSchema.safeParse(data);
        
        if(!validatedProject.success){
            return NextResponse.json({error:'Invalid project data'},{status:400})
        }
    
        if(validatedProject.data.userId !== session.user.id){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
    
        if(validatedProject.data.status === 'DELETED'){
            return NextResponse.json({error:'Cannot update project'},{status:400})
        }
    
        await prisma.project.update({
            where:{id:projectId},
            data:validatedProject.data
        })
    
        return NextResponse.json({
            msg:"Project updated successfully"
        },{status:200})
    }catch(error){
        return NextResponse.json({error:'Failed to update project'},{status:500})
    }
}


//SET PROJECT STATUS TO DELETED
export async function DELETE(req:NextRequest,{params}:{params:Promise<{projectId:string}>}){
    try{
        const {data:session} = await getSession();
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
    
        const {projectId} = await params;
    
        const project = await prisma.project.findUnique({
            where:{id:projectId}
        })
    
        if(!project){
            return NextResponse.json({error:'Project not found'},{status:404})
        }
    
        if(project.userId !== session.user.id){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
        if(project.status === 'DELETED'){
            return NextResponse.json({error:'Project already deleted'},{status:400})
        }
    
        await prisma.project.update({
            where:{id:projectId},
            data:{status:'DELETED'}
        })

        await prisma.chatHistory.updateMany({
            where:{projectId:projectId},
            data:{status:'DELETED'}
        })

      

        return NextResponse.json({
            msg:"Project deleted successfully"
        },{status:200})
    }catch(error){
        return NextResponse.json({error:'Failed to delete project'},{status:500})
    }
}
