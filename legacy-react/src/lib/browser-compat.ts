/**
 * Browser compatibility utilities
 * Handles common browser extension and environment issues
 */

// Detect browser extensions that might interfere with the app
export function detectBrowserExtensions(): string[] {
  const extensions: string[] = [];

  try {
    // Check for common extension globals
    if (typeof window !== "undefined") {
      // Check for Chrome extension content scripts
      if (document.querySelector('script[src*="extension://"]')) {
        extensions.push("Chrome Extension");
      }

      // Check for common extension-injected elements
      if (
        document.querySelector("[data-extension]") ||
        document.querySelector('[class*="extension"]')
      ) {
        extensions.push("Browser Extension");
      }

      // Check for specific extension patterns
      if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        extensions.push("React DevTools");
      }

      if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
        extensions.push("Redux DevTools");
      }
    }
  } catch (error) {
    console.debug("Extension detection failed:", error);
  }

  return extensions;
}

// Log browser environment for debugging
export function logBrowserEnvironment(): void {
  try {
    const userAgent = navigator.userAgent;
    const extensions = detectBrowserExtensions();

    console.group("🌐 Browser Environment");
    console.log("User Agent:", userAgent);
    console.log(
      "Extensions Detected:",
      extensions.length > 0 ? extensions : "None",
    );
    console.log("URL:", window.location.href);
    console.log("Protocol:", window.location.protocol);
    console.groupEnd();

    if (extensions.length > 0) {
      console.warn(
        "⚠️ Browser extensions detected. If you experience authentication issues, " +
          "try disabling extensions or using incognito mode.",
      );
    }
  } catch (error) {
    console.debug("Browser environment logging failed:", error);
  }
}

// Handle browser extension errors gracefully
export function setupBrowserExtensionErrorHandler(): void {
  if (typeof window === "undefined") return;

  const originalConsoleError = console.error;

  // Filter out common extension errors
  console.error = (...args: any[]) => {
    const message = args.join(" ");

    // Filter out known extension error patterns
    if (
      message.includes("injected.js") ||
      message.includes("extension://") ||
      message.includes("chrome-extension://") ||
      message.includes("moz-extension://") ||
      message.includes("hide-notification")
    ) {
      console.debug("🔇 Filtered browser extension error:", ...args);
      return;
    }

    // Log other errors normally
    originalConsoleError.apply(console, args);
  };

  // Handle unhandled errors
  window.addEventListener("error", (event) => {
    if (
      event.filename?.includes("injected.js") ||
      event.filename?.includes("extension://") ||
      event.message?.includes("hide-notification")
    ) {
      console.debug(
        "🔇 Filtered browser extension error event:",
        event.message,
      );
      event.preventDefault();
      return false;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (
      typeof reason === "string" &&
      (reason.includes("extension://") ||
        reason.includes("injected.js") ||
        reason.includes("hide-notification"))
    ) {
      console.debug("🔇 Filtered browser extension promise rejection:", reason);
      event.preventDefault();
      return false;
    }
  });
}
