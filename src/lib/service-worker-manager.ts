import { toast } from 'sonner';

interface ServiceWorkerState {
  isStale: boolean;
  hasRedirectLoop: boolean;
  unregistrationInProgress: boolean;
}

class ServiceWorkerManager {
  private state: ServiceWorkerState = {
    isStale: false,
    hasRedirectLoop: false,
    unregistrationInProgress: false,
  };

  private redirectLoopDetector: {
    count: number;
    startTime: number;
    threshold: number;
  } = {
    count: 0,
    startTime: Date.now(),
    threshold: 3, // Max redirects in 2 seconds
  };

  public async detectStaleServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
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
        console.warn('Stale service worker detected - new version waiting');
        return true;
      }

      // Check if SW is installing
      if (registration.installing) {
        this.state.isStale = true;
        console.warn('Service worker installing - potential version conflict');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error detecting stale service worker:', error);
      return false;
    }
  }

  public trackRedirect(): void {
    const now = Date.now();
    
    // Reset counter if too much time has passed
    if (now - this.redirectLoopDetector.startTime > 2000) {
      this.redirectLoopDetector.count = 0;
      this.redirectLoopDetector.startTime = now;
    }

    this.redirectLoopDetector.count++;

    if (this.redirectLoopDetector.count >= this.redirectLoopDetector.threshold) {
      this.state.hasRedirectLoop = true;
      console.error('Redirect loop detected - triggering SW cleanup');
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
      toast.error('App reset completed', {
        description: 'The app has been reset to fix loading issues. Refreshing...',
      });

      // Force reload after a brief delay
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 1500);
    } catch (error) {
      console.error('Error handling redirect loop:', error);
      this.state.unregistrationInProgress = false;
    }
  }

  public async unregisterServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      const unregistrationPromises = registrations.map(async (registration) => {
        console.log('Unregistering service worker:', registration.scope);
        return registration.unregister();
      });

      const results = await Promise.all(unregistrationPromises);
      const allUnregistered = results.every(result => result === true);

      if (allUnregistered) {
        console.log('All service workers unregistered successfully');
        this.state.isStale = false;
        this.state.hasRedirectLoop = false;
      }

      return allUnregistered;
    } catch (error) {
      console.error('Error unregistering service workers:', error);
      return false;
    }
  }

  private async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const deletionPromises = cacheNames.map(cacheName => {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      });

      await Promise.all(deletionPromises);
      console.log('All caches cleared');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  public async checkAndCleanup(): Promise<void> {
    const isStale = await this.detectStaleServiceWorker();
    
    if (isStale || this.state.hasRedirectLoop) {
      console.log('Cleaning up stale service worker and caches...');
      await this.unregisterServiceWorker();
      await this.clearAllCaches();
    }
  }

  public getState(): ServiceWorkerState {
    return { ...this.state };
  }

  public async skipWaiting(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for the new SW to take control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('New service worker activated');
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('Error skipping waiting service worker:', error);
    }
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();