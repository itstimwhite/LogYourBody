import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.logyourbody.app',
  appName: 'LogYourBody',
  webDir: 'dist',
  server: {
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : undefined,
    cleartext: true
  },
  ios: {
    scheme: 'App',
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#0073ff', // Match splash screen background
    orientation: 'portrait'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // Show immediately, no minimum duration
      launchAutoHide: false, // Let the app control when to hide
      backgroundColor: '#0073ff', // Blue background to match icon
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
      fadeInDuration: 0, // No fade in
      fadeOutDuration: 200 // Quick fade out
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    }
  }
};

export default config;
