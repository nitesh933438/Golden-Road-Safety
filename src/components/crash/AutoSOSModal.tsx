import React from "react";
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, PhoneCall, MapPin, 
  Clock, Users, Bot, Navigation, Activity, X, HeartPulse, Send, Shield
} from "lucide-react";
import { useCrashDetection } from "../../context/CrashDetectionContext";
import { useNavigate } from "react-router-dom";

export function AutoSOSModal() {
  const { 
    isCrashDetected, 
    countdown, 
    unconsciousMode, 
    activeEmergency, 
    cancelCrashAlert, 
    confirmSOSNow, 
    resetEmergencyState 
  } = useCrashDetection();

  const navigate = useNavigate();

  if (!isCrashDetected && !activeEmergency) {
    return null;
  }

  // Calculate SVG stroke offset for 15s countdown
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (countdown / 15) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      
      {/* Background Pulse Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/30 via-transparent to-transparent pointer-events-none animate-pulse"></div>

      <div className="relative w-full max-w-xl bg-white dark:bg-surface-900 rounded-3xl border-2 border-red-500/50 shadow-2xl shadow-red-600/30 overflow-hidden my-auto">
        
        {/* Top Emergency Flash Header */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md animate-bounce">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-full">
                {unconsciousMode || activeEmergency ? "UNCONSCIOUS MODE ACTIVE" : "VEHICLE CRASH SENSOR ALERT"}
              </span>
              <h2 className="text-lg font-black tracking-tight">
                {unconsciousMode || activeEmergency ? "Auto-SOS Assistance Initiated" : "Possible accident detected."}
              </h2>
            </div>
          </div>

          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* STAGE 1: 15-SECOND COUNTDOWN WARNING */}
          {isCrashDetected && !activeEmergency && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
              
              {/* Telemetry Graphic & Ring Timer */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={circleRadius}
                    className="text-surface-200 dark:text-surface-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={circleRadius}
                    className="text-red-600 transition-all duration-1000 ease-linear"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-surface-900 dark:text-white">
                  <span className="text-4xl font-black tracking-tighter text-red-600 animate-pulse">
                    {countdown}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-surface-500">
                    SECONDS
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-surface-600 dark:text-surface-300 max-w-md mx-auto">
                  Sudden high-G deceleration or orientation impact was recorded. Confirm your safety or SOS will auto-broadcast in <strong className="text-red-500">{countdown} seconds</strong>.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Auto SOS & GPS Broadcast Arming...</span>
                </div>
              </div>

              {/* Action Buttons: I'm Safe vs Send SOS Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2">
                <button
                  onClick={cancelCrashAlert}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>✅ I'm Safe</span>
                </button>

                <button
                  onClick={confirmSOSNow}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-red-600/40 animate-pulse transition-all"
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span>🚨 Send SOS Now</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: UNCONSCIOUS MODE DISPATCHED */}
          {activeEmergency && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Unconscious Banner */}
              <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base leading-tight">
                      {activeEmergency.unconscious ? "User is not responding." : "Emergency Distress Broadcasted."}
                    </h3>
                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                      Emergency assistance has been initiated automatically via GoldenGuard Telemetry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-surface-50 dark:bg-surface-800/80 p-3 rounded-2xl border border-surface-200 dark:border-surface-700 text-center space-y-1">
                  <Clock className="w-5 h-5 text-amber-500 mx-auto" />
                  <span className="text-[10px] font-bold uppercase text-surface-500">Golden Hour</span>
                  <p className="text-base font-black text-amber-600 dark:text-amber-400">
                    {activeEmergency.goldenHourMinutesLeft}:00 Left
                  </p>
                </div>

                <div className="bg-surface-50 dark:bg-surface-800/80 p-3 rounded-2xl border border-surface-200 dark:border-surface-700 text-center space-y-1">
                  <MapPin className="w-5 h-5 text-emerald-500 mx-auto" />
                  <span className="text-[10px] font-bold uppercase text-surface-500">GPS Location</span>
                  <p className="text-xs font-bold truncate text-surface-900 dark:text-white">
                    Pitched & Shared
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-surface-50 dark:bg-surface-800/80 p-3 rounded-2xl border border-surface-200 dark:border-surface-700 text-center space-y-1">
                  <Users className="w-5 h-5 text-blue-500 mx-auto" />
                  <span className="text-[10px] font-bold uppercase text-surface-500">Responders</span>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {activeEmergency.nearbyVolunteersNotifiedCount} Nearby Alerted
                  </p>
                </div>
              </div>

              {/* Emergency Contacts Message Log Box */}
              <div className="bg-surface-900 text-surface-100 p-4 rounded-2xl space-y-3 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between border-b border-surface-800 pb-2 text-surface-400">
                  <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-amber-400">
                    <Send className="w-3.5 h-3.5" /> Emergency Contacts Message Log
                  </span>
                  <span>ID: {activeEmergency.id}</span>
                </div>

                <div className="space-y-2 text-surface-300">
                  <div className="grid grid-cols-3 text-[11px]">
                    <span className="text-surface-500">Victim:</span>
                    <span className="col-span-2 font-bold text-white">{activeEmergency.patientName}</span>
                  </div>
                  <div className="grid grid-cols-3 text-[11px]">
                    <span className="text-surface-500">Live GPS:</span>
                    <span className="col-span-2 truncate text-emerald-400">{activeEmergency.location}</span>
                  </div>
                  <div className="grid grid-cols-3 text-[11px]">
                    <span className="text-surface-500">Time:</span>
                    <span className="col-span-2 text-amber-300">{activeEmergency.timestamp}</span>
                  </div>
                </div>

                <div className="border-t border-surface-800 pt-2 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-surface-500">Dispatch Payload:</div>
                  {activeEmergency.contactsNotified.map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] bg-surface-800/60 px-2 py-1 rounded">
                      <span className="text-surface-200 truncate">{c.name} ({c.phone})</span>
                      <span className="text-emerald-400 text-[10px] font-bold">✓ {c.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    navigate("/first-aid");
                  }}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
                >
                  <Bot className="w-4 h-4" />
                  <span>Start AI First Aid Screen</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/map");
                  }}
                  className="py-3.5 px-4 rounded-2xl bg-surface-800 hover:bg-surface-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Track Responders on Map</span>
                </button>
              </div>

              {/* Cancel / Dismiss Option */}
              <div className="text-center pt-2">
                <button
                  onClick={resetEmergencyState}
                  className="text-xs font-bold text-surface-500 hover:text-surface-900 dark:hover:text-white underline transition-colors"
                >
                  I'm Okay Now (Clear Emergency)
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
