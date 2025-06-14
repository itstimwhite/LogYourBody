import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingPage } from "@/components/LandingPage";
import { useResponsive } from "@/hooks/use-responsive";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";
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

  // Remove the fallback timeout - let AuthContext handle timeouts
  // This prevents conflicting navigation attempts

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    console.log("Index: auth state", {
      loading,
      hasUser: !!user,
      isRedirecting,
      currentPath: window.location.pathname,
      search: window.location.search,
    });

    // Check if this is an OAuth redirect (has URL params that indicate OAuth flow)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams =
      urlParams.has("access_token") ||
      urlParams.has("refresh_token") ||
      urlParams.has("code");

    if (!loading && user && !isRedirecting) {
      console.log("Index: Authenticated user detected on homepage", {
        hasOAuthParams,
      });

      if (hasOAuthParams) {
        console.log(
          "Index: OAuth redirect detected, clearing URL params and redirecting to dashboard",
        );
        // Clear OAuth params from URL before redirecting
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }

      setIsRedirecting(true);
      // Navigate immediately without delay
      navigate("/dashboard", { replace: true });
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

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // For native platforms, don't render content (will redirect to splash)
  if (Capacitor.isNativePlatform()) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for web users
  return <LandingPage />;
};

export default Index;
