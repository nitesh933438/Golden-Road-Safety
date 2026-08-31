import React, { useState } from "react";
import { Download, X, Smartphone, ShieldCheck, Sparkles } from "lucide-react";
import { usePWAInstall } from "../../context/PWAInstallContext";

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isDismissed, installApp, dismissPrompt } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  // Do not render if not installable, already installed, or previously dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div
      id="pwa-install-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300 shadow-2xl"
    >
      <div className="bg-surface-900/95 dark:bg-surface-900/95 backdrop-blur-md border border-primary-500/40 rounded-2xl p-4 text-white shadow-xl shadow-surface-950/60 relative overflow-hidden">
        {/* Ambient background highlight */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-amber-500 p-0.5 shrink-0 shadow-md">
            <img
              src="./icon-192.png"
              alt="GoldenGuard"
              className="w-full h-full object-cover rounded-[10px]"
              onError={(e) => {
                // Fallback to icon
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick Access
              </span>
            </div>
            <h4 className="text-sm font-black text-white tracking-tight truncate">
              Install GoldenGuard App
            </h4>
            <p className="text-xs text-surface-300 font-medium leading-relaxed mt-0.5 line-clamp-2">
              Instant 1-Tap SOS, offline first-aid guides & fastest emergency dispatch right from your home screen.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstall}
                disabled={isInstalling}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? "Installing..." : "Install App"}</span>
              </button>

              <button
                type="button"
                onClick={dismissPrompt}
                className="px-3 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={dismissPrompt}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            title="Dismiss"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
