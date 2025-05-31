import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {NextResponse } from "next/server";





export async function GET(){
    try {
        const session = await auth.api.getSession(
            {
                headers:await headers()
            }
        );
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        // const {historyId} = await params;
        // if(!historyId){
        //     return NextResponse.json({error:'Project ID is required'},{status:400})
        // }

       

        // const roadMap = await prisma.roadMap.findFirst({
        //     where:{chatHistoryId:historyId},
        //     orderBy:{version:'desc'},
        //     take:5
        // })

        return NextResponse.json({},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:'Failed to get roadMap'},{status:500})
    }
}