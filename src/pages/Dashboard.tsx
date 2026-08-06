import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { 
  ShieldAlert, Activity, Users, AlertTriangle, 
  Map as MapIcon, Timer, Plus, Camera, Navigation, 
  HeartPulse, PhoneCall, FileText, ChevronRight,
  Radio, Clock, CheckCircle2, ShieldCheck, Award, Stethoscope, Sparkles, Building2, Car, Bike, Shield as ShieldIcon
} from "lucide-react";
import { EmergencySheet } from "../components/EmergencySheet";

export function Dashboard() {
  const { demoMode } = useOutletContext<{ demoMode: boolean }>();
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
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

  // Live Statistics requested: Road Accidents Today, Active Volunteers, Nearby Hospitals, Emergency Response Time
  const liveStats = [
    { 
      label: "Road Accidents Today", 
      value: demoMode ? "189 Monitored" : "142 Monitored", 
      sub: "182 Rescued in Golden Hour", 
      icon: Car, 
      color: "text-red-500", 
      bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" 
    },
    { 
      label: "Active Volunteers", 
      value: demoMode ? "1,420 On-Duty" : "890 On-Duty", 
      sub: "Ready across 12 Metros", 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20" 
    },
    { 
      label: "Nearby Hospitals", 
      value: demoMode ? "480 ICU Beds" : "320 ICU Beds", 
      sub: "Trauma centers connected", 
      icon: Building2, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" 
    },
    { 
      label: "Emergency Response Time", 
      value: demoMode ? "2.1 mins" : "4.2 mins", 
      sub: "78% faster than national avg", 
      icon: Timer, 
      color: "text-amber-500", 
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" 
    },
  ];

  // Live Activity Feed items requested: Volunteer accepted SOS, Hospital preparing emergency room, Police dispatched, Hazard verified, New CPR certificate earned
  const liveActivities = [
    { id: 1, title: "Volunteer accepted SOS", detail: "Vol. Rahul Verma (0.4 km away) dispatched to Sector 7 collision site.", time: "30s ago", type: "volunteer", icon: Users, color: "text-blue-500 bg-blue-100 dark:bg-blue-950" },
    { id: 2, title: "Hospital preparing emergency room", detail: "Max Super Specialty Hospital (Trauma Bay 2) reserved ICU & blood reserve.", time: "2m ago", type: "hospital", icon: Building2, color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950" },
    { id: 3, title: "Police dispatched", detail: "Highway Patrol Unit 4 en-route to NH-48 Km 14 for accident scene cordon.", time: "4m ago", type: "police", icon: ShieldAlert, color: "text-red-500 bg-red-100 dark:bg-red-950" },
    { id: 4, title: "Hazard verified", detail: "Oil spill hazard verified on Ring Road flyover by 3 citizen responders.", time: "7m ago", type: "hazard", icon: AlertTriangle, color: "text-amber-500 bg-amber-100 dark:bg-amber-950" },
    { id: 5, title: "New CPR certificate earned", detail: "Vol. Rajesh Sharma completed Level 3 Advanced CPR & Triage assessment.", time: "11m ago", type: "certificate", icon: Award, color: "text-purple-500 bg-purple-100 dark:bg-purple-950" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-surface-900 text-white shadow-2xl border border-surface-800">
        <div className="absolute inset-0 bg-gradient-to-r from-surface-900 via-surface-900/90 to-surface-950/70 z-10" />
        <div className="absolute inset-0 opacity-25 bg-[url('https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop')] bg-cover bg-center" />
        
        <div className="relative z-20 p-8 sm:p-12 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-500 text-white rounded-2xl shadow-2xl ring-2 ring-amber-500/50">
                <ShieldIcon className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Golden Hour Emergency Network Active
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-snug">
              AI-Powered Road Safety & <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-red-500 bg-clip-text text-transparent">
                Golden Hour Response Platform
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-surface-300 mb-8 max-w-xl leading-relaxed">
              India's real-time emergency triage, volunteer dispatch, and hospital trauma coordination system designed to save lives when seconds matter.
            </p>

            {/* Requested Hero Buttons: Start Emergency, AI First Aid, Smart Map */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button 
                onClick={() => setIsEmergencySheetOpen(true)}
                className="flex items-center justify-center gap-2.5 px-7 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl font-extrabold text-base transition-all shadow-[0_0_35px_rgba(220,38,38,0.5)] hover:shadow-[0_0_55px_rgba(220,38,38,0.7)] group hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Emergency
              </button>

              <Link 
                to="/saferide"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-2xl font-black text-sm sm:text-base transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
              >
                <Bike className="w-5 h-5 fill-current" />
                SafeRide Guardian
              </Link>

              <Link 
                to="/first-aid"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-sm sm:text-base transition-all hover:scale-[1.02]"
              >
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                AI First Aid
              </Link>

              <Link 
                to="/map"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
              >
                <MapIcon className="w-5 h-5" />
                Smart Map
              </Link>
            </div>
          </div>
          
          {/* Golden Hour Countdown Widget */}
          <div className="shrink-0 bg-black/50 backdrop-blur-xl border border-white/15 p-6 sm:p-7 rounded-3xl text-center min-w-[260px] shadow-2xl">
            <Timer className="w-9 h-9 text-amber-500 mx-auto mb-2 animate-pulse" />
            <div className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">Golden Hour Countdown</div>
            <div className="text-5xl font-black text-white tabular-nums tracking-tight font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-surface-400 font-medium">
              <span>Avg Dispatch: {demoMode ? "2.1m" : "4.2m"}</span>
              <span className="text-emerald-400 font-bold">Optimal Protocol</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-surface-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            Live National Command Center Statistics
          </h2>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Real-time Syncing
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveStats.map((stat, i) => {
            const IconComp = stat.icon;
            return (
              <div 
                key={i} 
                className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md p-6 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${stat.bg} ${stat.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">{stat.value}</div>
                  <div className="text-sm font-extrabold text-surface-800 dark:text-surface-200">{stat.label}</div>
                  <div className="text-xs text-surface-500 font-medium">{stat.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Live Activity Stream & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Live Activity Stream & AI First Aid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Activity Stream Feed */}
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="font-black text-base text-surface-900 dark:text-white">Live Operations Activity Feed</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                5 Events Live
              </span>
            </div>

            <div className="space-y-3">
              {liveActivities.map((act) => {
                const IconComp = act.icon;
                return (
                  <div 
                    key={act.id} 
                    className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-700/60 flex items-start gap-3.5 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <div className={`p-2.5 rounded-xl ${act.color} shrink-0 mt-0.5`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-surface-900 dark:text-white truncate">{act.title}</h4>
                        <span className="text-[10px] font-bold text-surface-400">{act.time}</span>
                      </div>
                      <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">{act.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI First Aid Callout */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-surface-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <HeartPulse className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-2xl font-black">AI First Aid & Voice Assistant</h3>
              </div>
              <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-xl">
                Get instant, step-by-step CPR, haemorrhage control, and fracture immobilization voice guidance verified by medical trauma specialists.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/first-aid" className="bg-white text-indigo-950 px-6 py-3 rounded-2xl text-sm font-extrabold hover:bg-amber-50 transition-colors inline-flex items-center gap-2 shadow-lg">
                  <Activity className="w-4 h-4 text-indigo-700" />
                  Launch Voice Guided Triage
                </Link>
                <Link to="/training" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-colors inline-flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Take CPR Certification
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Live Map Preview & Quick Navigation */}
        <div className="space-y-6">
          
          {/* Live Mini Map Card */}
          <div className="bg-surface-900 rounded-3xl p-1 relative overflow-hidden shadow-xl h-64 shrink-0 border border-surface-800 group">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"></div>
             <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-[2px]"></div>
             
             {/* Map UI Elements */}
             <div className="absolute inset-x-4 top-4 flex justify-between items-start z-10">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  LIVE SMART DISPATCH MAP
                </div>
                <Link to="/map" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-2 rounded-xl transition-colors">
                  <MapIcon className="w-4 h-4" />
                </Link>
             </div>

             {/* Map Markers */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                   <div className="absolute -inset-4 bg-blue-500/30 rounded-full animate-ping"></div>
                   <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
                </div>
             </div>

             <div className="absolute bottom-4 left-4 right-4 z-10">
                <Link to="/map" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all">
                  <Navigation className="w-4 h-4" />
                  Open Smart Map & Live Routes
                </Link>
             </div>
          </div>

          {/* Quick Resources Navigation */}
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-surface-900 dark:text-white">Emergency Resources</h3>
            
            <div className="space-y-2">
              <Link to="/report" className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group border border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-surface-800 dark:text-surface-200 group-hover:text-amber-500 transition-colors">Report Road Hazard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400" />
              </Link>

              <Link to="/community" className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group border border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-surface-800 dark:text-surface-200 group-hover:text-blue-500 transition-colors">Volunteer Community Feed</span>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400" />
              </Link>

              <Link to="/profile" className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group border border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-surface-800 dark:text-surface-200 group-hover:text-purple-500 transition-colors">My Profile & Certificates</span>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      <EmergencySheet isOpen={isEmergencySheetOpen} onClose={() => setIsEmergencySheetOpen(false)} />
    </div>
  );
}
