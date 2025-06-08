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
        <div className="max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight">
            TRACK
            <br />
            YOUR
            <br />
            BODY
            <br />
            WITH
            <br />
            <span className="text-primary">PRECISION</span>
          </h1>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="w-full px-6 pb-12">
        <Button
          onClick={handleGetStarted}
          className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-full text-xl font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
        >
          GET STARTED
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="w-16 h-1 bg-white/30 rounded-full">
          <div className="w-4 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
