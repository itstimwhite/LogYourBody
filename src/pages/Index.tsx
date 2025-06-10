import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingPage } from "@/components/LandingPage";
import { useResponsive } from "@/hooks/use-responsive";
import { useAuth } from "@/contexts/AuthContext";
import Splash from "./Splash";

const Index = () => {
  const { isMobile } = useResponsive();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!loading && user && !isRedirecting) {
      console.log("Authenticated user detected on homepage, redirecting to dashboard");
      setIsRedirecting(true);
      // Add a small delay to prevent redirect loops during OAuth flows
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate, isRedirecting]);

  // Show loading while checking authentication or redirecting
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{isRedirecting ? "Redirecting..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render anything (will redirect)
  if (user) {
    return null;
  }

  // Show landing page for tablet/desktop, splash for mobile
  return isMobile ? <Splash /> : <LandingPage />;
};

export default Index;
