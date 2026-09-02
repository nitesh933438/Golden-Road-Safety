import React from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { useCrashDetection } from "../../context/CrashDetectionContext";

export function CrashDetectionModal() {
  const { 
    isCrashDetected, 
    countdown, 
    cancelCrashAlert, 
    confirmSOSNow, 
    activeEmergency, 
    unconsciousMode 
  } = useCrashDetection();

  // If crash is not detected, or if emergency is already active and unconscious/dispatched mode took over, don't show modal
  if (!isCrashDetected || activeEmergency || unconsciousMode) {
    return null;
  }

  // Calculate percentage for animated SVG progress ring (based on 15s max)
  const totalSeconds = 15;
  const progressPercent = Math.max(0, Math.min(100, (countdown / totalSeconds) * 100));
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl shadow-surface-950/80 animate-in zoom-in-95 duration-200 relative max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto custom-scrollbar break-words">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-red-950/20 pointer-events-none" />

        {/* Top Warning Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-black uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Possible Accident Detected</span>
        </div>

        {/* Header Title & Subtitle */}
        <div className="space-y-1.5 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Are you safe?
          </h2>
          <p className="text-xs sm:text-sm text-surface-300 font-medium leading-relaxed max-w-sm mx-auto">
            GoldenGuard detected a high impact or sudden stop. Please confirm your safety or emergency services will be automatically notified.
          </p>
        </div>

        {/* Responsive Circular Countdown Display */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center my-2">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-surface-800 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated Countdown Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-amber-500 stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Seconds Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none animate-pulse">
              {countdown}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-surface-400 mt-1">
              SECONDS
            </span>
          </div>
        </div>

        {/* Auto-Dispatch Notice */}
        <div className="text-xs text-surface-300 font-medium bg-surface-800/80 border border-surface-700/80 rounded-xl p-2.5">
          Automatic SOS dispatches in <span className="font-bold text-amber-400">{countdown} seconds</span> if no response is given.
        </div>

        {/* Two Prominent Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 relative z-10">
          
          {/* "I AM SAFE" Button */}
          <button
            onClick={cancelCrashAlert}
            className="w-full py-3.5 px-4 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-lg transition-all transform hover:scale-102 active:scale-98 min-h-[48px] flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>I AM SAFE</span>
          </button>

          {/* "I AM NOT SAFE" Button */}
          <button
            onClick={confirmSOSNow}
            className="w-full py-3.5 px-4 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-sm sm:text-base shadow-lg transition-all transform hover:scale-102 active:scale-98 min-h-[48px] flex items-center justify-center gap-2 cursor-pointer border border-red-400/30"
          >
            <ShieldAlert className="w-5 h-5 text-white" />
            <span>I AM NOT SAFE</span>
          </button>

        </div>

      </div>
    </div>
  );
}
