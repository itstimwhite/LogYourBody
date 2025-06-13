import { useState, useEffect } from "react";

interface PWAUpdateState {
  updateAvailable: boolean;
  isUpdating: boolean;
  promptInstall: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function usePWAUpdate() {
  const [state, setState] = useState<PWAUpdateState>({
    updateAvailable: false,
    isUpdating: false,
    promptInstall: false,
    registration: null,
  });

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register service worker and handle updates
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          setState((prev) => ({ ...prev, registration }));

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setState((prev) => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });
        }
      });

      // Listen for controller changes (when update is applied)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SKIP_WAITING") {
          setState((prev) => ({ ...prev, updateAvailable: true }));
        }
      });
    }

    // Listen for beforeinstallprompt event (PWA install)
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setState((prev) => ({ ...prev, promptInstall: true }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const applyUpdate = async () => {
    setState((prev) => ({ ...prev, isUpdating: true }));

    try {
      if (state.registration?.waiting) {
        // Tell the waiting SW to skip waiting
        state.registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      // Clear all caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }

      // Force reload after a short delay to allow SW to take control
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error applying update:", error);
      window.location.reload();
    }
  };

  const checkForUpdate = async () => {
    if (state.registration) {
      try {
        await state.registration.update();
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    }
  };

  const installPWA = async () => {
    // This would use the deferred prompt to trigger PWA install
    // Implementation depends on how PWAInstallPrompt handles this
    setState((prev) => ({ ...prev, promptInstall: false }));
  };

  const dismissUpdate = () => {
    setState((prev) => ({ ...prev, updateAvailable: false }));
  };

  const dismissInstall = () => {
    setState((prev) => ({ ...prev, promptInstall: false }));
  };

  return {
    ...state,
    applyUpdate,
    checkForUpdate,
    installPWA,
    dismissUpdate,
    dismissInstall,
  };
}
