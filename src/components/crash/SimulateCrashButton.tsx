import React from "react";
import { ShieldAlert, Zap } from "lucide-react";
import { useCrashDetection } from "../../context/CrashDetectionContext";
import { cn } from "../../lib/utils";

interface SimulateCrashButtonProps {
  className?: string;
  variant?: "primary" | "outline" | "compact";
}

export function SimulateCrashButton({ className, variant = "primary" }: SimulateCrashButtonProps) {
  const { triggerCrashSimulation, isCrashDetected } = useCrashDetection();

  if (variant === "compact") {
    return (
      <button
        onClick={() => triggerCrashSimulation()}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-95 animate-pulse",
          className
        )}
        title="Simulate Vehicle Impact / Crash Telemetry for Hackathon Demo"
      >
        <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
        <span>Simulate Crash 🚗💥</span>
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        onClick={() => triggerCrashSimulation()}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-500/50 hover:border-red-600 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-extrabold text-xs transition-all active:scale-95",
          className
        )}
      >
        <ShieldAlert className="w-4 h-4 text-red-500" />
        <span>Simulate Crash (Hackathon Demo)</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => triggerCrashSimulation()}
      className={cn(
        "w-full sm:w-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95",
        className
      )}
    >
      <Zap className="w-4 h-4 fill-current text-amber-300 animate-bounce" />
      <span>Simulate Crash Demo 🚗💥</span>
    </button>
  );
}
