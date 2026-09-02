import React, { useState, useEffect } from "react";
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryWarning,
  AlertTriangle,
  Zap,
  Info,
  X,
  ShieldAlert,
  Power
} from "lucide-react";
import { cn } from "../lib/utils";
import { BatteryModal } from "./layout/BatteryModal";

// BatteryManager Web API Types
interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}

export interface BatteryState {
  supported: boolean;
  level: number; // 0 to 100
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
  isLow: boolean; // < 20%
  isCritical: boolean; // < 10%
}

/**
 * Custom hook to monitor device battery status with real-time updates
 */
export function useBatteryStatus(): BatteryState {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    supported: true,
    level: 100,
    charging: false,
    chargingTime: null,
    dischargingTime: null,
    isLow: false,
    isCritical: false,
  });

  useEffect(() => {
    let batteryInstance: BatteryManager | null = null;
    let isMounted = true;

    const updateBatteryInfo = (bm: BatteryManager) => {
      if (!isMounted) return;
      const levelPct = Math.round(bm.level * 100);
      const isLow = levelPct <= 20;
      const isCritical = levelPct <= 10;

      setBatteryState({
        supported: true,
        level: levelPct,
        charging: bm.charging,
        chargingTime: Number.isFinite(bm.chargingTime) ? bm.chargingTime : null,
        dischargingTime: Number.isFinite(bm.dischargingTime) ? bm.dischargingTime : null,
        isLow,
        isCritical,
      });
    };

    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      (navigator as any)
        .getBattery()
        .then((bm: BatteryManager) => {
          if (!isMounted) return;
          batteryInstance = bm;
          updateBatteryInfo(bm);

          const handleChange = () => updateBatteryInfo(bm);

          bm.addEventListener("chargingchange", handleChange);
          bm.addEventListener("levelchange", handleChange);
          bm.addEventListener("chargingtimechange", handleChange);
          bm.addEventListener("dischargingtimechange", handleChange);
        })
        .catch((err: any) => {
          console.warn("Battery API not accessible or permission denied:", err);
          if (isMounted) {
            setBatteryState((prev) => ({ ...prev, supported: false }));
          }
        });
    } else {
      setBatteryState((prev) => ({ ...prev, supported: false }));
    }

    return () => {
      isMounted = false;
      if (batteryInstance) {
        // Cleanup event listeners
        try {
          batteryInstance.removeEventListener("chargingchange", () => {});
          batteryInstance.removeEventListener("levelchange", () => {});
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return batteryState;
}

export interface BatteryStatusProps {
  className?: string;
  variant?: "compact" | "badge" | "card" | "emergency-banner";
  showDetailsOnClick?: boolean;
  onLowBatteryAlert?: () => void;
}

export function BatteryStatus({
  className,
  variant = "compact",
  showDetailsOnClick = true,
  onLowBatteryAlert,
}: BatteryStatusProps) {
  const { supported, level, charging, chargingTime, dischargingTime, isLow, isCritical } = useBatteryStatus();
  const [showPopover, setShowPopover] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (isLow && onLowBatteryAlert) {
      onLowBatteryAlert();
    }
  }, [isLow, onLowBatteryAlert]);

  // If Battery API is completely unsupported by browser, we render a graceful neutral indicator
  // or hide in emergency-banner mode so it does not clutter
  if (!supported) {
    if (variant === "emergency-banner") return null;
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-surface-400 bg-surface-100 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50",
          className
        )}
        title="Device battery status not exposed by browser"
      >
        <Battery className="w-3.5 h-3.5 opacity-60" />
        <span className="text-[10px] hidden sm:inline opacity-75">Battery Auto</span>
      </div>
    );
  }

  // Choose appropriate battery icon based on charging & level
  const renderBatteryIcon = (sizeClass = "w-4 h-4") => {
    if (charging) {
      return <BatteryCharging className={cn(sizeClass, "text-emerald-500")} />;
    }
    if (isCritical) {
      return <BatteryLow className={cn(sizeClass, "text-red-500 animate-pulse")} />;
    }
    if (isLow) {
      return <BatteryWarning className={cn(sizeClass, "text-amber-500 animate-bounce")} />;
    }
    if (level >= 75) {
      return <BatteryFull className={cn(sizeClass, "text-emerald-500")} />;
    }
    if (level >= 25) {
      return <BatteryMedium className={cn(sizeClass, "text-primary-500")} />;
    }
    return <BatteryLow className={cn(sizeClass, "text-amber-500")} />;
  };

  // Helper formatting for remaining minutes/hours
  const formatTime = (seconds: number | null) => {
    if (!seconds || seconds <= 0 || !Number.isFinite(seconds)) return null;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // ==========================================
  // VARIANT 1: EMERGENCY FULL-WIDTH BANNER
  // (Only appears when battery is < 20% and not dismissed)
  // ==========================================
  if (variant === "emergency-banner") {
    if (!isLow || bannerDismissed) return null;

    return (
      <div
        id="low-battery-emergency-banner"
        className={cn(
          "w-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-4 py-2.5 shadow-lg border-b border-red-500/50 animate-in slide-in-from-top-4 duration-300 relative z-40",
          className
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-white/20 shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
            </div>
            <div>
              <span className="font-black uppercase tracking-wider text-yellow-200 mr-1.5">
                Low Battery Alert ({level}%):
              </span>
              <span className="font-medium text-white/90">
                Device may power off during an emergency. Please connect a charger or enable battery saver to keep Golden Hour SOS active.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {charging ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/30 font-bold border border-emerald-300/40 text-emerald-100">
                <Zap className="w-3 h-3" /> Charging
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              title="Dismiss warning"
              aria-label="Dismiss battery warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VARIANT 2: CARD / DETAIL VIEW
  // ==========================================
  if (variant === "card") {
    return (
      <div
        id="battery-status-card"
        className={cn(
          "p-4 rounded-2xl border transition-all relative overflow-hidden",
          isCritical
            ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800"
            : isLow
            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
            : "bg-surface-50 dark:bg-surface-800/40 border-surface-200 dark:border-surface-700/50",
          className
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "p-2 rounded-xl flex items-center justify-center",
                isLow
                  ? "bg-red-500 text-white shadow-sm shadow-red-500/30"
                  : "bg-primary-500 text-white shadow-sm shadow-primary-500/30"
              )}
            >
              {renderBatteryIcon("w-5 h-5")}
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-surface-500 dark:text-surface-400">
                Device Telemetry
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-surface-900 dark:text-white">
                  {level}% Battery
                </span>
                {isLow && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse">
                    <AlertTriangle className="w-2.5 h-2.5" /> Warning
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                charging
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                  : isLow
                  ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                  : "bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300"
              )}
            >
              {charging ? (
                <>
                  <Zap className="w-3 h-3 text-emerald-500 animate-bounce" /> Charging
                </>
              ) : isLow ? (
                "Unplugged / Discharging"
              ) : (
                "Discharging"
              )}
            </span>
          </div>
        </div>

        {/* Battery Level Progress Bar */}
        <div className="w-full bg-surface-200 dark:bg-surface-700 h-2.5 rounded-full overflow-hidden mb-2.5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCritical
                ? "bg-red-600"
                : isLow
                ? "bg-amber-500"
                : level > 50
                ? "bg-emerald-500"
                : "bg-primary-500"
            )}
            style={{ width: `${Math.max(4, Math.min(100, level))}%` }}
          />
        </div>

        {/* Low Battery Warning Message */}
        {isLow && (
          <div className="p-2.5 rounded-xl bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200 flex items-start gap-2 mt-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Emergency Risk:</strong> Device battery is below 20%. Keep your charger plugged in so location telemetry & emergency crash detection remain uninterrupted.
            </p>
          </div>
        )}

        {/* Estimated Time Remaining if Available */}
        {(chargingTime || dischargingTime) && (
          <div className="flex items-center justify-between text-[11px] text-surface-500 dark:text-surface-400 mt-2 pt-2 border-t border-surface-200 dark:border-surface-700/50">
            <span>{charging ? "Est. time until full charge" : "Est. battery life remaining"}</span>
            <span className="font-semibold text-surface-700 dark:text-surface-300">
              {formatTime(charging ? chargingTime : dischargingTime)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VARIANT 3: BADGE / COMPACT (Default Header Indicator)
  // ==========================================
  return (
    <div className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={() => showDetailsOnClick && setShowPopover(!showPopover)}
        id="header-battery-status-btn"
        title={
          isLow
            ? `Low Battery Warning (${level}%) - Click for device power telemetry`
            : `Device Battery: ${level}% ${charging ? "(Charging)" : ""}`
        }
        className={cn(
          "inline-flex items-center gap-0.5 min-[360px]:gap-1 p-1 min-[360px]:p-1.5 rounded-lg text-[10px] min-[360px]:text-xs font-bold transition-all shrink-0 cursor-pointer select-none",
          isCritical
            ? "bg-red-600 text-white animate-pulse"
            : isLow
            ? "text-amber-600 dark:text-amber-400 font-extrabold"
            : "text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800",
          className
        )}
      >
        {/* Battery Icon */}
        <span className="shrink-0">{renderBatteryIcon("w-3.5 h-3.5")}</span>

        {/* Battery Percentage */}
        <span className="font-extrabold tabular-nums tracking-tight text-[10px] min-[360px]:text-xs">{level}%</span>

        {/* Warning Icon if level drops below 20% */}
        {isLow && (
          <span className="flex items-center shrink-0">
            <AlertTriangle
              className={cn(
                "w-3 h-3 text-amber-500 dark:text-amber-400 animate-bounce",
                isCritical && "text-yellow-200"
              )}
            />
          </span>
        )}
      </button>

      {/* Popover Card for Header / Compact mode */}
      <BatteryModal
        isOpen={showPopover}
        onClose={() => setShowPopover(false)}
        level={level}
        charging={charging}
        isLow={isLow}
        isCritical={isCritical}
        renderBatteryIcon={renderBatteryIcon}
      />
    </div>
  );
}

export default BatteryStatus;
