import prisma from "@/db";





export async function fetchProjects(userId:string){
    const projects = await prisma.project.findMany({
        where: {
            userId,
        },
    })

    return projects
}