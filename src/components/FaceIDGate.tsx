import React, { useEffect, useState } from "react";
import { isNativeiOS } from "@/lib/platform";

interface FaceIDGateProps {
  children: React.ReactNode;
}

export function FaceIDGate({ children }: FaceIDGateProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      if (!isNativeiOS()) {
        setAuthenticated(true);
        return;
      }

      const enabled = localStorage.getItem("faceid_lock_enabled") === "true";
      if (!enabled) {
        setAuthenticated(true);
        return;
      }

      try {
        const { BiometricAuth } = (window as any).Capacitor?.Plugins || {};
        if (BiometricAuth) {
          const result = await BiometricAuth.authenticate({
            reason: "Unlock LogYourBody with Face ID",
            title: "Face ID Required",
            subtitle: "Unlock LogYourBody",
            description: "Authenticate to access your data",
          });
          if (result?.isAuthenticated) {
            setAuthenticated(true);
          } else {
            setError("Face ID authentication failed");
          }
        } else {
          // No plugin - allow access
          setAuthenticated(true);
        }
      } catch (err) {
        console.warn("Face ID authentication error", err);
        setError("Authentication failed");
      }
    };

    authenticate();
  }, []);

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
