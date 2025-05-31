
// import { ReactNode } from "react"
// import { ChatSidebar } from "@/components/sidebar/chat-sidebar"
// import { SidebarProvider } from "@/components/ui/sidebar"
// import { useState } from "react"
// import { ChatHistory, Project } from "@/types/types"
// import OnboardingComponent from "@/components/onboarding"
// import axios from "axios"
// import { useUserProjectStore } from "@/zustand/store"

// interface ChatLayoutProps {
//   children: ReactNode
// }

export default function ChatLayout() {

  // const {projects, setProjects} = useUserProjectStore()
  // const [isOnboarding, setIsOnboarding] = useState(false)
  // const [activeChat, setActiveChat] = useState<ChatHistory | null>(null)
  // useEffect(()=>{
  //   async function init(){
  //     const response = await axios.get<{projects:Project[]}>('/api/project')
  //     if(response.data.projects.length === 0){
  //       setIsOnboarding(true);  
  //     }
  //     if(response.status === 200){
  //       console.log(response.data.projects)
  //       setProjects(response.data.projects)
  //     }
  //   }
  //   init()
  // },[])


  return 
    // <div className="flex h-screen bg-background">
    //   <SidebarProvider>
    //     <ChatSidebar
    //       projects={projects}
    //       selectedProjectId={projects[0]?.id}
    //     />
    //     <div className="relative flex flex-1 flex-col h-screen">
    //       {children}
    //     </div>
    //     {isOnboarding && <div className="absolute inset-0 z-50 backdrop-blur-sm bg-background/50 flex flex-col items-center justify-center h-full">
    //         <OnboardingComponent onProjectCreated={()=>setIsOnboarding(false)} />
    //       </div>}
    //   </SidebarProvider>
    // </div>
}
