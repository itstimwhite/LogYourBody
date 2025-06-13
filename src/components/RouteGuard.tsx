import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { serviceWorkerManager } from "@/lib/service-worker-manager";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { useSplashScreen } from "@/hooks/use-splash-screen";

interface RouteGuardProps {
  children: React.ReactNode;
  redirectTimeout?: number;
  fallbackRoute?: string;
}

export function RouteGuard({
  children,
  redirectTimeout = 5000, // Increased to 5 seconds
  fallbackRoute = "/", // Changed to home instead of dashboard
}: RouteGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTime = useRef(Date.now());
  const { hideSplashScreen } = useSplashScreen();

  useEffect(() => {
    // Reset loading state on route change
    setIsLoading(true);
    setShowTimeout(false);
    loadingStartTime.current = Date.now();

    // Set up timeout for loading states
    timeoutRef.current = setTimeout(() => {
      const loadingDuration = Date.now() - loadingStartTime.current;

      if (loadingDuration > redirectTimeout) {
        setShowTimeout(true);

        // Check if this might be a service worker issue
        serviceWorkerManager.detectStaleServiceWorker().then((isStale) => {
          if (isStale) {
            toast.error("Loading issue detected", {
              description: "Cleaning up app cache and refreshing...",
            });
            serviceWorkerManager.checkAndCleanup();
            return;
          }

          // Show timeout UI and force navigation
          console.warn(
            "RouteGuard timeout - forcing navigation and hiding splash",
          );

          // Force hide splash screen if stuck
          if (Capacitor.isNativePlatform()) {
            hideSplashScreen();
          }

          toast.error("Loading timeout - redirecting", {
            description: "Redirecting to home due to loading timeout.",
          });

          // Force navigation to fallback route (home)
          setTimeout(() => {
            navigate(fallbackRoute, { replace: true });
          }, 1000);
        });
      }
    }, redirectTimeout);

    // Clean up loading state after a brief delay
    const loadingCleanup = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearTimeout(loadingCleanup);
    };
  }, [location.pathname, navigate, redirectTimeout, fallbackRoute]);

  // Detect potential redirect loops
  useEffect(() => {
    // Skip redirect loop detection during OAuth flows
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams =
      urlParams.has("access_token") ||
      urlParams.has("refresh_token") ||
      urlParams.has("code") ||
      urlParams.has("state");

    if (hasOAuthParams) {
      console.log("RouteGuard: Skipping redirect loop detection - OAuth flow detected");
      return;
    }

    const redirectLoopKey = "route_redirects";
    const now = Date.now();
    const stored = sessionStorage.getItem(redirectLoopKey);

    let redirectHistory: { path: string; timestamp: number }[] = [];

    if (stored) {
      try {
        redirectHistory = JSON.parse(stored);
        // Clean old entries (older than 10 seconds for more tolerance)
        redirectHistory = redirectHistory.filter(
          (entry) => now - entry.timestamp < 10000,
        );
      } catch {
        redirectHistory = [];
      }
    }

    // Add current redirect
    redirectHistory.push({ path: location.pathname, timestamp: now });

    // Check for loops (same path visited 12+ times in 10 seconds) - very tolerant threshold
    const pathCounts = redirectHistory.reduce(
      (acc, entry) => {
        acc[entry.path] = (acc[entry.path] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const hasLoop = Object.values(pathCounts).some((count) => count >= 12);

    // Add detailed logging for redirect tracking
    if (Object.values(pathCounts).some((count) => count >= 6)) {
      console.warn("RouteGuard: Potential redirect loop detected", {
        pathCounts,
        currentPath: location.pathname,
        hasOAuthParams,
      });
    }

    if (hasLoop) {
      console.warn(
        "Redirect loop detected, clearing session and redirecting to home",
      );
      sessionStorage.clear();
      serviceWorkerManager.trackRedirect();
      navigate("/", { replace: true });
      return;
    }

    // Store updated history
    sessionStorage.setItem(redirectLoopKey, JSON.stringify(redirectHistory));
  }, [location.pathname, navigate]);

  return (
    <>
      {children}
      {showTimeout && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
            <span className="text-sm text-yellow-800">Still loading...</span>
          </div>
        </div>
      )}
    </>
  );
}
