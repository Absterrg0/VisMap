export default function Logo(props: { className?: string }) { 
    return (
     
    <div className={`relative ${props.className}`}>
    <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-accent/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
      <div className="w-7 h-7 bg-gradient-to-br from-primary/40 to-sidebar-accent-foreground/90 rounded-lg transform rotate-12">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-white/30 rounded-md blur-sm"></div>
      </div>
    </div>
    {/* Light reflection */}
    <div className="absolute top-2 left-2 w-4 h-1 bg-radial from-white/40 to-sidebar-accent-foreground rounded-full transform rotate-45 blur-sm"></div>
  </div>   
    )
}