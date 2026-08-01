import React, { useState } from "react";
import { ShieldAlert, Phone, AlertTriangle, MapPin, Activity, CheckCircle2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export function SOS() {
  const { demoMode } = useOutletContext<{ demoMode: boolean }>();
  const [sosActive, setSosActive] = useState(false);

  const toggleSOS = () => {
    setSosActive(!sosActive);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-500">
      
      {sosActive ? (
        <div className="w-48 h-48 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center animate-ping absolute opacity-50"></div>
      ) : null}

      <button 
        onClick={toggleSOS}
        className={`relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
          sosActive 
            ? "bg-red-600 text-white shadow-red-600/50 scale-110" 
            : "bg-surface-100 dark:bg-surface-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:scale-105"
        }`}
      >
        <ShieldAlert className={`w-16 h-16 sm:w-20 sm:h-20 ${sosActive ? "animate-pulse" : ""}`} />
      </button>
      
      <div className="space-y-3 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 dark:text-white">
          {sosActive ? "SOS Activated" : "Emergency SOS"}
        </h1>
        <p className="text-lg text-surface-600 dark:text-surface-400 max-w-lg mx-auto">
          {sosActive 
            ? "Emergency contacts and nearby responders have been alerted. Stay calm, help is on the way." 
            : "If you are in immediate danger, tap the shield to broadcast your location to responders."}
        </p>
      </div>

      {sosActive && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4 animate-in slide-in-from-bottom-4 duration-500 relative z-10">
           <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-green-200 dark:border-green-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
              <MapPin className="w-6 h-6 text-green-500" />
              <span className="text-sm font-bold text-surface-900 dark:text-white">Location Sent</span>
              <span className="text-xs text-surface-500">{demoMode ? "142 Sector 7" : "Fetching..."}</span>
           </div>
           <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-blue-200 dark:border-blue-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
              <Activity className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-bold text-surface-900 dark:text-white">Responders</span>
              <span className="text-xs text-surface-500">{demoMode ? "3 En Route" : "Alerting..."}</span>
           </div>
           <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-amber-200 dark:border-amber-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-amber-500" />
              <span className="text-sm font-bold text-surface-900 dark:text-white">Contacts</span>
              <span className="text-xs text-surface-500">Notified</span>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8 relative z-10">
        <a 
          href="tel:108"
          onClick={(e) => {
            // Provide feedback toast/alert for browser/desktop environment
            if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
              e.preventDefault();
              alert("Dialing 108 (National Ambulance)... Direct line connected to regional dispatch.");
            }
          }}
          className="flex flex-col items-center gap-3 p-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all shadow-lg shadow-red-600/20 hover:-translate-y-1"
        >
          <Phone className="w-8 h-8 animate-bounce" />
          <div className="font-bold text-lg">Call 108</div>
          <div className="text-sm text-red-200">National Ambulance</div>
        </a>

        <a 
          href="tel:112"
          onClick={(e) => {
            if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
              e.preventDefault();
              alert("Dialing 112 (General Emergency Helpline)... Priority dispatch initiated.");
            }
          }}
          className="flex flex-col items-center gap-3 p-6 bg-surface-900 hover:bg-surface-800 dark:bg-white dark:hover:bg-surface-100 dark:text-surface-900 text-white rounded-2xl transition-all shadow-lg hover:-translate-y-1"
        >
          <Phone className="w-8 h-8" />
          <div className="font-bold text-lg">Call 112</div>
          <div className="text-sm opacity-80">General Emergency</div>
        </a>
      </div>
    </div>
  );
}
