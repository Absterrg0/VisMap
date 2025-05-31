import { motion } from "motion/react"
import { ProviderConfig } from "@/lib/auth-providers"
import { Github, Twitter } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

export default function ProviderButton({ 
  provider, 
  onClick, 
  isActive 
}: { 
  provider: ProviderConfig; 
  onClick: () => void;
  isActive?: boolean;
}) {
  // Provider icons with consistent styling
  const getProviderIcon = (id: string) => {
    switch (id) {
      case "github":
        return <Github className="h-5 w-5" />
      case "google":
        return <FcGoogle className="h-5 w-5" />
      case "twitter":
        return <Twitter className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <motion.button
      disabled={isActive}
      onClick={onClick}
      className={`
        w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3
        transition-all duration-300 relative overflow-hidden
        ${isActive ? "bg-primary/20" : "bg-white/5 hover:bg-white/10"}
        border border-white/10 backdrop-blur-sm
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Button background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%", opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Provider icon */}
      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
        {getProviderIcon(provider.id)}
      </div>

      <span className="font-medium text-sm">Continue with {provider.name}</span>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-4"
        >
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.button>
  )
}