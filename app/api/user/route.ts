import { userSchema } from "@/consts/userSchema";
import prisma from "@/db";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req:Request){
    const {data:session} = await getSession();
    if(!session){
        return NextResponse.json({error:'Unauthorized'},{status:401})
    }
    const user = await prisma.user.findUnique({
        where:{
            id:session.user.id
        }
    })
    return NextResponse.json({user})
}


export async function PUT(req:NextRequest){
    const {data:session} = await getSession();
    if(!session){
        return NextResponse.json({error:'Unauthorized'},{status:401})
    }

    const data = await req.json();

    const validatedUser = userSchema.safeParse(data);
    
    if(!validatedUser.success){
        return NextResponse.json({error:'Invalid user data'},{status:400});
    }

    const user = await prisma.user.update({
        where:{id:session.user.id},
        data:validatedUser.data
    })

    return NextResponse.json({user},{status:200})
}



export async function DELETE(req:NextRequest){
    const {data:session} = await getSession();
    const headersList =await  headers();
    if(!session){
        return NextResponse.json({error:'Unauthorized'},{status:401})
    }
    const userId = session.user.id;

    if(!userId){
        return NextResponse.json({error:'User not found'},{status:404})
    }

    const {success,message} = await auth.api.deleteUser({
        body:{
            callbackURL:'/'
        },
        headers:headersList
    })
    return NextResponse.json({success,message},{status:200})
}   
