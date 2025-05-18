import { userSchema } from "@/types/userSchema";
import prisma from "@/db";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";


//GET USER DETAILS
export async function GET(req:Request){
    try {
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
    } catch (error) {
        console.error('Error in GET /api/user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

//UPDATE USER DETAILS
export async function PUT(req:NextRequest){
    try {
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
    } catch (error) {
        console.error('Error in PUT /api/user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

//DELETE USER
export async function DELETE(req:NextRequest){
    try {
        const {data:session} = await getSession();
        const headersList = await headers();
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
    } catch (error) {
        console.error('Error in DELETE /api/user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}   
