import React from "react";
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
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const publicRoutes = [
  { path: "/", element: <Index /> },
  { path: "/splash", element: <Splash /> },
  { path: "/login", element: <Login /> },
  { path: "/terms", element: <Terms /> },
  { path: "/privacy", element: <Privacy /> },
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
              {element}
            </ProfileGuard>
          </AuthGuard>
        } 
      />
    ))}
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
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
