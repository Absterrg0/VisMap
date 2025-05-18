"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, signIn } from "@/lib/client"
import axios from "axios"
import type { Project } from "@/types/types"
import OnboardingComponent from "@/components/onboarding"
import { motion, AnimatePresence } from "motion/react"

import Loader from "@/components/ui/loader"
import SignInComponent from "@/components/signin-form"
// Mock function to get user data
const getUserData = async () => {
  const session = await getSession()
  if (!session || !session.data) return null

  const user = session.data.user
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

// Main Page Component
export default function Home() {
  const router = useRouter()
  const [pageState, setPageState] = useState("loading")

  useEffect(() => {
    
    const checkUserStatus = async () => {
      try {
        const user = await getUserData()

        if (!user) {
          setPageState("signIn")
          return
        }

        const projects = await axios.get<{ projects: Project[] }>("/api/project")

        if (projects.data.projects.length === 0) {
          setPageState("onboarding")
        } else {
          setPageState("redirect")
        }
      } catch (error) {
        console.error("Error checking user status:", error)
        setPageState("signIn")
      }
    }

    checkUserStatus()
  }, [])

  useEffect(() => {
    if (pageState === "redirect") {
      router.push("/projects")
    }
  }, [pageState, router])


  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Enhanced backdrop with deeper colors */}
      <div className="absolute inset-0">
        {/* Deep background gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-80" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 blur-3xl" />
      </div>
      

      {/* Subtle light beams */}
      <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-1/3 h-64 bg-gradient-to-t from-accent/10 to-transparent blur-3xl opacity-20" />
      
      {/* Enhanced grid pattern - more subtle and glassy */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--primary) 1px, transparent 1px),
                           linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glass noise texture overlay for richness */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Main content layout with subtle sidebar and centered content */}
      <div className="relative z-10 min-h-screen w-full flex flex-col lg:flex-row">
        
        {/* Main centered content area */}
        <div className="flex-1 flex items-center justify-center min-h-screen w-full">
          <div className="relative z-10 w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {pageState === "loading" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center"
                >
                  <Loader />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-muted-foreground/80 font-light"
                  >
                    Preparing your workspace...
                  </motion.p>
                </motion.div>
              )}
              {pageState === "signIn" && <SignInComponent />}
              {pageState === "onboarding" && <OnboardingComponent onProjectCreated={() => setPageState("redirect")} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}