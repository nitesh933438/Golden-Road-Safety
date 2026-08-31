import React, { useState } from "react";
import { Download, CheckCircle2, Sparkles } from "lucide-react";
import { usePWAInstall } from "../../context/PWAInstallContext";
import { cn } from "../../lib/utils";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "header" | "sidebar" | "banner" | "card" | "pill" | "footer";
  showIconOnly?: boolean;
}

export function PWAInstallButton({ className, variant = "header", showIconOnly = false }: PWAInstallButtonProps) {
  const { isInstalled, installApp, canPrompt } = usePWAInstall();
  const [loading, setLoading] = useState(false);

  // If already installed in standalone mode
  if (isInstalled) {
    if (variant === "sidebar") {
      return (
        <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[11px] font-bold">App Installed (PWA)</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await installApp();
    } finally {
      setLoading(false);
    }
  };

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        id="sidebar-pwa-install-btn"
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border border-primary-200/50 dark:border-primary-800/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 active:scale-98 cursor-pointer shadow-xs",
          className
        )}
      >
        <div className="p-1.5 rounded-lg bg-primary-500 text-white shadow-xs">
          <Download className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="leading-tight">{loading ? "Installing..." : "Install PWA App"}</span>
          <span className="text-[10px] text-surface-400 font-normal">Offline & 1-Tap SOS</span>
        </div>
      </button>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("p-4 rounded-2xl bg-gradient-to-br from-primary-900/30 to-amber-900/20 border border-primary-500/30 text-white space-y-3", className)}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary-500 text-white shadow-md">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> PWA Home Screen
            </h4>
            <p className="text-sm font-extrabold text-white">Install GoldenGuard</p>
          </div>
        </div>
        <p className="text-xs text-surface-300 leading-relaxed">
          Access instant SOS beacon, offline CPR & first-aid instructions with zero latency right from your mobile device.
        </p>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-amber-500 hover:from-primary-600 hover:to-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{loading ? "Preparing..." : "Install Native PWA"}</span>
        </button>
      </div>
    );
  }

  if (variant === "pill" || variant === "footer") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 border border-primary-200/60 dark:border-primary-800/60 hover:bg-primary-100 dark:hover:bg-primary-900 transition-all cursor-pointer",
          className
        )}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{loading ? "Opening..." : "Install App"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      id="header-pwa-install-btn"
      title="Install GoldenGuard App to Home Screen"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 hover:from-primary-500 hover:to-amber-400 text-white shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50",
        className
      )}
    >
      <Download className="w-3.5 h-3.5 shrink-0" />
      {!showIconOnly && <span className="hidden sm:inline">{loading ? "Installing..." : "Install App"}</span>}
    </button>
  );
}
