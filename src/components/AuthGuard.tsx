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
    const hasOAuthParams =
      urlParams.has("access_token") ||
      urlParams.has("refresh_token") ||
      urlParams.has("code");

    console.log("AuthGuard: state check", {
      loading,
      hasUser: !!user,
      currentPath: window.location.pathname,
      hasOAuthParams,
    });

    // Don't redirect immediately - give auth time to load
    if (!loading && !user && !hasOAuthParams) {
      // Add a small delay before redirecting to prevent rapid redirects
      const redirectTimer = setTimeout(() => {
        if (!user) {
          console.log(
            "AuthGuard: redirecting to home - no user found and not OAuth flow",
          );
          navigate("/");
        }
      }, 500); // 500ms delay to allow auth to settle
      return () => clearTimeout(redirectTimer);
    } else if (!loading && !user && hasOAuthParams) {
      console.log(
        "AuthGuard: OAuth params detected, waiting for auth to complete...",
      );
      // Give auth more time to process OAuth redirect
      const timer = setTimeout(() => {
        if (!user) {
          console.log(
            "AuthGuard: OAuth processing timeout, redirecting to home",
          );
          navigate("/");
        }
      }, 10000); // 10 second grace period for OAuth processing
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
