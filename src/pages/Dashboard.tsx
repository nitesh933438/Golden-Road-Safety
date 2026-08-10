import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldAlert, Activity, Users, AlertTriangle, 
  Map as MapIcon, Timer, Navigation, Bell, TrendingUp,
  HeartPulse, PhoneCall, ChevronRight,
  Radio, Clock, CheckCircle2, Award, Stethoscope, Sparkles, Building2, Car, Bike,
  Zap, AlertCircle, RefreshCw, WifiOff
} from "lucide-react";
import { useDemo } from "../context/DemoContext";
import { useOfflineSync } from "../context/OfflineSyncContext";
import { useIncidents } from "../context/IncidentContext";
import { EmergencySheet } from "../components/EmergencySheet";
import { Logo } from "../components/ui/Logo";

// Micro-component for Animated Number Counters
function MetricCounter({ value, isStatic = false }: { value: string | number; isStatic?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetNumber = typeof value === "string" ? parseInt(value.replace(/,/g, ""), 10) : value;

  useEffect(() => {
    if (isStatic || isNaN(targetNumber)) {
      return;
    }
    let start = 0;
    const end = targetNumber;
    if (start === end) return;

    const duration = 800; // milliseconds
    const incrementTime = Math.max(Math.floor(duration / end), 8);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 100); // chunk-wise increment for larger values
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, isStatic, targetNumber]);

  if (isStatic || isNaN(targetNumber)) {
    return <span>{value}</span>;
  }

  // Preserve decimal places or commas if present in the original string
  if (typeof value === "string" && value.includes(".")) {
    return <span>{value}</span>;
  }

  return <span>{displayValue.toLocaleString()}</span>;
}

export function Dashboard() {
  const { demoMode } = useDemo();
  const { isOnline } = useOfflineSync() || { isOnline: navigator.onLine };
  
  const { 
    activeIncidents, selectedIncident, setSelectedIncidentId, 
    formattedTimer, remainingSeconds, isTimerExpired, 
    realMetrics, isReconnecting 
  } = useIncidents();

  const [isEmergencySheetOpen, setIsEmergencySheetOpen] = useState(false);

  // SVG circular clock progress calculation based on real remainingSeconds (3600 seconds total)
  const sec = remainingSeconds !== null ? remainingSeconds : 0;
  const progressPercent = Math.min(100, Math.max(0, (sec / 3600) * 100));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Top Row: Core Command Metrics from real Firebase Data
  const topMetrics = [
    { 
      label: "Emergency Status", 
      value: isReconnecting ? "RECONNECTING" : (selectedIncident ? "ACTIVE SOS" : (isOnline ? "MONITORING" : "STANDBY")), 
      sub: selectedIncident ? `Incident: ${selectedIncident.id}` : (isOnline ? "Golden Hour Network Live" : "Local Sync Mode Active"), 
      icon: ShieldAlert, 
      color: selectedIncident ? "text-red-600 animate-pulse" : (isOnline ? "text-emerald-500" : "text-amber-500"), 
      bg: selectedIncident ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20",
      badge: selectedIncident ? "Active Incident" : "Live Monitor",
      isLive: true,
      isLoading: false
    },
    { 
      label: "Active Incidents", 
      value: demoMode ? "1" : realMetrics.activeIncidentsCount.toString(), 
      sub: demoMode ? "182 Rescued in Golden Hour" : "Real-time dispatch pipeline", 
      icon: Car, 
      color: "text-amber-500 dark:text-amber-400", 
      bg: "bg-amber-500/10 border-amber-500/20",
      badge: "Command Pipeline",
      isLive: !demoMode,
      isLoading: false
    },
    { 
      label: "Nearby Hospitals", 
      value: demoMode ? "12" : realMetrics.hospitalsCount.toString(), 
      sub: "Verified trauma corridors", 
      icon: Building2, 
      color: "text-emerald-500 dark:text-emerald-400", 
      bg: "bg-emerald-500/10 border-emerald-500/20",
      badge: "Connected Network",
      isLive: !demoMode,
      isLoading: false
    },
    { 
      label: "Volunteers Online", 
      value: demoMode ? "1,420" : realMetrics.volunteersCount.toString(), 
      sub: "Emergency ready network", 
      icon: Users, 
      color: "text-blue-500 dark:text-blue-400", 
      bg: "bg-blue-500/10 border-blue-500/20",
      badge: "Verified Samaritans",
      isLive: !demoMode,
      isLoading: false
    },
    { 
      label: "SOS Response Time", 
      value: demoMode ? "2.1 min" : realMetrics.avgResponseTimeMinutes, 
      sub: "First responder dispatch", 
      icon: Timer, 
      color: "text-purple-500 dark:text-purple-400", 
      bg: "bg-purple-500/10 border-purple-500/20",
      badge: "Optimal Benchmark",
      isLive: !demoMode,
      isLoading: false
    },
    { 
      label: "AI Triage Status", 
      value: "ACTIVE", 
      sub: "Gemini voice evaluation", 
      icon: Zap, 
      color: "text-cyan-500 dark:text-cyan-400", 
      bg: "bg-cyan-500/10 border-cyan-500/20",
      badge: "Triage Engine",
      isLive: true,
      isLoading: false
    },
  ];

  // Live Activities Feed
  const liveActivities = [
    { id: 1, title: "Volunteer Responded", detail: "Verified first responder dispatched to Sector 7 collision site.", time: "30s ago", icon: Users, color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
    { id: 2, title: "Trauma ICU Alerted", detail: "Emergency Trauma Corridor reserved ICU beds & surgical standby.", time: "2m ago", icon: Building2, color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
    { id: 3, title: "Patrol Dispatch System Link", detail: "Automated alert synchronized with Highway Patrol Unit 4.", time: "4m ago", icon: ShieldAlert, color: "text-red-400 bg-red-500/15 border-red-500/30" },
    { id: 4, title: "Road Hazard Tagged", detail: "Oil spill hazard flagged and verified on Ring Road flyover.", time: "7m ago", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/15 border-amber-500/30" },
    { id: 5, title: "New Certified Samaritan", detail: "Samaritan completed Level 3 Triage & CPR response training.", time: "11m ago", icon: Award, color: "text-purple-400 bg-purple-500/15 border-purple-500/30" },
  ];

  // Incident Timeline
  const activityTimeline = [
    { id: "t1", title: "SOS Beacon Activated", desc: "Sensor G-Force anomaly detected. Location payload dispatched.", time: "11:42 AM", status: "completed" },
    { id: "t2", title: "AI Voice Triage Active", desc: "Automated caller dispatch and incident categorization complete.", time: "11:43 AM", status: "completed" },
    { id: "t3", title: "Volunteer Responder En Route", desc: "Assigned nearby first responder navigates to hotspot.", time: "11:44 AM", status: "active" },
    { id: "t4", title: "Ambulance trauma reservation", desc: "Emergency ICU triage synchronization en-route.", time: "11:45 AM", status: "pending" },
  ];

  // Live Notifications
  const liveNotifications = [
    { id: "n1", title: "High Monsoon Hazard Warning", desc: "Waterlogging reported near Outer Ring Flyover. Dynamic route diversion active.", time: "5m ago", level: "warning" },
    { id: "n2", title: "Platform Incident Report Sync", desc: "98.4% success rate achieved across 142 emergency responses today.", time: "18m ago", level: "info" },
    { id: "n3", title: "Crash Sensor Pipeline Online", desc: "Automated fall detection monitor tracking 1,280 active rides.", time: "32m ago", level: "success" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12 relative z-10">
      
      {/* Tactical Emergency Command Center Ticker Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-surface-900/90 backdrop-blur-md border border-surface-200/80 dark:border-amber-500/30 text-xs font-mono shadow-md text-surface-800 dark:text-surface-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            LIVE RADAR FEED
          </div>
          <span className="text-amber-600 dark:text-amber-400 font-extrabold truncate tracking-tight">LOCAL EMERGENCY SYNC FREQUENCY: 148.85 MHz</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-surface-500 dark:text-surface-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            TRAFFIC CONTROL: <strong className="text-surface-900 dark:text-white font-black">SYNCED</strong>
          </span>
          <span className="flex items-center gap-1.5 hidden sm:inline-flex">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            SAMARITAN DISPATCH: <strong className="text-surface-900 dark:text-white font-black">100% ONLINE</strong>
          </span>
        </div>
      </div>

      {/* Hero Section with Beautiful Glassmorphism */}
      <section className="relative rounded-3xl overflow-hidden bg-white/70 dark:bg-surface-900/80 backdrop-blur-md text-surface-900 dark:text-white shadow-xl border border-surface-200/80 dark:border-amber-500/20 hover:border-surface-300 dark:hover:border-amber-500/30 transition-all duration-300">
        {/* Subtle geometric grid overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b0c_1px,transparent_1px),linear-gradient(to_bottom,#64748b0c_1px,transparent_1px)] dark:bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-amber-50/20 dark:from-surface-950/95 dark:via-surface-900/85 dark:to-amber-950/30 z-10 pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop')] bg-cover bg-center pointer-events-none" />
        
        <div className="relative z-20 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Logo size="sm" showWordmark={false} />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Golden Hour Response Protocol Active</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-surface-950 dark:text-white">
              AI-Powered Road Safety &{" "}
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-red-600 dark:from-amber-400 dark:via-amber-300 dark:to-red-400 bg-clip-text text-transparent">
                Golden Hour Response Platform
              </span>
            </h1>
            
            <p className="text-sm text-surface-600 dark:text-surface-300 max-w-2xl leading-relaxed">
              India's real-time emergency triage, volunteer dispatch, and hospital trauma coordination system designed to save lives when seconds matter.
            </p>

            {/* Platform Quick Action Corridor */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => setIsEmergencySheetOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.4)] group hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Start Emergency
              </button>

              <Link 
                to="/saferide"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-extrabold text-sm transition-all shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bike className="w-4.5 h-4.5 fill-current" />
                SafeRide Guardian
              </Link>

              <Link 
                to="/first-aid"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700/85 backdrop-blur-md border border-surface-200 dark:border-surface-750 text-surface-900 dark:text-white rounded-2xl font-bold text-sm transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <Stethoscope className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400" />
                AI First Aid
              </Link>

              <Link 
                to="/map"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40 rounded-2xl font-bold text-sm transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <MapIcon className="w-4.5 h-4.5" />
                Smart Map
              </Link>
            </div>
          </div>
          
          {/* Futuristic Rounded SVG Countdown Clock */}
          <div className="shrink-0 bg-white/90 dark:bg-surface-950/90 border border-surface-200 dark:border-amber-500/35 p-5 rounded-3xl text-center min-w-[260px] shadow-lg flex flex-col justify-center items-center relative group hover:border-amber-500/50 transition-colors">
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {selectedIncident ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500 text-white animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  LIVE SOS
                </span>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </div>
            
            <div className="relative w-32 h-32 flex items-center justify-center my-1">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background track circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-surface-200 dark:stroke-surface-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Progress countdown track circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className={`${isTimerExpired ? 'stroke-red-600' : 'stroke-amber-500 dark:stroke-amber-400'} transition-all duration-1000`}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              {/* Centered digits */}
              <div className="absolute flex flex-col items-center justify-center px-2 text-center">
                <span className={`text-2xl font-black font-mono tracking-tight tabular-nums ${isTimerExpired ? 'text-red-600 animate-pulse' : 'text-surface-950 dark:text-white'}`}>
                  {formattedTimer}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-surface-400 dark:text-surface-500 mt-0.5">
                  {isTimerExpired ? "EXPIRED" : (selectedIncident ? "GOLDEN HOUR" : "STANDBY TIMER")}
                </span>
              </div>
            </div>

            {/* Active Incident Selector Dropdown if multiple active incidents exist */}
            {activeIncidents.length > 1 && (
              <div className="w-full mt-2">
                <select
                  value={selectedIncident?.id || ""}
                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                  className="w-full bg-surface-100 dark:bg-surface-800 text-xs font-bold text-surface-900 dark:text-white px-2 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 focus:outline-none"
                >
                  {activeIncidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      Incident {inc.id.slice(-6)} ({inc.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-800/80 flex items-center justify-between w-full text-xs text-surface-500 dark:text-surface-400 font-medium">
              <span>Avg Dispatch: <strong className="text-surface-950 dark:text-white font-bold">{realMetrics.avgResponseTimeMinutes}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                OPTIMAL
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TOP ROW: Live Status Metrics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            National Command Center Real-Time Status
          </h2>
          <div className="flex items-center gap-2">
            {demoMode ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3.5 h-3.5" /> Demo Sandbox Active
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Firestore Database Sync
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {topMetrics.map((metric, i) => {
            const IconComp = metric.icon;
            
            return (
              <div 
                key={i} 
                className="bg-white/80 dark:bg-surface-900/75 backdrop-blur-md p-4 rounded-2xl border border-surface-200/80 dark:border-surface-800 hover:border-amber-500/30 shadow-sm hover:shadow-md flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${metric.bg} ${metric.color} shrink-0`}>
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border border-surface-200/60 dark:border-surface-700/60">
                    {metric.badge}
                  </span>
                </div>

                {metric.isLoading ? (
                  <div className="space-y-2 py-1">
                    <div className="h-5 w-16 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-surface-100 dark:bg-surface-850 rounded animate-pulse" />
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-black text-surface-950 dark:text-white tracking-tight leading-none mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {metric.value === "UNAVAILABLE" ? (
                        <span className="text-xs text-red-500 font-bold">Data unavailable</span>
                      ) : metric.value === "OFFLINE" ? (
                        <span className="text-xs text-amber-500 font-bold">Offline</span>
                      ) : (
                        <MetricCounter value={metric.value || 0} isStatic={typeof metric.value === "string" && (metric.value.includes("ICU") || metric.value.includes("ACTIVE") || metric.value.includes("STANDBY") || metric.value.includes("ONLINE"))} />
                      )}
                    </div>
                    <div className="text-xs font-bold text-surface-700 dark:text-surface-200 truncate">{metric.label}</div>
                    <div className="text-[10px] text-surface-400 dark:text-surface-400 truncate mt-0.5">{metric.sub}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* MIDDLE ROW: Smart Map Preview, Quick Actions, Live Traffic, Trauma Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Tactical Incident Map Preview Card */}
        <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-3xl p-4 border border-surface-200/80 dark:border-surface-800 hover:border-amber-500/30 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-sm text-surface-900 dark:text-white">Smart Incident Map</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-500/20 animate-pulse">
              {demoMode ? "12 Active Pins" : "Live Scanner"}
            </span>
          </div>

          <div className="relative h-36 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700/80 group-hover:border-amber-500/50 transition-colors">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity dark:opacity-30 group-hover:scale-105 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-950 via-transparent to-transparent"></div>
            
            {/* Live Map Radar Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 bg-amber-500/30 rounded-full animate-ping"></div>
                <div className="w-6 h-6 bg-amber-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-black font-black text-[9px]">
                  SOS
                </div>
              </div>
            </div>

            <div className="absolute bottom-2 left-2 right-2 text-[10px] text-surface-700 dark:text-surface-300 bg-white/90 dark:bg-surface-950/80 backdrop-blur-md p-1.5 rounded-xl border border-surface-200 dark:border-surface-800 flex justify-between items-center">
              <span>National Safety Corridor</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Active</span>
            </div>
          </div>

          <Link 
            to="/map" 
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            Launch Interactive Map
          </Link>
        </div>

        {/* 2. Quick Actions Panel */}
        <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-3xl p-4 border border-surface-200/80 dark:border-surface-800 hover:border-amber-500/30 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-sm text-surface-900 dark:text-white">Emergency Hub</h3>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <button 
              onClick={() => setIsEmergencySheetOpen(true)}
              className="w-full p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-500/20 text-red-700 dark:text-white font-extrabold text-xs flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                Dispatch Golden Hour SOS
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            </button>

            <Link 
              to="/saferide" 
              className="w-full p-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-white font-extrabold text-xs flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                SafeRide Crash Guardian
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            </Link>

            <Link 
              to="/first-aid" 
              className="w-full p-2.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-white font-extrabold text-xs flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                AI First Aid Assistant
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            </Link>

            <Link 
              to="/report" 
              className="w-full p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 font-bold text-xs flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Report Road Hazard
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            </Link>
          </div>
        </div>

        {/* 3. Live Traffic & Road Hazard Status */}
        <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-3xl p-4 border border-surface-200/80 dark:border-surface-800 hover:border-amber-500/30 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-sm text-surface-900 dark:text-white">Live Road Hazards</h3>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
              {demoMode ? "12 Cities" : "Live Tracker"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/70 border border-surface-150 dark:border-surface-700/70 space-y-1">
              <div className="flex justify-between font-bold text-surface-900 dark:text-white">
                <span>NH-48 Expressway</span>
                <span className="text-amber-600 dark:text-amber-400">Rain Hazard</span>
              </div>
              <p className="text-[10px] text-surface-500 dark:text-surface-400">Waterlogging near runway flyover. Patrol units notified.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/70 border border-surface-150 dark:border-surface-700/70 space-y-1">
              <div className="flex justify-between font-bold text-surface-900 dark:text-white">
                <span>Outer Ring Road</span>
                <span className="text-red-500">Crash Blocked</span>
              </div>
              <p className="text-[10px] text-surface-500 dark:text-surface-400">Two-wheeler collision reported. Volunteers on scene.</p>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-surface-500 dark:text-surface-400 font-medium">
            <span>Radar Scan: Running</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Auto-Sync On</span>
          </div>
        </div>

        {/* 4. Connected Emergency Trauma Care */}
        <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-3xl p-4 border border-surface-200/80 dark:border-surface-800 hover:border-amber-500/30 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <h3 className="font-extrabold text-sm text-surface-900 dark:text-white">Trauma ICU Registry</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase">
              100% Synced
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-150 dark:border-surface-700/60">
              <span className="font-bold text-surface-800 dark:text-surface-200">AIIMS Trauma Bay</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">12 Beds Ready</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-150 dark:border-surface-700/60">
              <span className="font-bold text-surface-800 dark:text-surface-200">Max Super Specialty</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">8 Beds Ready</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-150 dark:border-surface-700/60">
              <span className="font-bold text-surface-800 dark:text-surface-200">Fortis Memorial</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">6 Beds Ready</span>
            </div>
          </div>

          <Link to="/wallet" className="text-center text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors flex items-center justify-center gap-1">
            <span>View Medical IDs & Cards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>

      {/* BOTTOM ROW: Recent Operations, Activity Timeline, Notifications */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Live Operations stream */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-3xl p-5 border border-surface-200/80 dark:border-surface-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <h3 className="font-black text-base text-surface-900 dark:text-white">Active Dispatch Stream</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                Responders Active
              </span>
            </div>

            <div className="space-y-2.5">
              {liveActivities.map((act) => {
                const IconComp = act.icon;
                return (
                  <div 
                    key={act.id} 
                    className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-150 dark:border-surface-700/60 flex items-start gap-3 hover:bg-surface-100/60 dark:hover:bg-surface-800/80 transition-all duration-200"
                  >
                    <div className={`p-2 rounded-xl bg-surface-100 dark:bg-surface-700/50 text-surface-700 dark:text-white shrink-0 mt-0.5 border border-surface-200 dark:border-surface-600`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-surface-900 dark:text-white truncate">{act.title}</h4>
                        <span className="text-[10px] font-bold text-surface-400 shrink-0 ml-2">{act.time}</span>
                      </div>
                      <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">{act.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-3xl p-5 border border-surface-200/80 dark:border-surface-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-base text-surface-900 dark:text-white">Incident Response Flow</h3>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Sector 7 Case #892</span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200 dark:before:bg-surface-800">
              {activityTimeline.map((item) => (
                <div key={item.id} className="relative flex items-start justify-between gap-4">
                  <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-surface-900 ${
                    item.status === "completed" ? "bg-emerald-500 ring-4 ring-emerald-500/10" :
                    item.status === "active" ? "bg-amber-500 ring-4 ring-amber-500/20 animate-pulse" : "bg-surface-300 dark:bg-surface-700"
                  }`} />
                  <div>
                    <h4 className={`text-xs font-extrabold ${item.status === "completed" ? "text-surface-900 dark:text-white" : item.status === "active" ? "text-amber-600 dark:text-amber-400" : "text-surface-400"}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-surface-500 dark:text-surface-300 mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono text-surface-400 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Broadcast warnings & impact metrics */}
        <div className="space-y-6">
          
          <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-3xl p-5 border border-surface-200/80 dark:border-surface-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-base text-surface-900 dark:text-white">Emergency Bulletins</h3>
              </div>
              <Link to="/notifications" className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {liveNotifications.map((note) => (
                <div 
                  key={note.id} 
                  className={`p-3 rounded-2xl border ${
                    note.level === "warning" ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300" :
                    note.level === "success" ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300" :
                    "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-black">
                    <span>{note.title}</span>
                    <span className="text-[9px] font-normal opacity-80">{note.time}</span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-1 leading-relaxed">{note.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Hour Impact statistics */}
          <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-3xl p-5 border border-surface-200/80 dark:border-surface-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-base text-surface-900 dark:text-white">Golden Hour Impact</h3>
              </div>
              <Link to="/impact" className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                Impact Dashboard
              </Link>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-surface-700 dark:text-surface-200 mb-1">
                  <span>Golden Hour Rescue Rate</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">98.4%</span>
                </div>
                <div className="w-full bg-surface-100 dark:bg-surface-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full" style={{ width: "98.4%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-surface-700 dark:text-surface-200 mb-1">
                  <span>Volunteer Coverage Ratio</span>
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold font-mono">89.2%</span>
                </div>
                <div className="w-full bg-surface-100 dark:bg-surface-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full" style={{ width: "89.2%" }}></div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                ⚡ Over <strong className="text-surface-900 dark:text-white font-black">{demoMode ? "182 victims" : "Verified victims"}</strong> safely evacuated inside the critical 60-minute Golden Hour response window today.
              </div>
            </div>
          </div>

        </div>

      </section>

      <EmergencySheet isOpen={isEmergencySheetOpen} onClose={() => setIsEmergencySheetOpen(false)} />
    </div>
  );
}
