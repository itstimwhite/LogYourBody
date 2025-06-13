import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Splash = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Stage 1: Show headline immediately
    const timer1 = setTimeout(() => {
      setShowContent(true);
    }, 100);

    // Stage 1 to Stage 2 transition
    const timer2 = setTimeout(() => {
      setStage(2);
    }, 2500);

    // Auto-navigate to login after 4 seconds total
    const timer3 = setTimeout(() => {
      navigate("/login");
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  const handleSignUp = () => {
    navigate("/login?mode=signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="bg-black w-full h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Stage 1: Hero Headline */}
      {stage === 1 && (
        <div className="flex items-center justify-center h-full px-4 pt-safe pb-safe">
          <div className="text-center mt-[20vh]">
            <h1 
              className={`text-white font-black text-4xl sm:text-5xl md:text-6xl leading-tight text-center uppercase tracking-wide transition-opacity duration-1000 ease-out ${
                showContent ? 'opacity-100' : 'opacity-0'
              }`}
            >
              TRACK YOUR BODY WITH PRECISION
            </h1>
          </div>
        </div>
      )}

      {/* Stage 2: Number & Tagline */}
      {stage === 2 && (
        <div 
          className="flex flex-col items-center justify-center h-full px-4 pt-safe pb-safe transition-all duration-1000 ease-out opacity-0 translate-y-8"
          style={{
            animation: 'fadeInUp 1s ease-out forwards'
          }}
        >
          {/* Counter */}
          <div className="text-white font-black text-7xl sm:text-8xl md:text-9xl mb-2 tabular-nums">
            8
          </div>

          {/* Micro-headline */}
          <div className="text-white/75 text-sm uppercase tracking-[0.3em] font-medium mb-1">
            UNLOCK YOUR POTENTIAL
          </div>

          {/* Main Tagline */}
          <h2 className="text-white font-bold text-3xl sm:text-4xl md:text-5xl text-center leading-tight mb-8">
            Sleep fitness begins tonight
          </h2>

          {/* Buttons Row */}
          <div className="flex w-full max-w-md mx-auto space-x-4">
            {/* Sign Up Button */}
            <Button
              onClick={handleSignUp}
              className="flex-1 h-14 rounded-full bg-white/20 border border-white/50 backdrop-blur-sm hover:bg-white/30 hover:border-white/70 flex items-center justify-center text-white font-semibold text-lg tracking-wide transition-all duration-300"
            >
              Sign Up
            </Button>

            {/* Log In Button */}
            <Button
              onClick={handleLogin}
              className="flex-1 h-14 rounded-full bg-white shadow-lg hover:bg-gray-100 flex items-center justify-center text-black font-semibold text-lg tracking-wide transition-all duration-300"
            >
              Log In
            </Button>
          </div>
        </div>
      )}

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Splash;