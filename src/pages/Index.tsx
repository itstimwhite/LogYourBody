import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingPage } from "@/components/LandingPage";
import { useResponsive } from "@/hooks/use-responsive";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from '@capacitor/core';
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";

const Index = () => {
  const { isMobile } = useResponsive();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [forceRedirect, setForceRedirect] = useState(false);

  // Add swipe navigation to go to login
  useSwipeNavigation({
    onSwipeLeft: () => navigate("/login"),
    threshold: 100,
  });

  // Fallback timeout to prevent hanging
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (loading && !forceRedirect) {
        console.warn("Auth loading timeout - forcing redirect to splash");
        setForceRedirect(true);
        if (Capacitor.isNativePlatform()) {
          navigate("/splash", { replace: true });
        }
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(fallbackTimer);
  }, [loading, forceRedirect, navigate]);

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

  useEffect(() => {
    // For native iOS, automatically navigate to splash after a short delay
    if (Capacitor.isNativePlatform() && !loading && !user && !isRedirecting) {
      console.log("Native platform detected, navigating to splash");
      const timer = setTimeout(() => {
        navigate("/splash", { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, user, navigate, isRedirecting]);

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

  // For native platforms, don't render content (will redirect to splash)
  if (Capacitor.isNativePlatform()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for web users
  return <LandingPage />;
};

export default Index;
