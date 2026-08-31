import React from "react";
import { 
  Mic, 
  MicOff, 
  Radio, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle, 
  Volume2, 
  CheckCircle2, 
  Play, 
  Activity,
  Zap
} from "lucide-react";
import { useVoiceSOS } from "../../context/VoiceSOSContext";
import { cn } from "../../lib/utils";

interface VoiceSOSCardProps {
  className?: string;
  variant?: "default" | "compact";
}

export function VoiceSOSCard({ className, variant = "default" }: VoiceSOSCardProps) {
  const {
    isSupported,
    isListening,
    toggleListening,
    lastTranscript,
    testVoiceTrigger,
    recognizedHotwords,
    micPermissionStatus,
  } = useVoiceSOS();

  if (!isSupported) {
    return (
      <div className={cn("p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5", className)}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Web Speech API Unsupported in this Browser</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
            Voice-activated emergency triggers require Chrome, Edge, or Safari on iOS/Desktop.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="voice-sos-control-card"
      className={cn(
        "rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all border",
        isListening
          ? "bg-gradient-to-br from-red-950/40 via-surface-900 to-surface-900 border-red-500/50 shadow-lg shadow-red-950/30 text-white"
          : "bg-white/80 dark:bg-surface-900/60 border-surface-200 dark:border-surface-800/80 text-surface-900 dark:text-white",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-200 dark:border-surface-800/80">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-all",
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300"
            )}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">Hands-Free Voice SOS</h3>
              <span
                className={cn(
                  "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                  isListening
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-surface-200 dark:bg-surface-800 text-surface-500 border-surface-300 dark:border-surface-700"
                )}
              >
                {isListening ? "Listening Live" : "Standby"}
              </span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              Initiate dispatch when injured or hands are trapped (Web Speech API)
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={toggleListening}
          className={cn(
            "px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer shadow-xs",
            isListening
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-primary-600 hover:bg-primary-500 text-white"
          )}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Turn OFF</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Enable Hands-Free</span>
            </>
          )}
        </button>
      </div>

      {/* Live Audio Visualizer / Transcript Feed */}
      {isListening && (
        <div className="mt-3 p-3 rounded-xl bg-surface-950/60 border border-red-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-3.5 bg-red-500 rounded-full animate-bounce" />
            </div>
            <span className="text-[11px] text-surface-300 truncate">
              {lastTranscript ? (
                <strong className="text-white">"{lastTranscript}"</strong>
              ) : (
                <span className="italic text-surface-400">Listening for trigger phrase...</span>
              )}
            </span>
          </div>

          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-ping" />
            Mic Active
          </span>
        </div>
      )}

      {/* Hotwords Chips */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-surface-500 dark:text-surface-400 font-semibold">
          <span>Supported Voice Triggers:</span>
          <span className="text-[10px] text-primary-500 dark:text-primary-400 font-bold">Multilingual Ready</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["Help Me", "SOS", "Emergency", "Call Ambulance", "Accident", "Save Me", "Bachao", "Medical Emergency"].map((word) => (
            <span
              key={word}
              className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700/60 text-[11px] font-bold"
            >
              "{word}"
            </span>
          ))}
        </div>
      </div>

      {/* Footer Simulation & Safety info */}
      <div className="mt-4 pt-3 border-t border-surface-200 dark:border-surface-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-surface-500 dark:text-surface-400">
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Has 5s countdown safety window with voice cancel support ("Cancel / Stop")</span>
        </div>

        <button
          type="button"
          onClick={() => testVoiceTrigger("help me")}
          className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Play className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>Test Voice Trigger</span>
        </button>
      </div>
    </div>
  );
}
