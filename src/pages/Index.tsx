import React from "react";
import { LandingPage } from "@/components/LandingPage";
import { useResponsive } from "@/hooks/use-responsive";
import Splash from "./Splash";

const Index = () => {
  const { isMobile } = useResponsive();

  // Show landing page for tablet/desktop, splash for mobile
  return isMobile ? <Splash /> : <LandingPage />;
};

export default Index;
