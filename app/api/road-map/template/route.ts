import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reactFlowPrompt } from "@/templates/react-flow";
import { roadmapTypePrompt } from "@/lib/template-prompt";

export async function GET(req:NextRequest){
    try{
        // const {data:session} = await getSession();
        // if(!session){
        //     return NextResponse.json({error:'Unauthorized'},{status:401})
        // }
    const { searchParams } = new URL(req.url);
    const template = searchParams.get('template');
    if(!template){
        return NextResponse.json({error:'Template not found'},{status:400})
    }
    return NextResponse.json({roadmapPrompt:roadmapTypePrompt(),intiialFiles:reactFlowPrompt},{status:200})
    }catch(error){
        console.log(error)
        return NextResponse.json({error:'Failed to get roadmap template'},{status:500})
    }
}