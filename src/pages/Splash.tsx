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
      className="h-screen w-full relative flex flex-col overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        {/* Hero Text */}
        <div className="text-center max-w-4xl w-full">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-[0.85] tracking-tighter">
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

      {/* Bottom Section */}
      <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 pb-8 sm:pb-12">
        {/* Call to Action Button */}
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleGetStarted}
            className="w-full h-14 sm:h-16 lg:h-20 bg-white text-black hover:bg-white/90 rounded-full text-lg sm:text-xl lg:text-2xl font-black tracking-wide flex items-center justify-center gap-3 lg:gap-4 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            NEXT
            <div className="flex">
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 -ml-1.5 sm:-ml-2" />
            </div>
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="w-16 sm:w-20 h-1 bg-white/40 rounded-full">
            <div className="w-4 sm:w-5 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
