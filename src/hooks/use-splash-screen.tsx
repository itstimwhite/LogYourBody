import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

export function useSplashScreen() {
  const location = useLocation();
  const splashHiddenRef = useRef(false);

  const hideSplashScreen = async () => {
    if (!Capacitor.isNativePlatform() || splashHiddenRef.current) {
      return;
    }

    try {
      console.log('Hiding splash screen on navigation to:', location.pathname);
      await SplashScreen.hide();
      splashHiddenRef.current = true;
      console.log('Splash screen hidden successfully');
    } catch (error) {
      console.warn('Error hiding splash screen:', error);
    }
  };

  useEffect(() => {
    // Hide splash on successful navigation to any authenticated route
    const authenticatedRoutes = ['/dashboard', '/settings', '/subscription'];
    const isAuthenticatedRoute = authenticatedRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    if (isAuthenticatedRoute) {
      console.log('Authenticated route detected, hiding splash screen');
      hideSplashScreen();
    }
  }, [location.pathname]);

  return { hideSplashScreen };
}