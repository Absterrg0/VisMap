import { NextRequest } from "next/server";
import { getSession } from "@/lib/client";
import { NextResponse } from "next/server";
import { projectSchema } from "@/consts/projectSchema";
import prisma from "@/db";


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
