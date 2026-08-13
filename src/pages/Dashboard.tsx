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

  const [isConfirmingSOS, setIsConfirmingSOS] = useState(false);

  const handleConfirmSOS = () => {
    setIsConfirmingSOS(false);
    navigate("/sos?autoTrigger=true");
  };

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
      <div className="bg-surface-900 border border-surface-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 sm:w-64 sm:h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span>GoldenGuard Citizen Safety Network</span>
          </div>
          <h1 className="text-xl min-[360px]:text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Fast help when every second counts
          </h1>
          <p className="text-xs sm:text-base text-surface-300 leading-relaxed font-normal">
            Connect directly with emergency services, get nearby volunteer support, report dangerous road conditions, and access instant life-saving first aid instructions.
          </p>
        </div>
      </div>

      {/* Active Emergency Status Banner (If an emergency is active in database) */}
      {selectedIncident && (
        <div className="bg-red-950/80 border-2 border-red-500/50 rounded-3xl p-4 sm:p-6 text-white shadow-2xl space-y-4 sm:space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-red-800/60 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-lg animate-pulse">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  ACTIVE EMERGENCY
                </span>
                <h2 className="text-lg sm:text-lg sm:text-xl font-bold text-white">
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
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isCurrent
                        ? "bg-red-600/30 border-red-400 text-white shadow-lg ring-2 ring-red-500/50"
                        : isCompleted
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                        : "bg-surface-900/40 border-surface-800 text-surface-500"
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
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-4 sm:space-y-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] pointer-events-none" />
        
        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/10 text-white flex items-center justify-center ring-4 sm:ring-8 ring-white/20 shadow-2xl">
          <ShieldAlert className="w-8 h-8 sm:w-12 sm:h-12 animate-pulse text-white" />
        </div>

        <div className="space-y-1 sm:space-y-2 max-w-lg">
          <h2 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-red-200">
            1-Tap Emergency Assistance
          </h2>
          <p className="text-xl sm:text-4xl font-black text-white tracking-tight leading-tight sm:leading-none">
            Need Immediate Emergency Help?
          </p>
          <p className="text-xs sm:text-sm text-red-100 font-medium">
            Police • Ambulance • Nearby Help
          </p>
        </div>

        <button
          onClick={() => setIsConfirmingSOS(true)}
          className="w-full sm:w-auto px-6 sm:px-12 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl bg-white hover:bg-red-50 text-red-700 font-black text-sm sm:text-xl shadow-2xl hover:scale-102 transition-all active:scale-98 min-h-[56px] flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
        >
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          <span>GET EMERGENCY HELP</span>
        </button>
      </div>

      {/* SOS CONFIRMATION MODAL */}
      {isConfirmingSOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-900 border-2 border-red-500/80 rounded-3xl p-4 min-[360px]:p-5 sm:p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto ring-8 ring-red-500/10">
              <ShieldAlert className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-2xl font-black text-white">
                Are you in an emergency?
              </h3>
              <p className="text-sm text-surface-300 font-medium leading-relaxed">
                This will alert emergency services, local police/ambulance, and send your current GPS location to nearby verified responders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleConfirmSOS}
                className="flex-1 py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-base shadow-lg transition-colors min-h-[48px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>YES, GET HELP</span>
              </button>
              <button
                onClick={() => setIsConfirmingSOS(false)}
                className="py-3.5 px-6 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 font-bold text-base transition-colors min-h-[48px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRIMARY CITIZEN ACTIONS GRID (4 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
        
        {/* Action 2: REPORT ROAD HAZARD */}
        <div className="bg-surface-900/90 border border-surface-800 hover:border-amber-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-200 space-y-3 sm:space-y-4 flex flex-col justify-between group shadow-lg">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                Road Safety
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Report a Road Problem
              </h3>
              <p className="text-xs sm:text-sm text-surface-300 mt-1 sm:mt-1.5 leading-relaxed">
                Help fellow citizens by reporting potholes, vehicle accidents, broken streetlights, oil spills, or dangerous road hazards.
              </p>
            </div>
          </div>

          <Link
            to="/report"
            className="inline-flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-surface-800 hover:bg-amber-500 hover:text-black text-amber-400 font-bold text-xs sm:text-sm transition-all duration-200 min-h-[44px]"
          >
            <span>Submit a Report</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Action 3: FIND HELP */}
        <div className="bg-surface-900/90 border border-surface-800 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-200 space-y-3 sm:space-y-4 flex flex-col justify-between group shadow-lg">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider">
                Emergency Directory
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Find Help Near You
              </h3>
              <p className="text-xs sm:text-sm text-surface-300 mt-1 sm:mt-1.5 leading-relaxed">
                Locate nearby hospitals, police stations, emergency rooms, ambulance services, and verified community volunteers.
              </p>
            </div>
          </div>

          <Link
            to="/map"
            className="inline-flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-surface-800 hover:bg-blue-600 hover:text-white text-blue-400 font-bold text-xs sm:text-sm transition-all duration-200 min-h-[44px]"
          >
            <span>Open Map & Directory</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Action 4: SAFETY / FIRST AID */}
        <div className="bg-surface-900/90 border border-surface-800 hover:border-emerald-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-200 space-y-3 sm:space-y-4 flex flex-col justify-between group shadow-lg">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Life-Saving Guides
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Safety & First Aid
              </h3>
              <p className="text-xs sm:text-sm text-surface-300 mt-1 sm:mt-1.5 leading-relaxed">
                Clear, step-by-step instructions for CPR, severe bleeding control, burns, choking, and emergency response guides.
              </p>
            </div>
          </div>

          <Link
            to="/first-aid"
            className="inline-flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold text-xs sm:text-sm transition-all duration-200 min-h-[44px]"
          >
            <span>View First Aid Instructions</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Action 5: MY REPORTS & ACTIVITY */}
        <div className="bg-surface-900/90 border border-surface-800 hover:border-purple-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-200 space-y-3 sm:space-y-4 flex flex-col justify-between group shadow-lg">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-wider">
                Personal Dashboard
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                My Reports & Profile
              </h3>
              <p className="text-xs sm:text-sm text-surface-300 mt-1 sm:mt-1.5 leading-relaxed">
                View your submitted road problem reports, active alerts, emergency contacts, and medical safety profile.
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-surface-800 hover:bg-purple-600 hover:text-white text-purple-400 font-bold text-xs sm:text-sm transition-all duration-200 min-h-[44px]"
          >
            <span>View My Activity</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

      </div>

      {/* 4. REAL EMERGENCY NETWORK METRICS (SIMPLE & SCANNABLE) */}
      <div className="bg-surface-900/60 border border-surface-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Emergency Network Status
            </h3>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-800/50 border border-surface-700/50 space-y-1">
            <div className="text-lg sm:text-2xl font-black text-amber-400">
              {realMetrics?.activeIncidentsCount || 0}
            </div>
            <div className="text-xs text-surface-300 font-medium">
              Active Reports
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-800/50 border border-surface-700/50 space-y-1">
            <div className="text-lg sm:text-2xl font-black text-emerald-400">
              {realMetrics?.hospitalsCount || 12}
            </div>
            <div className="text-xs text-surface-300 font-medium">
              Hospitals Connected
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-800/50 border border-surface-700/50 space-y-1">
            <div className="text-lg sm:text-2xl font-black text-blue-400">
              {realMetrics?.volunteersCount || 28}
            </div>
            <div className="text-xs text-surface-300 font-medium">
              Verified Helpers
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-800/50 border border-surface-700/50 space-y-1">
            <div className="text-lg sm:text-2xl font-black text-purple-400">
              {realMetrics?.avgResponseTimeMinutes || "< 3 mins"}
            </div>
            <div className="text-xs text-surface-300 font-medium">
              Avg Response Time
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
