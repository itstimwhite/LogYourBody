import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

interface ServiceWorkerState {
  isStale: boolean;
  hasRedirectLoop: boolean;
  unregistrationInProgress: boolean;
  isNativePlatform: boolean;
}

class ServiceWorkerManager {
  private state: ServiceWorkerState = {
    isStale: false,
    hasRedirectLoop: false,
    unregistrationInProgress: false,
    isNativePlatform: Capacitor.isNativePlatform(),
  };

  private redirectLoopDetector: {
    count: number;
    startTime: number;
    threshold: number;
  } = {
    count: 0,
    startTime: Date.now(),
    threshold: 20, // Increased from 3 to 20 - only trigger on severe loops
  };

  public async disableOnNative(): Promise<void> {
    if (!this.state.isNativePlatform) {
      return;
    }

    console.log("Native platform detected - disabling all service workers");

    try {
      // Unregister all existing service workers immediately
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const unregistrationPromises = registrations.map(
          async (registration) => {
            console.log(
              "Unregistering SW on native platform:",
              registration.scope,
            );
            return registration.unregister();
          },
        );

        await Promise.all(unregistrationPromises);
        console.log(
          `Unregistered ${registrations.length} service workers on native platform`,
        );
      }

      // Clear all caches to prevent stale data issues
      await this.clearAllCaches();
    } catch (error) {
      console.error(
        "Error disabling service worker on native platform:",
        error,
      );
    }
  }

  public async detectStaleServiceWorker(): Promise<boolean> {
    // Skip SW detection entirely on native platforms
    if (this.state.isNativePlatform) {
      return false;
    }

    if (!("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return false;
      }

      // Check if SW is waiting to activate (new version available)
      if (registration.waiting) {
        this.state.isStale = true;
        console.warn("Stale service worker detected - new version waiting");
        return true;
      }

      // Check if SW is installing
      if (registration.installing) {
        this.state.isStale = true;
        console.warn("Service worker installing - potential version conflict");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error detecting stale service worker:", error);
      return false;
    }
  }

  public trackRedirect(): void {
    const now = Date.now();

    // Reset counter if too much time has passed
    if (now - this.redirectLoopDetector.startTime > 10000) { // Increased from 2s to 10s
      this.redirectLoopDetector.count = 0;
      this.redirectLoopDetector.startTime = now;
    }

    this.redirectLoopDetector.count++;

    if (
      this.redirectLoopDetector.count >= this.redirectLoopDetector.threshold
    ) {
      this.state.hasRedirectLoop = true;
      console.error("Redirect loop detected - triggering SW cleanup");
      this.handleRedirectLoop();
    }
  }

  private async handleRedirectLoop(): Promise<void> {
    if (this.state.unregistrationInProgress) {
      return;
    }

    this.state.unregistrationInProgress = true;

    try {
      await this.unregisterServiceWorker();

      // Clear all caches to ensure fresh start
      await this.clearAllCaches();

      // Show user-friendly message
      toast.error("App reset completed", {
        description:
          "The app has been reset to fix loading issues. Refreshing...",
      });

      // Instead of forcing reload, just notify the user
      // Removed automatic reload to prevent infinite loops
    } catch (error) {
      console.error("Error handling redirect loop:", error);
      this.state.unregistrationInProgress = false;
    }
  }

  public async unregisterServiceWorker(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();

      const unregistrationPromises = registrations.map(async (registration) => {
        console.log("Unregistering service worker:", registration.scope);
        return registration.unregister();
      });

      const results = await Promise.all(unregistrationPromises);
      const allUnregistered = results.every((result) => result === true);

      if (allUnregistered) {
        console.log("All service workers unregistered successfully");
        this.state.isStale = false;
        this.state.hasRedirectLoop = false;
      }

      return allUnregistered;
    } catch (error) {
      console.error("Error unregistering service workers:", error);
      return false;
    }
  }

  private async clearAllCaches(): Promise<void> {
    if (!("caches" in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const deletionPromises = cacheNames.map((cacheName) => {
        console.log("Deleting cache:", cacheName);
        return caches.delete(cacheName);
      });

      await Promise.all(deletionPromises);
      console.log("All caches cleared");
    } catch (error) {
      console.error("Error clearing caches:", error);
    }
  }

  public async checkAndCleanup(): Promise<void> {
    // On native platforms, always disable service workers
    if (this.state.isNativePlatform) {
      await this.disableOnNative();
      return;
    }

    const isStale = await this.detectStaleServiceWorker();

    if (isStale || this.state.hasRedirectLoop) {
      console.log("Cleaning up stale service worker and caches...");
      await this.unregisterServiceWorker();
      await this.clearAllCaches();
    }
  }

  public getState(): ServiceWorkerState {
    return { ...this.state };
  }

  public async skipWaiting(): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });

        // Listen for the new SW to take control
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("New service worker activated");
          // Notify user instead of automatic reload
          toast.success("App updated", {
            description: "A new version is ready. Please refresh when convenient.",
          });
        });
      }
    } catch (error) {
      console.error("Error skipping waiting service worker:", error);
    }
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();
