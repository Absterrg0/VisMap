"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "motion/react"
import { 
  ArrowRight, 
  FileText, 
  Settings, 
  CheckCircle2,
  RefreshCw,
} from "lucide-react"
import { useRandomName } from "@/hooks/useRandomName"
import axios from "axios"
import Logo from "@/components/logo" 

interface OnboardingComponentProps {
  onProjectCreated: () => void
}

export default function OnboardingComponent({ onProjectCreated }: OnboardingComponentProps) {
  const [step, setStep] = useState(1)
  const generateName = useRandomName()
  const [projectName, setProjectName] = useState(generateName())
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant that specializes in data visualization. You help users create beautiful and informative charts and graphs.")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const router = useRouter()

  const handleRandomName = () => {
    setProjectName(generateName())
  }

  const handleContinue = () => {
    if (step === 1 && projectName.trim()) {
      setStep(2)
    }
  }

  const handleSkipOnboarding = async () => {
    setIsLoading(true)

    try {
      const response = await axios.post<{ projectId: string }>("/api/project", {
        name: projectName,
        systemPrompt:
          "You are a helpful AI assistant that specializes in data visualization. You help users create beautiful and informative charts and graphs.",
      })

      if (response.status !== 201) {
        throw new Error("Failed to create project")
      }

      setShowSuccessAnimation(true)
      
      // Delay navigation to show success animation
      setTimeout(() => {
        router.push(`/project/${response.data.projectId}/chat/new`)
      }, 1000)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    setIsLoading(true)

    try {
      const response = await axios.post<{ projectId: string }>("/api/project", {
        name: projectName,
        systemPrompt: systemPrompt || "You are a helpful AI assistant that specializes in data visualization. You help users create beautiful and informative charts and graphs.",
      })

      if (response.status !== 201) {
        throw new Error("Failed to create project")
      }

      setShowSuccessAnimation(true)
      
      // Delay navigation to show success animation
      setTimeout(() => {
        router.push(`/${response.data.projectId}/chat/new`)
      }, 1000)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[550px] w-full">
      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/20 mb-4"
              >
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold"
              >
                Project Created!
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        {/* Card stack effect - decorative layers */}
        <motion.div
          initial={{ opacity: 0, y: 10, rotate: 0 }}
          animate={{ opacity: 0.7, y: 0, rotate: 6 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/10 shadow-xl transform translate-y-3 scale-[0.97] z-0"
        />
        <motion.div
          initial={{ opacity: 0, y: 10, rotate: 0 }}
          animate={{ opacity: 0.8, y: 0, rotate: -6 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/10 shadow-xl transform translate-y-2 scale-[0.98] z-0"
        />

        {/* Main card with premium glass effect */}
        <div className="relative rounded-xl overflow-hidden backdrop-blur-md bg-card/5GH0 border border-primary/20 shadow-2xl z-10">
          {/* Light effects */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent opacity-80 z-0 pointer-events-none" />
          <div className="absolute -top-40 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-2xl opacity-50 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-accent/10 blur-2xl opacity-50 pointer-events-none" />

          {/* Content container */}
          <div className="relative z-10 p-8">
            <div className="text-center flex flex-col space-y-4 mb-8">
              <div className="flex justify-center">
                <Logo className="h-14 w-14 text-primary-foreground" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h1 className="text-3xl font-bold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-sidebar-accent-foreground">
                    Create Your Project
                  </span>
                </h1>
                <motion.p 
                  className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.5 }}
                  key={step}
                >
                  {step === 1 
                    ? "Set up your project details to get started with powerful visualization tools."
                    : "Configure how your AI assistant should behave."
                  }
                </motion.p>
              </motion.div>
            </div>

            <AnimatePresence mode="popLayout">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, filter: "blur(50px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(100px)",transition:{duration:0.5,ease:"easeInOut"} }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <label htmlFor="projectName" className="text-sm font-medium">
                          Project Name
                        </label>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRandomName}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Random
                      </Button>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/30 to-accent/20 opacity-0 group-hover:opacity-100 transition duration-300" />
                      <div className="relative bg-card/50 backdrop-blur-sm rounded-md">
                        <Input
                          id="projectName"
                          placeholder="Enter your project name"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className="h-12 border-primary/20 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleContinue}
                        disabled={!projectName.trim()}
                        className="h-12 w-full text-primary-foreground bg-gradient-to-r from-primary to-sidebar-accent-foreground hover:opacity-90 shadow-md font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed rounded-md"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>

                    <div className="flex justify-center mt-1">
                      <Button
                        variant="ghost"
                        onClick={handleSkipOnboarding}
                        className="h-9 text-xs hover:bg-white/10 transition-all duration-200 text-muted-foreground hover:text-primary"
                      >
                        Skip Setup Process
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, filter: "blur(50px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(100px)",transition:{duration:0.5,ease:"easeInOut"} }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-primary" />
                      <label htmlFor="systemPrompt" className="text-sm font-medium">
                        System Prompt
                      </label>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/30 to-accent/20 opacity-0 group-hover:opacity-100 transition duration-300" />
                      <div className="relative">
                        <Textarea
                          id="systemPrompt"
                          placeholder="Customize how your AI assistant should behave"
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          className="min-h-[80px] resize-none bg-card/50 backdrop-blur-sm border-primary/20 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 transition-all duration-300 rounded-md p-3"
                          rows={3}
                        />
                      </div>
                    </div>
                    

                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleCreateProject}
                        disabled={isLoading}
                        className="h-12 w-full text-primary-foreground bg-gradient-to-r from-primary to-sidebar-accent-foreground hover:opacity-90 shadow-md font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed rounded-md overflow-hidden relative"
                      >
                        {isLoading ? (
                          <>
                            <span className="opacity-0">Creating Project...</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin" />
                            </div>
                          </>
                        ) : (
                          <>
                            Create Project
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <div className="flex justify-center mt-1">
                    <Button
                        variant="ghost"
                        onClick={()=>setStep(1)}
                        className="h-9 text-xs hover:bg-white/10 transition-all duration-200 text-muted-foreground hover:text-primary"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced progress indicator */}
            <div className="mt-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex justify-center gap-5"
              >
                <motion.button
                  onClick={() => !isLoading && setStep(1)}
                  disabled={isLoading}
                  className={`relative flex items-center justify-center h-9 w-9 rounded-full transition-all duration-300 ${step === 1 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-muted/80 text-muted-foreground hover:bg-muted/90'}`}
                  animate={{ scale: step === 1 ? 1.05 : 1 }}
                >
                  1
                  {step === 1 && (
                    <motion.span
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-full blur-[5px] border-2 border-primary"
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
                
                <div className="flex items-center">
                  <div className="h-0.5 w-8 bg-muted overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: step === 1 ? "0%" : "100%" }}
                      transition={{ duration: 0.4 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                
                <motion.button
                  onClick={() => !isLoading && projectName.trim() && setStep(2)}
                  disabled={isLoading || !projectName.trim()}
                  className={`relative flex items-center justify-center h-9 w-9 rounded-full transition-all duration-300 ${step === 2 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-muted/80 text-muted-foreground hover:bg-muted/90'}`}
                >
                  2
                  {step === 2 && (
                    <motion.span
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-full border-2 border-primary blur-[5px]"
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}