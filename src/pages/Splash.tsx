import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Splash = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"intro" | "main">("intro");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if we've already shown the splash screen
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");

    // If we've already shown splash this session, go directly to login
    if (hasShownSplash === "true") {
      navigate("/login", { replace: true });
      return;
    }

    // Mark that we've shown the splash screen
    sessionStorage.setItem("hasShownSplash", "true");

    // Show intro stage immediately
    const timer1 = setTimeout(() => {
      setShowContent(true);
    }, 300);

    // Transition to main stage
    const timer2 = setTimeout(() => {
      setStage("main");
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
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 flex h-full flex-col">
        <AnimatePresence mode="wait">
         

          {/* Stage 2: Call to Action */}
          {stage === "main" && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-1 flex-col justify-center px-6"
            >
              {/* Main content area */}
              <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center text-center">
                {/* Large number display */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.8,
                    type: "spring",
                    bounce: 0.3,
                  }}
                  className="mb-6"
                >
                  <div className="text-8xl font-black leading-none tracking-tighter text-white sm:text-9xl">
                    LYB
                  </div>
                  <div className="mt-2 text-sm font-medium uppercase tracking-[0.3em] text-white/60">
                    UNLOCK YOUR POTENTIAL
                  </div>
                </motion.div>

                {/* Tagline */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mb-8 text-3xl font-bold leading-tight tracking-[-0.01em] text-white sm:text-4xl"
                >
                  Track your body with precision.
                </motion.h2>

                {/* Feature highlights */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="mb-12 flex flex-wrap justify-center gap-6 text-sm text-white/70"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-white/50" />
                    <span>Precision tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-white/50" />
                    <span>Smart insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-white/50" />
                    <span>Effortless monitoring</span>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons - fixed at bottom */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="px-4 pb-8"
              >
                <div className="mx-auto flex max-w-sm flex-col gap-4">
                  {/* Primary CTA - Sign Up */}
                  <Button
                    onClick={handleSignUp}
                    className="h-14 rounded-full bg-white text-lg font-semibold tracking-wide text-black shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
                  >
                    Get Started
                  </Button>

                  {/* Secondary CTA - Login */}
                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    className="h-14 rounded-full border-white/30 bg-transparent text-lg font-medium tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:border-white/50 hover:bg-white/10 active:scale-[0.98]"
                  >
                    Sign In
                  </Button>
                </div>

                {/* Progress indicator */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="mt-8 flex justify-center"
                >
                  <div className="h-1 w-20 overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1.5, duration: 6, ease: "linear" }}
                      className="h-full rounded-full bg-white/60"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient light effect */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white/5 blur-3xl" />
    </div>
  );
};

export default Splash;
