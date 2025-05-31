//CREATE MESSAGE

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { messageSchema } from "@/types/messageSchema";


export async function POST(req:NextRequest){
    try {

        const session = await auth.api.getSession(
            {
                headers:await headers()
            }
        );
        if(!session){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }

        const data = await req.json();

        const validatedData = messageSchema.safeParse(data);

        if(!validatedData.success){
            return NextResponse.json({error:'Invalid data'},{status:400})
        }  

        
        return NextResponse.json({"status":true},{status:200})
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({error:'Failed to create message'},{status:500})
    }
}   




        