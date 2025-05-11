import { generateRoadmap } from "@/app/actions/roadmap"
import { NextResponse } from "next/server"




export async function GET(request:Request){

    const response = await generateRoadmap('123', 'Build a roadmap for a new project named "Roadmap Builder"', 'gemini')
    
    console.log("DONE")
    return NextResponse.json("DONE")
}