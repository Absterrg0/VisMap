"use client"

import type React from "react"

import { useState, useRef } from "react"
import { type ProviderConfig, AuthProviders } from "@/lib/auth-providers"
import { signIn } from "@/lib/client"
import { motion, useAnimationControls } from "motion/react"
import Logo from "@/components/logo"
import { Globe, Lock, Sparkles, CheckCircle2, ArrowRight } from "lucide-react"

export default function SignInComponent() {
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const containerControls = useAnimationControls()
  const cardRef = useRef<HTMLDivElement>(null)

  const handleClick = async (provider: ProviderConfig) => {
    setActiveProvider(provider.id)
    // Animate button press
    containerControls.start({
      scale: [1, 0.98, 1],
      transition: { duration: 0.4 },
    })

    // Small delay before actual sign in
    setTimeout(() => {
      signIn.social({
        provider: provider.id as any,
        callbackURL: "/project/new",
      })
    }, 300)
  }

  // Parallax effect on card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5

    cardRef.current.style.transform = `
      perspective(1000px)
      rotateY(${x * 4}deg)
      rotateX(${-y * 4}deg)
    `
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = `
      perspective(1000px)
      rotateY(0deg)
      rotateX(0deg)
    `
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative transition-transform duration-200 ease-out"
      >
        {/* Card with layered effect */}
        <div className="absolute inset-0 rounded-3xl bg-black/5 backdrop-blur-3xl transform rotate-1 scale-[1.02] translate-x-1 translate-y-1" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-transparent backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]" />

        {/* Main card content */}
        <motion.div
          animate={containerControls}
          className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-8 z-10"
        >
       

          {/* Glass reflection */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl" />

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />
                <Logo />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold mb-2 tracking-tight">
                Welcome to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-sidebar-accent-foreground">
                  Project Vis
                </span>
              </h2>
              <p className="text-muted-foreground/90 text-sm max-w-xs mx-auto">
                Sign in to start creating beautiful visual projects
              </p>
            </motion.div>

            {/* Provider buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-3 mb-8"
            >
              {AuthProviders.map((provider, index) => (
                <motion.button
                  key={provider.id}
                  disabled={activeProvider !== null}
                  onClick={() => handleClick(provider)}
                  className={`
                    w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3
                    transition-all duration-300 relative overflow-hidden
                    ${activeProvider === provider.id ? "bg-primary/20" : "bg-white/5 hover:bg-white/10"}
                    border border-white/10 backdrop-blur-sm
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                >
                  {/* Button background animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%", opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Provider icon placeholder - replace with actual provider icons */}
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs text-primary">{provider.name.charAt(0)}</span>
                  </div>

                  <span className="font-medium text-sm">Continue with {provider.name}</span>

                  {activeProvider === provider.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-4"
                    >
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="grid grid-cols-3 gap-2 mb-6"
            >
              {[
                { icon: <Globe className="h-4 w-4 text-primary/80" />, text: "Global Access" },
                { icon: <Lock className="h-4 w-4 text-primary/80" />, text: "Secure Auth" },
                { icon: <Sparkles className="h-4 w-4 text-primary/80" />, text: "AI Features" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -3 }}
                >
                  <motion.div className="p-2 bg-primary/10 rounded-full mb-2" whileHover={{ scale: 1.1, rotate: 5 }}>
                    {feature.icon}
                  </motion.div>
                  <span className="text-xs text-muted-foreground/80">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Terms */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-3 w-3 text-primary/70" />
                <p className="text-xs text-muted-foreground/80 max-w-xs text-center">
                  By continuing, you agree to our{" "}
                  <motion.span className="text-primary cursor-pointer inline-flex items-center" whileHover={{ x: 2 }}>
                    Terms
                    <motion.span initial={{ opacity: 0, x: -5 }} whileHover={{ opacity: 1, x: 0 }}>
                      <ArrowRight className="h-2 w-2 ml-1" />
                    </motion.span>
                  </motion.span>{" "}
                  and{" "}
                  <motion.span className="text-primary cursor-pointer inline-flex items-center" whileHover={{ x: 2 }}>
                    Privacy
                    <motion.span initial={{ opacity: 0, x: -5 }} whileHover={{ opacity: 1, x: 0 }}>
                      <ArrowRight className="h-2 w-2 ml-1" />
                    </motion.span>
                  </motion.span>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
