import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  setupBrowserExtensionErrorHandler,
  logBrowserEnvironment,
} from "./lib/browser-compat";
import { Capacitor } from "@capacitor/core";

// Setup browser extension error handling - defer to avoid blocking
setTimeout(() => {
  setupBrowserExtensionErrorHandler();

  // Log browser environment for debugging
  if (process.env.NODE_ENV === "development") {
    logBrowserEnvironment();
  }
}, 0);

// Register service worker for PWA functionality on web only - defer to avoid blocking
if ("serviceWorker" in navigator && !Capacitor.isNativePlatform()) {
  // Use requestIdleCallback to defer SW registration
  const registerSW = () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(registerSW, { timeout: 5000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(registerSW, 1000);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
