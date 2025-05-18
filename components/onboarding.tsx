"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, ArrowLeft, Sparkles, FileText, Settings, CheckCircle2 } from "lucide-react"
import Logo from "@/components/logo"
import { useRandomName } from "@/hooks/useRandomName"
import axios from "axios"

interface OnboardingComponentProps {
  onProjectCreated: () => void
}

export default function OnboardingComponent({ onProjectCreated }: OnboardingComponentProps) {
  const [step, setStep] = useState(1)
  const generateName = useRandomName()
  const [projectName, setProjectName] = useState(generateName())
  const [systemPrompt, setSystemPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleContinue = () => {
    if (step === 1 && projectName.trim()) {
      setStep(2)
    }
  }

  const handleSkipOnboarding = async () => {
    setIsLoading(true)

    try {
      const response = await axios.post('/api/project', {
        name: projectName,
        systemPrompt: "You are a helpful AI assistant that specializes in data visualization. You help users create beautiful and informative charts and graphs."
      })

      if (response.status !== 201) {
        throw new Error('Failed to create project')
      }

      if (onProjectCreated) {
        onProjectCreated()
      }

      router.push('/projects')
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  
  const handleCreateProject = async () => {
    setIsLoading(true)

    try {
      // Make actual API call to create project
      const response = await axios.post('/api/project',{
        name:projectName,
        systemPrompt:systemPrompt
      })

      console.log(response)

      if (response.status !== 201) {
        throw new Error('Failed to create project')
      }

      // Navigate to projects page
      router.push('/projects')
    } catch (error) {
      console.error('Error creating project:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10}}
      animate={{ opacity: 1, y: 0}}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full max-w-md mx-auto relative"
    >
      {/* Card stack effect - bottom card */}
      <motion.div 
        initial={{ opacity: 0, y: 10,rotate:0}}
        animate={{ opacity: 1, y: 0,rotate:10}}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute inset-0 rounded-xl bg-black/5 backdrop-blur-sm border border-white/15 shadow-lg transform translate-y-2  scale-[0.98] z-0 blur-[2px]" />
      <motion.div 
        initial={{ opacity: 0, y: 10,rotate:0}}
        animate={{ opacity: 1, y: 0,rotate:-10}}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute inset-0 rounded-xl bg-black/5 backdrop-blur-sm border border-white/15 shadow-lg transform translate-y-2  scale-[0.98] z-0 blur-[2px]" />
      
      
      {/* Main glass card effect */}
      <div className="relative rounded-xl overflow-hidden bg-black/5 backdrop-blur-xs border border-white/20 shadow-lg z-10">
        {/* Subtle light effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 z-0 pointer-events-none" />
        
        {/* Content container */}
        <div className=" z-10 p-8">
          <div className="text-center justify-center items-center  flex flex-col space-y-3 mb-6  ">
          <Logo className="w-16 h-16" />
   
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-2xl font-bold tracking-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-sidebar-accent-foreground">Project Vis</span>
            </motion.h1>
    
          </div>


          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <label htmlFor="projectName" className="text-sm font-medium">
                      Project Name
                    </label>
                  </div>
                  
                  <div className="relative">
                    <Input
                      id="projectName"
                      placeholder="Enter your project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="h-11 bg-white/5 border-white/20 focus:border-primary/50 focus:ring-primary/30 focus:ring-offset-0 placeholder:text-muted-foreground/50 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleContinue}
                      disabled={!projectName.trim()}
                      className="h-11 w-full bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      Create First Project
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex justify-end cursor-pointer"
                  >
                    <Button
                      variant="ghost"
                      onClick={handleSkipOnboarding}
                      className="h-8 text-xs hover:bg-white/10 transition-all duration-200 text-muted-foreground hover:text-primary b cursor-pointer "
                    >
                      Skip Onboarding
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <label htmlFor="systemPrompt" className="text-sm font-medium">
                      System Prompt
                    </label>
                  </div>
                  
                  <div className="relative">
                    <Textarea
                      id="systemPrompt"
                      placeholder="You are a helpful AI assistant that specializes in data visualization. You help users create beautiful and informative charts and graphs."
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="min-h-[80px] resize-none bg-white/5 border-white/20 focus:border-primary/50 focus:ring-primary/30 focus:ring-offset-0 placeholder:text-muted-foreground/50 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
          
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleCreateProject}
                      disabled={ isLoading}
                      className="h-11 w-full bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <span className="opacity-0">Creating...</span>
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
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className=""
                  >
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className=" text-xs border-white/20 hover:bg-white/10 transition-all duration-200"
                    >
                      <ArrowLeft className=" h-4 w-4" />
                      Back
                    </Button>
                  </motion.div>
                  
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simplified progress indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex justify-center gap-3 pt-6"
          >
            <div className="relative">
              <div className="h-1 w-12 rounded-full bg-white/10" />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: step === 1 ? "100%" : "100%" }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 h-1 rounded-full bg-primary"
              />
            </div>
            
            <div className="relative">
              <div className="h-1 w-12 rounded-full bg-white/10" />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: step === 2 ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 h-1 rounded-full bg-primary"
              />
            </div>
          </motion.div>
          
          {/* Simplified trust indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6 flex justify-center"
          >
            <div className="flex items-center space-x-2 px-3 py-1.5">
              <div className="flex items-center justify-center h-4 w-4 rounded-full bg-primary/20">
                <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Your project data is securely stored and encrypted
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
  }