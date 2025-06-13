import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { ProfileGuard } from "@/components/ProfileGuard";
import { SEOHead } from "@/components/SEOHead";
import { VercelAnalytics } from "@/components/Analytics";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { serviceWorkerManager } from "@/lib/service-worker-manager";
import { RouteGuard } from "@/components/RouteGuard";
import { AuthDebugger } from "@/components/AuthDebugger";

// Lazy load pages for better code splitting
const Index = React.lazy(() => import("./pages/Index"));
const Splash = React.lazy(() => import("./pages/Splash"));
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Subscription = React.lazy(() => import("./pages/Subscription"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Changelog = React.lazy(() => import("./pages/Changelog"));
const HealthKitTest = React.lazy(() => import("./pages/HealthKitTest"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Never refetch automatically
      gcTime: 24 * 60 * 60 * 1000, // Keep cache for 24 hours
      retry: (failureCount, error) => {
        // Don't retry on network errors that suggest offline status
        if (
          error instanceof Error &&
          (error.message.includes("NetworkError") ||
            error.message.includes("Failed to fetch"))
        ) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const publicRoutes = [
  { path: "/", element: <Index /> },
  { path: "/splash", element: <Splash /> },
  { path: "/login", element: <Login /> },
  { path: "/terms", element: <Terms /> },
  { path: "/privacy", element: <Privacy /> },
  { path: "/changelog", element: <Changelog /> },
];

const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/settings", element: <Settings /> },
  { path: "/subscription", element: <Subscription /> },
  { path: "/healthkit-test", element: <HealthKitTest /> },
];

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
        <VercelAnalytics />
        <PerformanceMonitor />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

const AppRoutes = () => {
  console.log("AppRoutes rendering, current path:", window.location.pathname);

  return (
    <RouteGuard>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <AuthGuard>
                  <ProfileGuard>
                    <Suspense fallback={<PageLoader />}>{element}</Suspense>
                  </ProfileGuard>
                </AuthGuard>
              }
            />
          ))}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          {/* Fallback for invalid URLs - redirect to home */}
          <Route path="/404" element={<NotFound />} />
          <Route path="/unknown" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteGuard>
  );
};

const App = () => {
  useEffect(() => {
    // Handle service worker based on platform
    const handleServiceWorkerIssues = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          // On native platforms, completely disable service workers
          console.log("Native platform detected - disabling service workers");
          await serviceWorkerManager.disableOnNative();
        } else {
          // On web platforms, check and cleanup as usual
          serviceWorkerManager.trackRedirect();
          await serviceWorkerManager.checkAndCleanup();
        }
      } catch (error) {
        console.warn("Error handling service worker issues:", error);
      }
    };

    // Run SW handling immediately
    handleServiceWorkerIssues();

    // Clear any stale auth state on app startup (fresh builds) - ONLY on native platforms
    if (Capacitor.isNativePlatform()) {
      // Clear Capacitor storage to prevent stale sessions
      const clearStaleAuth = async () => {
        try {
          // Check if this is a fresh launch by looking for a launch flag
          const launchKey =
            "app_launched_" + new Date().toISOString().split("T")[0];
          const hasLaunched = localStorage.getItem(launchKey);

          if (!hasLaunched) {
            console.log(
              "Fresh app launch detected, clearing potential stale auth...",
            );
            // Clear all auth-related storage
            const authKeys = ["supabase.auth.token", "sb-auth-token"];
            authKeys.forEach((key) => {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
            });

            // Set launch flag
            localStorage.setItem(launchKey, "true");

            // Clean up old launch flags (keep only today's)
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith("app_launched_") && key !== launchKey) {
                localStorage.removeItem(key);
              }
            });
          }
        } catch (error) {
          console.warn("Error clearing stale auth:", error);
        }
      };

      clearStaleAuth();
    }

    // Don't hide splash screen here - let the routing components handle it
    // This prevents multiple hide attempts and conflicts
  }, []); // Empty deps - runs once

  return (
    <AppProviders>
      <BrowserRouter>
        <SEOHead />
        <AppRoutes />
        <AuthDebugger />
      </BrowserRouter>
    </AppProviders>
  );
};

export default App;
