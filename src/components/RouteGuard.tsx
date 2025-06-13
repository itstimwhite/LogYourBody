import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { serviceWorkerManager } from '@/lib/service-worker-manager';

interface RouteGuardProps {
  children: React.ReactNode;
  redirectTimeout?: number;
  fallbackRoute?: string;
}

export function RouteGuard({ 
  children, 
  redirectTimeout = 2000,
  fallbackRoute = '/dashboard'
}: RouteGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTime = useRef(Date.now());

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
            toast.error('Loading issue detected', {
              description: 'Cleaning up app cache and refreshing...',
            });
            serviceWorkerManager.checkAndCleanup();
            return;
          }

          // Show timeout UI if not a SW issue
          toast.error('Still loading…', {
            description: 'The page is taking longer than expected to load.',
            action: {
              label: 'Go to Dashboard',
              onClick: () => {
                navigate(fallbackRoute, { replace: true });
              },
            },
          });
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
    const redirectLoopKey = 'route_redirects';
    const now = Date.now();
    const stored = sessionStorage.getItem(redirectLoopKey);
    
    let redirectHistory: { path: string; timestamp: number }[] = [];
    
    if (stored) {
      try {
        redirectHistory = JSON.parse(stored);
        // Clean old entries (older than 5 seconds)
        redirectHistory = redirectHistory.filter(entry => now - entry.timestamp < 5000);
      } catch {
        redirectHistory = [];
      }
    }

    // Add current redirect
    redirectHistory.push({ path: location.pathname, timestamp: now });

    // Check for loops (same path visited 3+ times in 5 seconds)
    const pathCounts = redirectHistory.reduce((acc, entry) => {
      acc[entry.path] = (acc[entry.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hasLoop = Object.values(pathCounts).some(count => count >= 3);
    
    if (hasLoop) {
      console.warn('Redirect loop detected, clearing session and redirecting to home');
      sessionStorage.clear();
      serviceWorkerManager.trackRedirect();
      navigate('/', { replace: true });
      return;
    }

    // Store updated history
    sessionStorage.setItem(redirectLoopKey, JSON.stringify(redirectHistory));
  }, [location.pathname, navigate]);

  return (
    <>
      {children}
      {showTimeout && (
        <div className="fixed bottom-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-yellow-800">Still loading...</span>
          </div>
        </div>
      )}
    </>
  );
}