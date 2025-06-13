import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Share, Plus } from "lucide-react";
import { shouldShowPWAFeatures } from "@/lib/platform";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Detect iOS Safari
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
};

// Detect Android
const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// Detect if app is running in standalone mode
const isStandalone = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

// Detect if browser supports PWA install
const supportsPWAInstall = () => {
  return "serviceWorker" in navigator && "BeforeInstallPromptEvent" in window;
};

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [installPromptDismissed, setInstallPromptDismissed] = useState(false);

  useEffect(() => {
    // Don't show PWA features in native apps
    if (!shouldShowPWAFeatures()) {
      return;
    }

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      setInstallPromptDismissed(true);
      return;
    }

    // Check if app is already installed
    if (isStandalone()) {
      return;
    }

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS Safari or Android browsers that don't support beforeinstallprompt,
    // show instructions after a delay if no beforeinstallprompt fired
    if ((isIOS() || isAndroid()) && !isStandalone()) {
      const timer = setTimeout(() => {
        if (!deferredPrompt && !installPromptDismissed) {
          setShowIOSInstructions(true);
        }
      }, 3000); // Show after 3 seconds

      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [deferredPrompt, installPromptDismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowIOSInstructions(false);
    setDeferredPrompt(null);
    setInstallPromptDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleIOSDismiss = () => {
    setShowIOSInstructions(false);
    setInstallPromptDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  // Show iOS instructions
  if (showIOSInstructions && !installPromptDismissed) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border border-border bg-background p-4 shadow-lg md:left-auto md:right-4 md:w-80">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Install LogYourBody</h3>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleIOSDismiss}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="mb-3 text-sm text-muted-foreground">
          Install LogYourBody on your device for a better experience:
        </p>

        <div className="mb-3 space-y-2">
          {isIOS() ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Share className="h-4 w-4 text-primary" />
                <span>1. Tap the Share button</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4 text-primary" />
                <span>2. Select "Add to Home Screen"</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4 text-primary" />
                <span>1. Open browser menu (⋮)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4 text-primary" />
                <span>2. Select "Add to Home screen"</span>
              </div>
            </>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleIOSDismiss}
          className="h-9 w-full text-sm"
        >
          Got it
        </Button>
      </div>
    );
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border border-border bg-background p-4 shadow-lg md:left-auto md:right-4 md:w-80">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">Install LogYourBody</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDismiss}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Install LogYourBody on your device for a better experience with offline
        access and quick launching.
      </p>

      <div className="flex gap-2">
        <Button
          onClick={handleInstall}
          className="h-9 flex-1 bg-primary text-sm text-primary-foreground hover:bg-primary/90"
        >
          Install App
        </Button>
        <Button
          variant="outline"
          onClick={handleDismiss}
          className="h-9 px-3 text-sm"
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
