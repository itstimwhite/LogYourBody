import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Splash = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'main'>('intro');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if we've already shown the splash screen
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    
    // If we've already shown splash this session, go directly to login
    if (hasShownSplash === 'true') {
      navigate("/login", { replace: true });
      return;
    }
    
    // Mark that we've shown the splash screen
    sessionStorage.setItem('hasShownSplash', 'true');
    
    // Show intro stage immediately
    const timer1 = setTimeout(() => {
      setShowContent(true);
    }, 300);

    // Transition to main stage
    const timer2 = setTimeout(() => {
      setStage('main');
    }, 2500);

    // Auto-navigate after 8 seconds if no interaction
    const timer3 = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  const handleSignUp = () => {
    navigate("/login?mode=signup", { replace: true });
  };

  const handleLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-black w-full h-screen relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col h-full">
        
        <AnimatePresence mode="wait">
          {/* Stage 1: Brand Introduction */}
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex-1 flex items-center justify-center px-6"
            >
              <div className="text-center max-w-2xl">
                <motion.h1 
                  className="text-white font-black text-5xl sm:text-6xl md:text-7xl leading-[0.85] tracking-[-0.02em] mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  TRACK YOUR BODY
                  <br />
                  <span className="text-white/70">WITH PRECISION</span>
                </motion.h1>
                
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="w-24 h-1 bg-white mx-auto"
                />
              </div>
            </motion.div>
          )}

          {/* Stage 2: Call to Action */}
          {stage === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex-1 flex flex-col justify-center px-6"
            >
              {/* Main content area */}
              <div className="flex-1 flex flex-col justify-center items-center text-center max-w-lg mx-auto">
                
                {/* Large number display */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.3 }}
                  className="mb-6"
                >
                  <div className="text-white font-black text-8xl sm:text-9xl leading-none tracking-tighter">
                   LYB
                  </div>
                  <div className="text-white/60 text-sm uppercase tracking-[0.3em] font-medium mt-2">
                    UNLOCK YOUR POTENTIAL
                  </div>
                </motion.div>

                {/* Tagline */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-white font-bold text-3xl sm:text-4xl leading-tight mb-8 tracking-[-0.01em]"
                >
                  Track your body with precision.
                </motion.h2>

                {/* Feature highlights */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-wrap justify-center gap-6 mb-12 text-white/70 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                    <span>Precision tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                    <span>Smart insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                    <span>Effortless monitoring</span>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons - fixed at bottom */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="pb-8 px-4"
              >
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                  {/* Primary CTA - Sign Up */}
                  <Button
                    onClick={handleSignUp}
                    className="h-14 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    Get Started
                  </Button>

                  {/* Secondary CTA - Login */}
                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    className="h-14 rounded-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-medium text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Sign In
                  </Button>
                </div>

                {/* Progress indicator */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="flex justify-center mt-8"
                >
                  <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1.5, duration: 6, ease: "linear" }}
                      className="h-full bg-white/60 rounded-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient light effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default Splash;