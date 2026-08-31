import React, { useState } from "react";
import { Download, Check } from "lucide-react";
import { usePWAInstall } from "../../context/PWAInstallContext";
import { cn } from "../../lib/utils";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "header" | "sidebar" | "banner";
  showIconOnly?: boolean;
}

export function PWAInstallButton({ className, variant = "header", showIconOnly = false }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [loading, setLoading] = useState(false);

  // If not installable or already installed, do not render a broken button
  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleClick = async () => {
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
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border border-primary-200/50 dark:border-primary-800/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 active:scale-98 cursor-pointer shadow-sm",
          className
        )}
      >
        <div className="p-1.5 rounded-lg bg-primary-500 text-white shadow-xs">
          <Download className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="leading-tight">{loading ? "Installing App..." : "Install App"}</span>
          <span className="text-[10px] text-surface-400 font-normal">Offline & 1-Tap SOS</span>
        </div>
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
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 hover:from-primary-500 hover:to-amber-400 text-white shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50",
        className
      )}
    >
      <Download className="w-3.5 h-3.5 shrink-0" />
      {!showIconOnly && <span className="hidden sm:inline">{loading ? "Installing..." : "Install App"}</span>}
    </button>
  );
}
