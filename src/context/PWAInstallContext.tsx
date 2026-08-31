import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isDismissed: boolean;
  canPrompt: boolean;
  installApp: () => Promise<boolean>;
  dismissPrompt: () => void;
  resetDismissal: () => void;
}

const DEFAULT_PWA_STATE: PWAInstallContextType = {
  isInstallable: false,
  isInstalled: false,
  isDismissed: true,
  canPrompt: false,
  installApp: async () => false,
  dismissPrompt: () => {},
  resetDismissal: () => {},
};

const PWAInstallContext = createContext<PWAInstallContextType>(DEFAULT_PWA_STATE);

const DISMISSED_KEY = "goldenguard_pwa_dismissed";

function checkIsStandalone(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  
  try {
    const isStandaloneMedia = typeof window.matchMedia === "function" && Boolean(window.matchMedia("(display-mode: standalone)")?.matches);
    const isNavigatorStandalone = typeof navigator !== "undefined" && Boolean((navigator as unknown as { standalone?: boolean })?.standalone);
    const isAndroidApp = typeof document.referrer === "string" && document.referrer.startsWith("android-app://");

    return isStandaloneMedia || isNavigatorStandalone || isAndroidApp;
  } catch {
    return false;
  }
}

export const PWAInstallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    try {
      return checkIsStandalone();
    } catch {
      return false;
    }
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (checkIsStandalone()) {
        setIsInstalled(true);
      }
    } catch {
      // ignore
    }

    // Media query listener for display-mode changes
    let mediaQuery: MediaQueryList | null = null;
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e?.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    };

    try {
      if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
        mediaQuery = window.matchMedia("(display-mode: standalone)");
        if (mediaQuery?.addEventListener) {
          mediaQuery.addEventListener("change", handleDisplayModeChange);
        } else if (mediaQuery?.addListener) {
          mediaQuery.addListener(handleDisplayModeChange);
        }
      }
    } catch {
      // Fallback
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
        const promptEvent = e as BeforeInstallPromptEvent;
        setDeferredPrompt(promptEvent);
      } catch (err) {
        console.warn("PWA prompt capture notice:", err);
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      try {
        if (mediaQuery) {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener("change", handleDisplayModeChange);
          } else if (mediaQuery.removeListener) {
            mediaQuery.removeListener(handleDisplayModeChange);
          }
        }
      } catch {
        // ignore
      }
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice?.outcome === "accepted") {
        setIsInstalled(true);
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Error triggering PWA install prompt:", err);
      return false;
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
  }, []);

  const resetDismissal = useCallback(() => {
    setIsDismissed(false);
    try {
      localStorage.removeItem(DISMISSED_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isInstallable = !isInstalled && deferredPrompt !== null;

  return (
    <PWAInstallContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isDismissed,
        canPrompt: deferredPrompt !== null,
        installApp,
        dismissPrompt,
        resetDismissal,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
};

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  return context || DEFAULT_PWA_STATE;
}

