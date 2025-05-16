import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/client";
import { mermaidPrompt } from "@/templates/mermaid";
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
    if(template === 'static'){
        return NextResponse.json({roadmapPrompt:roadmapTypePrompt(template as 'static' | 'interactive '),intiialFiles:mermaidPrompt},{status:200})
    }
    if(template === 'interactive'){
        return NextResponse.json({roadmapPrompt:roadmapTypePrompt(template as 'static' | 'interactive '),intiialFiles:reactFlowPrompt},{status:200})
    }
    return NextResponse.json({error:'Invalid template'},{status:400})
    }catch(error){
        return NextResponse.json({error:'Failed to get roadmap template'},{status:500})
    }
}