import React, { Suspense } from "react";
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
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

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

const AppRoutes = () => (
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
                <Suspense fallback={<PageLoader />}>
                  {element}
                </Suspense>
              </ProfileGuard>
            </AuthGuard>
          } 
        />
      ))}
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <SEOHead />
      <AppRoutes />
    </BrowserRouter>
  </AppProviders>
);

export default App;
