import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { 
  ShieldAlert, Activity, Users, AlertTriangle, 
  Map as MapIcon, Timer, Navigation, 
  HeartPulse, PhoneCall, ChevronRight,
  Radio, Clock, CheckCircle2, ShieldCheck, Award, Stethoscope, Sparkles, Building2, Car, Bike, Shield as ShieldIcon,
  Bell, TrendingUp, Zap, AlertCircle, Eye, ArrowUpRight, Check, Compass, RadioTower
} from "lucide-react";
import { EmergencySheet } from "../components/EmergencySheet";

export function Dashboard() {
  const { demoMode } = useOutletContext<{ demoMode: boolean }>() || { demoMode: true };
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes countdown
  const [isEmergencySheetOpen, setIsEmergencySheetOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Top Row: 6 Core Status Metrics
  const topMetrics = [
    { 
      label: "Emergency Status", 
      value: "ACTIVE", 
      sub: "Golden Hour Network Live", 
      icon: ShieldAlert, 
      color: "text-red-400", 
      bg: "bg-red-500/10 border-red-500/30",
      badge: "Normal Triage"
    },
    { 
      label: "Active Incidents", 
      value: demoMode ? "189" : "142", 
      sub: "182 Rescued in Golden Hour", 
      icon: Car, 
      color: "text-amber-400", 
      bg: "bg-amber-500/10 border-amber-500/30",
      badge: "Today"
    },
    { 
      label: "Nearby Hospitals", 
      value: demoMode ? "480 Beds" : "320 Beds", 
      sub: "18 Trauma ICUs ready", 
      icon: Building2, 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10 border-emerald-500/30",
      badge: "Connected"
    },
    { 
      label: "Volunteers Online", 
      value: demoMode ? "1,420" : "890", 
      sub: "Ready across 12 Metros", 
      icon: Users, 
      color: "text-blue-400", 
      bg: "bg-blue-500/10 border-blue-500/30",
      badge: "On-Duty"
    },
    { 
      label: "SOS Response Time", 
      value: demoMode ? "2.1 min" : "4.2 min", 
      sub: "78% faster than avg", 
      icon: Timer, 
      color: "text-amber-400", 
      bg: "bg-amber-500/10 border-amber-500/30",
      badge: "Optimal"
    },
    { 
      label: "AI Triage Status", 
      value: "OPERATIONAL", 
      sub: "Gemini Voice Triage Active", 
      icon: Zap, 
      color: "text-purple-400", 
      bg: "bg-purple-500/10 border-purple-500/30",
      badge: "100% Online"
    },
  ];

  // Live Activities Feed
  const liveActivities = [
    { id: 1, title: "Volunteer Accepted SOS", detail: "Vol. Rahul Verma (0.4 km away) dispatched to Sector 7 collision site.", time: "30s ago", icon: Users, color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
    { id: 2, title: "Trauma ICU Reserved", detail: "Max Super Specialty Hospital (Trauma Bay 2) reserved ICU & blood reserve.", time: "2m ago", icon: Building2, color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
    { id: 3, title: "Police Patrol Dispatched", detail: "Highway Patrol Unit 4 en-route to NH-48 Km 14 for accident scene cordon.", time: "4m ago", icon: ShieldAlert, color: "text-red-400 bg-red-500/15 border-red-500/30" },
    { id: 4, title: "Road Hazard Verified", detail: "Oil spill hazard verified on Ring Road flyover by 3 citizen responders.", time: "7m ago", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/15 border-amber-500/30" },
    { id: 5, title: "New CPR Certificate Earned", detail: "Vol. Rajesh Sharma completed Level 3 Advanced CPR & Triage assessment.", time: "11m ago", icon: Award, color: "text-purple-400 bg-purple-500/15 border-purple-500/30" },
  ];

  // Incident Timeline
  const activityTimeline = [
    { id: "t1", title: "SOS Beacon Activated", desc: "Crash sensor detected high-impact G-force at Outer Ring Rd.", time: "11:42 AM", status: "completed" },
    { id: "t2", title: "AI Triage Dispatch", desc: "Automated alert broadcast to nearby 3 hospitals & 12 volunteers.", time: "11:43 AM", status: "completed" },
    { id: "t3", title: "Volunteer First Responder En Route", desc: "Rahul V. confirmed navigation. ETA 2.4 minutes.", time: "11:44 AM", status: "active" },
    { id: "t4", title: "Ambulance & Police Coordination", desc: "State Medical Emergency Service unit assigned.", time: "11:45 AM", status: "pending" },
  ];

  // Live Notifications
  const liveNotifications = [
    { id: "n1", title: "Monsoon Road Hazard Alert", desc: "Heavy waterlogging near Dhaula Kuan underpass. Rerouted 4 rescue units.", time: "5m ago", level: "warning" },
    { id: "n2", title: "Golden Hour Success Rate: 98.4%", desc: "Monthly milestone reached in NCR corridor. 142 lives saved.", time: "18m ago", level: "info" },
    { id: "n3", title: "SafeRide Crash Sensor Online", desc: "Automatic fall detection active on 1,280 active two-wheeler rides.", time: "32m ago", level: "success" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Tactical Emergency Command Center Ticker Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-2xl bg-surface-900/90 backdrop-blur-xl border border-amber-500/30 text-xs font-mono shadow-lg shadow-black/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            LIVE COMMAND FEED
          </div>
          <span className="text-amber-400 font-bold truncate">DELHI NCR METRO EMERGENCY DISPATCH FREQUENCY: 148.85 MHz</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-surface-400 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            POLICE / TRAFFIC SYNC: <strong className="text-white">ONLINE</strong>
          </span>
          <span className="flex items-center gap-1 hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            108 AMBULANCE DISPATCH: <strong className="text-white">100% READY</strong>
          </span>
        </div>
      </div>

      {/* Compact Glassmorphism Hero Section (Height reduced by ~40%) */}
      <section className="relative rounded-3xl overflow-hidden bg-surface-900/80 backdrop-blur-xl text-white shadow-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
        {/* Tactical Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b0a_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        {/* Subtle Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950/95 via-surface-900/85 to-amber-950/30 z-10 pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop')] bg-cover bg-center pointer-events-none" />
        
        <div className="relative z-20 p-5 sm:p-7 lg:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 text-black rounded-xl shadow-lg ring-2 ring-amber-500/40 shrink-0">
                <ShieldIcon className="w-5 h-5" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                Golden Hour Emergency Network Active
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
              AI-Powered Road Safety &{" "}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-red-400 bg-clip-text text-transparent">
                Golden Hour Response Platform
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-surface-300 max-w-2xl leading-relaxed">
              India's real-time emergency triage, volunteer dispatch, and hospital trauma coordination system designed to save lives when seconds matter.
            </p>

            {/* Compact Action Bar */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button 
                onClick={() => setIsEmergencySheetOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-black text-xs sm:text-sm transition-all shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.6)] group hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Start Emergency
              </button>

              <Link 
                to="/saferide"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02]"
              >
                <Bike className="w-4 h-4 fill-current" />
                SafeRide Guardian
              </Link>

              <Link 
                to="/first-aid"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-800/80 hover:bg-surface-700/80 backdrop-blur-md border border-surface-700/80 text-white rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02]"
              >
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                AI First Aid
              </Link>

              <Link 
                to="/map"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02]"
              >
                <MapIcon className="w-4 h-4 text-amber-400" />
                Smart Map
              </Link>
            </div>
          </div>
          
          {/* Compact Golden Hour Countdown Card */}
          <div className="shrink-0 bg-surface-950/90 backdrop-blur-xl border border-amber-500/40 p-4 sm:p-5 rounded-2xl text-center min-w-[220px] shadow-2xl flex flex-col justify-center items-center relative group">
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Timer className="w-5 h-5 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">Golden Hour Clock</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight font-mono my-1 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              {formatTime(timeLeft)}
            </div>
            <div className="mt-2 pt-2 border-t border-surface-800/80 flex items-center justify-between w-full text-[11px] text-surface-400 font-medium gap-3">
              <span>Avg Dispatch: <strong className="text-white">{demoMode ? "2.1m" : "4.2m"}</strong></span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Optimal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TOP ROW: Emergency & Command Center Status Metrics (6 Grid Columns) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            National Command Center Real-Time Status
          </h2>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Syncing
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {topMetrics.map((metric, i) => {
            const IconComp = metric.icon;
            return (
              <div 
                key={i} 
                className="bg-surface-900/75 backdrop-blur-xl p-4 rounded-2xl border border-surface-800 hover:border-amber-500/30 shadow-lg shadow-black/20 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${metric.bg} ${metric.color} border shrink-0`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-800 text-surface-300 border border-surface-700/60">
                    {metric.badge}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-black text-white tracking-tight leading-none mb-1 group-hover:text-amber-400 transition-colors">
                    {metric.value}
                  </div>
                  <div className="text-xs font-bold text-surface-200 truncate">{metric.label}</div>
                  <div className="text-[10px] text-surface-400 truncate mt-0.5">{metric.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MIDDLE ROW: Smart Map Preview, Quick Actions, Live Traffic Status, Emergency Dispatch */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Smart Incident Map Preview Card */}
        <div className="bg-surface-900/80 backdrop-blur-xl rounded-3xl p-4 border border-surface-800 hover:border-amber-500/30 shadow-xl shadow-black/30 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-amber-400" />
              <h3 className="font-extrabold text-sm text-white">Smart Incident Map</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-500/30 animate-pulse">
              12 Active Pins
            </span>
          </div>

          <div className="relative h-36 rounded-2xl overflow-hidden border border-surface-700/80 group-hover:border-amber-500/50 transition-colors">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-900/40 to-transparent"></div>
            
            {/* Live Map Radar Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 bg-amber-500/30 rounded-full animate-ping"></div>
                <div className="w-5 h-5 bg-amber-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-black font-black text-[9px]">
                  SOS
                </div>
              </div>
            </div>

            <div className="absolute bottom-2 left-2 right-2 text-[10px] text-surface-300 bg-surface-950/80 backdrop-blur-md p-1.5 rounded-xl border border-surface-800 flex justify-between items-center">
              <span>Sector 7 Hospital Corridor</span>
              <span className="text-emerald-400 font-bold">1.2 km away</span>
            </div>
          </div>

          <Link 
            to="/map" 
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            Launch Full Interactive Map
          </Link>
        </div>

        {/* 2. Quick Actions Panel */}
        <div className="bg-surface-900/80 backdrop-blur-xl rounded-3xl p-4 border border-surface-800 hover:border-amber-500/30 shadow-xl shadow-black/30 flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Emergency Quick Actions</h3>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <button 
              onClick={() => setIsEmergencySheetOpen(true)}
              className="w-full p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-white font-extrabold text-xs flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                Dispatch Golden Hour SOS
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            </button>

            <Link 
              to="/saferide" 
              className="w-full p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-white font-extrabold text-xs flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                SafeRide Crash Guardian
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            </Link>

            <Link 
              to="/first-aid" 
              className="w-full p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-white font-extrabold text-xs flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                AI Voice First Aid Triage
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            </Link>

            <Link 
              to="/report" 
              className="w-full p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700/80 text-surface-200 font-bold text-xs flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Report Hazard / Accident
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            </Link>
          </div>
        </div>

        {/* 3. Live Traffic & Road Hazard Status */}
        <div className="bg-surface-900/80 backdrop-blur-xl rounded-3xl p-4 border border-surface-800 hover:border-amber-500/30 shadow-xl shadow-black/30 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RadioTower className="w-4 h-4 text-amber-400" />
              <h3 className="font-extrabold text-sm text-white">Live Traffic & Hazards</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400">12 Metros</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-800/70 border border-surface-700/70 space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>NH-48 Expressway</span>
                <span className="text-amber-400">Moderate Traffic</span>
              </div>
              <p className="text-[10px] text-surface-400">Average rescue speed: 45 km/h. Clear ambulance lane.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-800/70 border border-surface-700/70 space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>Outer Ring Flyover</span>
                <span className="text-red-400">Hazard Verified</span>
              </div>
              <p className="text-[10px] text-surface-400">Oil slick hazard flagged. Responders deployed.</p>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-surface-400 font-medium">
            <span>Radar Scan: Active</span>
            <span className="text-amber-400 font-bold">Auto-Rerouting On</span>
          </div>
        </div>

        {/* 4. Emergency Trauma & Dispatch Readiness */}
        <div className="bg-surface-900/80 backdrop-blur-xl rounded-3xl p-4 border border-surface-800 hover:border-amber-500/30 shadow-xl shadow-black/30 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-white">Trauma & ICU Dispatch</h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
              100% Ready
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-800/60 border border-surface-700/60">
              <span className="font-bold text-surface-200">AIIMS Trauma Bay</span>
              <span className="font-mono text-emerald-400 font-bold">12 Beds Free</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-800/60 border border-surface-700/60">
              <span className="font-bold text-surface-200">Max Super Specialty</span>
              <span className="font-mono text-emerald-400 font-bold">8 Beds Free</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-800/60 border border-surface-700/60">
              <span className="font-bold text-surface-200">Highway Patrol Units</span>
              <span className="font-mono text-blue-400 font-bold">24 Active</span>
            </div>
          </div>

          <Link to="/wallet" className="text-center text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1">
            <span>View Medical Wallet Cards</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

      </section>

      {/* BOTTOM ROW: Recent Operations, Activity Timeline, Notifications, Analytics Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Operations Activity Stream & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Operations Feed */}
          <div className="bg-surface-900/80 backdrop-blur-xl rounded-3xl p-5 border border-surface-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <h3 className="font-black text-base text-white">Live Operations Activity Stream</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                5 Live Events
              </span>
            </div>

            <div className="space-y-2.5">
              {liveActivities.map((act) => {
                const IconComp = act.icon;
                return (
                  <div 
                    key={act.id} 
                    className="p-3.5 rounded-2xl bg-surface-800/50 border border-surface-700/60 flex items-start gap-3 hover:bg-surface-800/80 transition-colors"
                  >
                    <div className={`p-2 rounded-xl ${act.color} shrink-0 mt-0.5 border`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-white truncate">{act.title}</h4>
                        <span className="text-[10px] font-bold text-surface-400 shrink-0 ml-2">{act.time}</span>
                      </div>
                      <p className="text-xs text-surface-300 leading-relaxed">{act.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-surface-900/80 backdrop-blur-xl rounded-3xl p-5 border border-surface-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-base text-white">Incident Response Timeline</h3>
              </div>
              <span className="text-xs font-bold text-amber-400">Sector 7 Case #892</span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-800">
              {activityTimeline.map((item) => (
                <div key={item.id} className="relative flex items-start justify-between gap-4">
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-surface-900 ${
                    item.status === "completed" ? "bg-emerald-400 ring-2 ring-emerald-500/30" :
                    item.status === "active" ? "bg-amber-400 ring-2 ring-amber-500/50 animate-ping" : "bg-surface-700"
                  }`} />
                  <div>
                    <h4 className={`text-xs font-extrabold ${item.status === "completed" ? "text-white" : item.status === "active" ? "text-amber-400" : "text-surface-400"}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-surface-300 mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono text-surface-400 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Notifications & Analytics Summary */}
        <div className="space-y-6">
          
          {/* Live Alerts & Notifications */}
          <div className="bg-surface-900/80 backdrop-blur-xl rounded-3xl p-5 border border-surface-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-base text-white">Live Broadcast Alerts</h3>
              </div>
              <Link to="/notifications" className="text-[11px] font-bold text-amber-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {liveNotifications.map((note) => (
                <div 
                  key={note.id} 
                  className={`p-3 rounded-2xl border ${
                    note.level === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                    note.level === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                    "bg-blue-500/10 border-blue-500/30 text-blue-300"
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

          {/* Analytics Summary */}
          <div className="bg-gradient-to-br from-surface-900/90 to-surface-950/90 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-base text-white">Golden Hour Impact</h3>
              </div>
              <Link to="/impact" className="text-[11px] font-bold text-amber-400 hover:underline">
                Full Strategy
              </Link>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-surface-200 mb-1">
                  <span>Golden Hour Rescue Rate</span>
                  <span className="text-emerald-400">98.4%</span>
                </div>
                <div className="w-full bg-surface-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full" style={{ width: "98.4%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-surface-200 mb-1">
                  <span>Volunteer Coverage Ratio</span>
                  <span className="text-amber-400">89.2%</span>
                </div>
                <div className="w-full bg-surface-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full" style={{ width: "89.2%" }}></div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed font-medium">
                ⚡ Over <strong className="text-white">182 accident victims</strong> safely triaged and evacuated within the crucial 60-minute window today.
              </div>
            </div>
          </div>

        </div>

      </section>

      <EmergencySheet isOpen={isEmergencySheetOpen} onClose={() => setIsEmergencySheetOpen(false)} />
    </div>
  );
}
