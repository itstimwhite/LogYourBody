import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-center items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 text-center">
        {/* Hero Text */}
        <div className="max-w-4xl mx-auto mb-20">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter text-center">
            TRACK
            <br />
            YOUR
            <br />
            BODY
            <br />
            WITH
            <br />
            PRECISION
          </h1>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="w-full px-6 pb-16">
        <Button
          onClick={handleGetStarted}
          className="w-full h-20 bg-white text-black hover:bg-white/90 rounded-full text-2xl font-black tracking-wide flex items-center justify-center gap-4 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          NEXT
          <div className="flex">
            <ChevronRight className="h-7 w-7" />
            <ChevronRight className="h-7 w-7 -ml-2" />
          </div>
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="w-20 h-1 bg-white/40 rounded-full">
          <div className="w-5 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
