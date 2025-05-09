import { NextRequest } from "next/server";
import { getSession } from "@/lib/client";
import { NextResponse } from "next/server";
import prisma from "@/db";
import { projectSchema } from "@/consts/projectSchema";
export async function GET(req:NextRequest){
    const {data:session} = await getSession();
    if(!session){
        return NextResponse.json({error:'Unauthorized'},{status:401})
    }

    const projects = await prisma.project.findMany({
        where:{
            userId:session.user.id
        }
    })
    
    return NextResponse.json({projects},{status:200})
}       


export async function POST(req:NextRequest){
    const {data:session} = await getSession();
    if(!session){
        return NextResponse.json({error:'Unauthorized'},{status:401})
    }

    const data = await req.json();

    const validatedProject = projectSchema.safeParse(data);
    
    if(!validatedProject.success){
        return NextResponse.json({error:'Invalid project data'},{status:400})
    }

    const project = await prisma.project.create({
        data:validatedProject.data
    })      

    return NextResponse.json({projectId:project.id},{status:201})
}   


export async function PUT(req:NextRequest){
    const {data:session} = await getSession();
    if(!session){
        return NextResponse.json({error:'Unauthorized'},{status:401})
    }

    const data = await req.json();

    const validatedProject = projectSchema.safeParse(data);
    
    if(!validatedProject.success){
        return NextResponse.json({error:'Invalid project data'},{status:400})
    }

    const project = await prisma.project.update({
        where:{id:validatedProject.data.id},
        data:validatedProject.data
    })

    return NextResponse.json({project},{status:200})
}


