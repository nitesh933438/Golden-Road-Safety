import React from "react";
import { ShieldAlert, Bot, Navigation, CheckCircle2, Phone } from "lucide-react";
import { useCrashDetection } from "../../context/CrashDetectionContext";
import { useNavigate } from "react-router-dom";

export function CrashTopBanner() {
  const { activeEmergency, resetEmergencyState } = useCrashDetection();
  const navigate = useNavigate();

  if (!activeEmergency) return null;

  return (
    <div className="bg-gradient-to-r from-red-700 via-amber-600 to-red-700 text-white px-4 py-2.5 shadow-md sticky top-0 z-40 border-b border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2.5 text-center sm:text-left">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
        </span>
        <div className="text-xs font-bold leading-tight">
          <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-black mr-2 uppercase tracking-wider">
            {activeEmergency.unconscious ? "Unconscious Victim Auto-SOS Active" : "Auto SOS Active"}
          </span>
          <span>{activeEmergency.patientName} | Golden Hour: <strong className="text-amber-200">{activeEmergency.goldenHourMinutesLeft}:00</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate("/first-aid")}
          className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black rounded-lg flex items-center gap-1 shadow-sm transition-all"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI First Aid</span>
        </button>

        <button
          onClick={() => navigate("/map")}
          className="px-3 py-1 bg-black/40 hover:bg-black/60 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Map</span>
        </button>

        <button
          onClick={resetEmergencyState}
          className="p-1 hover:bg-white/20 rounded text-xs font-bold text-white/80 hover:text-white transition-colors"
          title="Clear Emergency"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
