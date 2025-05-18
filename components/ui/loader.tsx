'use client'
import { motion } from "motion/react"

export default function Loader() {
    return (
    <div className="relative">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* Glass outer ring */}
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg" />
        
        {/* Spinning inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-16 w-16 rounded-full border-t-2 border-r-2 border-primary/80" />
        </motion.div>
        
        {/* Glowing center */}
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-6 w-6 rounded-full bg-primary/30 blur-sm" />
          <div className="absolute h-4 w-4 rounded-full bg-primary/70" />
        </motion.div>
        
        {/* Subtle reflection */}
        <div className="absolute top-1 left-1/4 w-1/2 h-1 bg-white/20 rounded-full blur-sm" />
      </motion.div>
      
      {/* Subtle shadow beneath */}
      <div className="absolute -bottom-4 left-0 right-0 h-4 bg-primary/10 rounded-full blur-md mx-auto w-10" />
    </div>
  )
}