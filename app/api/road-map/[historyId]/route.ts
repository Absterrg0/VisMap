import prisma from "@/db";
import { getSession } from "@/lib/client";
import {NextResponse } from "next/server";





export async function GET({params}:{params:Promise<{historyId:string}>}){
    try {
        const {data:session} = await getSession();
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const {historyId} = await params;
        if(!historyId){
            return NextResponse.json({error:'Project ID is required'},{status:400})
        }

        const project = await prisma.project.findUnique({
            where:{id:historyId}
        })
        if(!project){
            return NextResponse.json({error:'Project not found'},{status:404})
        }

        const roadMap = await prisma.roadMap.findFirst({
            where:{chatHistoryId:historyId},
            orderBy:{version:'desc'},
            take:5
        })

        return NextResponse.json({roadMap},{status:200})
    } catch (error) {
        return NextResponse.json({error:'Failed to get roadMap'},{status:500})
    }
}