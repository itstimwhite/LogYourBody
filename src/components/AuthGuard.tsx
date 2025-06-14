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
  const [navigationInitiated, setNavigationInitiated] = React.useState(false);

  useEffect(() => {
    // Prevent multiple navigation attempts
    if (navigationInitiated) return;
    
    // Still loading - don't navigate
    if (loading) return;
    
    // User exists - don't navigate
    if (user) return;

    // No user and loading complete - navigate to home
    console.log("AuthGuard: No user found, redirecting to home");
    setNavigationInitiated(true);
    navigate("/", { replace: true });
  }, [user, loading, navigate, navigationInitiated]);

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
