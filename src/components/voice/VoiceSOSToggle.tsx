import React from "react";
import { Mic, MicOff, Volume2, ShieldAlert } from "lucide-react";
import { useVoiceSOS } from "../../context/VoiceSOSContext";
import { cn } from "../../lib/utils";
import { VoiceCommandsTooltip } from "./VoiceCommandsTooltip";

interface VoiceSOSToggleProps {
  className?: string;
  variant?: "header" | "compact" | "pill" | "button";
}

export function VoiceSOSToggle({ className, variant = "header" }: VoiceSOSToggleProps) {
  const { isListening, toggleListening, isSupported } = useVoiceSOS();

  if (!isSupported) return null;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? "Hands-Free Voice SOS is ON (Listening for 'Help' or 'SOS')" : "Turn ON Hands-Free Voice SOS"}
          className={cn(
            "relative p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer",
            isListening
              ? "bg-red-500/15 text-red-500 border border-red-500/40 shadow-xs shadow-red-500/20"
              : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800",
            className
          )}
        >
          {isListening ? (
            <>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <Mic className="w-4 h-4 text-red-500" />
            </>
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </button>
        <VoiceCommandsTooltip />
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleListening}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
            isListening
              ? "bg-red-600 text-white shadow-md shadow-red-600/30 animate-pulse"
              : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-200 dark:hover:bg-surface-700",
            className
          )}
        >
          {isListening ? (
            <>
              <Mic className="w-3.5 h-3.5 text-white" />
              <span>Voice SOS: Active</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-surface-400" />
              <span>Enable Voice SOS</span>
            </>
          )}
        </button>
        <VoiceCommandsTooltip />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={toggleListening}
        id="header-voice-sos-toggle"
        title={
          isListening
            ? "Hands-Free Voice SOS Active (Say 'Help' or 'SOS')"
            : "Enable Hands-Free Voice SOS (Web Speech API)"
        }
        className={cn(
          "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer active:scale-95",
          isListening
            ? "bg-red-500/20 text-red-400 border border-red-500/50 shadow-xs"
            : "text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700/60",
          className
        )}
      >
        {isListening ? (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <Mic className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden lg:inline text-[11px] text-red-400">Voice SOS Active</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline text-[11px]">Voice SOS</span>
          </>
        )}
      </button>
      <VoiceCommandsTooltip />
    </div>
  );
}
