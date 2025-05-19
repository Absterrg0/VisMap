import SignInComponent from "@/components/signin-form"

// Main Page Component
export default function Home() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90">
      
      <div className="absolute inset-0">
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-80" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 blur-3xl" />
      </div>
      

      
      <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-1/3 h-64 bg-gradient-to-t from-accent/10 to-transparent blur-3xl opacity-20" />
      
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--primary) 1px, transparent 1px),
                           linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />


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
                <SignInComponent />

          </div>
        </div>
      </div>
    </div>
  )
}