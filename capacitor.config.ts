import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.logyourbody.app",
  appName: "LogYourBody",
  webDir: "dist",
  server: {
    url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:8080"
        : undefined,
    cleartext: true,
  },
  ios: {
    scheme: "App",
    contentInset: "automatic",
    scrollEnabled: true,
    backgroundColor: "#000000", // Black background
    orientation: "portrait",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // Show immediately, no minimum duration
      launchAutoHide: false, // Let the app control when to hide
      backgroundColor: "#000000", // Black background
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      fadeInDuration: 0, // No fade in
      fadeOutDuration: 200, // Quick fade out
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#000000",
    },
  },
};

export default config;
