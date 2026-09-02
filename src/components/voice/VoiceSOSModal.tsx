import React from "react";
import { 
  Mic, 
  MicOff, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Volume2, 
  Radio, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useVoiceSOS } from "../../context/VoiceSOSContext";

export function VoiceSOSModal() {
  const {
    isTriggered,
    triggerPhrase,
    countdown,
    cancelTrigger,
    confirmImmediateDispatch,
  } = useVoiceSOS();

  if (!isTriggered) return null;

  // Percentage for progress ring (5 seconds total)
  const progressPercent = Math.max(0, Math.min(100, (countdown / 5) * 100));
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div
      id="voice-sos-modal"
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto custom-scrollbar bg-surface-900 border-2 border-red-500/80 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200 break-words">
        {/* Glowing background aura */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          <span>Voice-Activated Emergency Trigger</span>
        </div>

        {/* 5-Second Countdown Circular Visualizer */}
        <div className="relative w-32 h-32 flex items-center justify-center my-2">
          {/* Animated pulsing wave rings */}
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75" />
          <div className="absolute -inset-2 rounded-full border border-red-500/30 animate-pulse" />

          {/* SVG Progress Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#27272a"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="7"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Countdown Number & Mic */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white tracking-tighter">
              {countdown}s
            </span>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
              Dispatch In
            </span>
          </div>
        </div>

        {/* Detected Phrase Box */}
        <div className="w-full mt-4 p-3.5 rounded-2xl bg-surface-800/80 border border-surface-700/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-surface-400">
            <span className="flex items-center gap-1 font-semibold">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              Recognized Hotword:
            </span>
            <span className="text-emerald-400 font-bold text-[10px] uppercase">
              Web Speech API Match
            </span>
          </div>
          <p className="text-sm font-extrabold text-white uppercase tracking-wide truncate">
            "{triggerPhrase || "HELP ME"}"
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-3 text-xs text-surface-300 space-y-1">
          <p className="font-semibold text-white">
            Dispatching ambulance & emergency network automatically.
          </p>
          <p className="text-[11px] text-surface-400 flex items-center justify-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-primary-400 inline" />
            Say <strong className="text-amber-400">"CANCEL"</strong> or{" "}
            <strong className="text-amber-400">"STOP"</strong> hands-free to abort.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={confirmImmediateDispatch}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-red-950 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>DISPATCH NOW</span>
          </button>

          <button
            type="button"
            onClick={cancelTrigger}
            className="w-full py-3 px-4 bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white font-bold text-xs rounded-2xl border border-surface-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-surface-400" />
            <span>I Am Safe / Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
