//CREATE MESSAGE

import { messageSchema } from "@/consts/messageSchema";
import prisma from "@/db";
import { getSession } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    try {
        const {data:session} = await getSession();
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const data = await req.json();

        const validatedData = messageSchema.safeParse(data);

        if(!validatedData.success){
            return NextResponse.json({error:'Invalid data'},{status:400})
        }  

        const message = await prisma.message.create({
            data:{
                chatHistoryId:validatedData.data.chatHistoryId,
                input:validatedData.data.input,
                output:validatedData.data.output || ''
            }
        })
        
        return NextResponse.json({message},{status:201})
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({error:'Failed to create message'},{status:500})
    }
}   




        