import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('access_token') || urlParams.has('refresh_token') || urlParams.has('code');
    
    console.log('AuthGuard: state check', { 
      loading, 
      hasUser: !!user, 
      currentPath: window.location.pathname,
      hasOAuthParams
    });
    
    // Don't redirect if we're in the middle of an OAuth flow
    if (!loading && !user && !hasOAuthParams) {
      console.log('AuthGuard: redirecting to home - no user found and not OAuth flow');
      navigate("/");
    } else if (!loading && !user && hasOAuthParams) {
      console.log('AuthGuard: OAuth params detected, waiting for auth to complete...');
      // Give auth more time to process OAuth redirect
      const timer = setTimeout(() => {
        if (!user) {
          console.log('AuthGuard: OAuth processing timeout, redirecting to home');
          navigate("/");
        }
      }, 3000); // 3 second grace period for OAuth processing
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
