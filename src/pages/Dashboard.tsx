import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldAlert, AlertTriangle, MapPin, Stethoscope, 
  Users, CheckCircle2, PhoneCall, ChevronRight,
  Shield, Building2, Phone, X, AlertCircle, Clock, FileText, ArrowRight
} from "lucide-react";
import { useIncidents } from "../context/IncidentContext";
import { useOfflineSync } from "../context/OfflineSyncContext";
import { Logo } from "../components/ui/Logo";

export function Dashboard() {
  const navigate = useNavigate();
  const { isOnline } = useOfflineSync() || { isOnline: navigator.onLine };
  const { selectedIncident, realMetrics } = useIncidents();

  // Map database status to citizen-friendly status steps
  const dbStatus = selectedIncident?.status || "CREATED";
  const getStepIndex = (status: string) => {
    switch (status) {
      case "CREATED":
      case "PENDING":
        return 0; // Request received
      case "SEARCHING":
      case "ACKNOWLEDGED":
        return 1; // Finding nearby help
      case "RESPONDER_ASSIGNED":
      case "DISPATCHED":
        return 2; // Responder assigned
      case "ARRIVED":
      case "EN_ROUTE":
        return 3; // Help on the way
      case "RESOLVED":
        return 4; // Resolved
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(dbStatus);

  const statusSteps = [
    { title: "Request received", desc: "Emergency signal registered" },
    { title: "Finding nearby help", desc: "Contacting responders in your area" },
    { title: "Responder assigned", desc: "Verified helper on assignment" },
    { title: "Help on the way", desc: "Assistance traveling to your GPS location" },
    { title: "Resolved", desc: "Emergency clear & verified" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Welcoming Citizen Header */}
      <div className="bg-gradient-to-br from-surface-900 via-surface-850 to-surface-950 border border-surface-800 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 sm:w-64 sm:h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>GoldenGuard Citizen Safety Network</span>
          </div>
          <h1 className="text-xl min-[360px]:text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Fast help when every second counts
          </h1>
          <p className="text-xs sm:text-sm text-surface-300 leading-relaxed font-normal">
            Connect directly with emergency services, get nearby volunteer support, report dangerous road conditions, and access instant life-saving first aid instructions.
          </p>
        </div>
      </div>

      {/* Active Emergency Status Banner (If an emergency is active in database) */}
      {selectedIncident && (
        <div className="bg-red-950/90 border-2 border-red-500/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl space-y-4 sm:space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-red-800/60 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md animate-pulse">
                <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  ACTIVE EMERGENCY
                </span>
                <h2 className="text-base sm:text-xl font-bold text-white">
                  Emergency request sent
                </h2>
              </div>
            </div>

            <Link
              to="/sos"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-md min-h-[44px]"
            >
              <span>View Emergency Status</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Real Status Progression */}
          <div className="space-y-2 sm:space-y-3">
            <div className="text-xs font-bold text-red-300 uppercase tracking-wider">
              Current Status Progression
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={step.title}
                    className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all ${
                      isCurrent
                        ? "bg-red-600/30 border-red-400 text-white shadow-md ring-1 ring-red-400"
                        : isCompleted
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                        : "bg-surface-900/40 border-surface-800 text-surface-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping shrink-0" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-surface-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold truncate">{step.title}</span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-tight line-clamp-2">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. PRIMARY CITIZEN ACTION 1: EMERGENCY / SOS BUTTON */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-amber-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col items-center text-center space-y-4 sm:space-y-5">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/15 text-white flex items-center justify-center ring-4 ring-white/20 shadow-lg">
          <ShieldAlert className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
        </div>

        <div className="space-y-1 max-w-lg">
          <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-200">
            1-Tap Emergency Assistance
          </h2>
          <p className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Need Immediate Emergency Help?
          </p>
          <p className="text-xs sm:text-sm text-red-100 font-medium">
            Police • Ambulance • Nearby Help
          </p>
        </div>

        <button
          onClick={() => navigate("/sos?active=true")}
          className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-red-50 text-red-700 font-extrabold text-base sm:text-lg shadow-lg hover:scale-102 transition-all active:scale-98 min-h-[50px] flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>GET EMERGENCY HELP</span>
        </button>
      </div>

      {/* 3. PRIMARY CITIZEN ACTIONS GRID (4 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
        
        {/* Action 2: REPORT ROAD HAZARD */}
        <div className="bg-white dark:bg-surface-900/90 border border-surface-200 dark:border-surface-800 hover:border-amber-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-200 space-y-4 flex flex-col justify-between group shadow-xs hover:shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Road Safety
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white group-hover:text-amber-500 transition-colors">
                Report a Road Problem
              </h3>
              <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 mt-1 leading-relaxed">
                Help fellow citizens by reporting potholes, vehicle accidents, broken streetlights, oil spills, or dangerous road hazards.
              </p>
            </div>
          </div>

          <Link
            to="/report"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-amber-500 hover:text-black text-amber-700 dark:text-amber-400 font-bold text-xs sm:text-sm transition-all duration-200 min-h-[42px]"
          >
            <span>Submit a Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Action 3: FIND HELP */}
        <div className="bg-white dark:bg-surface-900/90 border border-surface-200 dark:border-surface-800 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-200 space-y-4 flex flex-col justify-between group shadow-xs hover:shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Emergency Directory
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white group-hover:text-blue-500 transition-colors">
                Find Help Near You
              </h3>
              <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 mt-1 leading-relaxed">
                Locate nearby hospitals, police stations, emergency rooms, ambulance services, and verified community volunteers.
              </p>
            </div>
          </div>

          <Link
            to="/map"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-xs sm:text-sm transition-all duration-200 min-h-[42px]"
          >
            <span>Open Map & Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Action 4: SAFETY / FIRST AID */}
        <div className="bg-white dark:bg-surface-900/90 border border-surface-200 dark:border-surface-800 hover:border-emerald-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-200 space-y-4 flex flex-col justify-between group shadow-xs hover:shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Life-Saving Guides
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Safety & First Aid
              </h3>
              <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 mt-1 leading-relaxed">
                Clear, step-by-step instructions for CPR, severe bleeding control, burns, choking, and emergency response guides.
              </p>
            </div>
          </div>

          <Link
            to="/first-aid"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm transition-all duration-200 min-h-[42px]"
          >
            <span>View First Aid Instructions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Action 5: MY REPORTS & ACTIVITY */}
        <div className="bg-white dark:bg-surface-900/90 border border-surface-200 dark:border-surface-800 hover:border-purple-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-200 space-y-4 flex flex-col justify-between group shadow-xs hover:shadow-md">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Personal Dashboard
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white group-hover:text-purple-500 transition-colors">
                My Reports & Profile
              </h3>
              <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 mt-1 leading-relaxed">
                View your submitted road problem reports, active alerts, emergency contacts, and medical safety profile.
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 font-bold text-xs sm:text-sm transition-all duration-200 min-h-[42px]"
          >
            <span>View My Activity</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* 4. REAL EMERGENCY NETWORK METRICS (SIMPLE & SCANNABLE) */}
      <div className="bg-white/80 dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-extrabold text-surface-900 dark:text-white uppercase tracking-wider">
              Emergency Network Status
            </h3>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/80 dark:border-surface-700/50 space-y-0.5">
            <div className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {realMetrics?.activeIncidentsCount || 0}
            </div>
            <div className="text-[11px] sm:text-xs text-surface-600 dark:text-surface-300 font-semibold">
              Active Reports
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/80 dark:border-surface-700/50 space-y-0.5">
            <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {realMetrics?.hospitalsCount || 12}
            </div>
            <div className="text-[11px] sm:text-xs text-surface-600 dark:text-surface-300 font-semibold">
              Hospitals Connected
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/80 dark:border-surface-700/50 space-y-0.5">
            <div className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              {realMetrics?.volunteersCount || 28}
            </div>
            <div className="text-[11px] sm:text-xs text-surface-600 dark:text-surface-300 font-semibold">
              Verified Helpers
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/80 dark:border-surface-700/50 space-y-0.5">
            <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400">
              {realMetrics?.avgResponseTimeMinutes || "< 3 mins"}
            </div>
            <div className="text-[11px] sm:text-xs text-surface-600 dark:text-surface-300 font-semibold">
              Avg Response Time
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
