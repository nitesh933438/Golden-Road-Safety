import React from "react";
import {
  ShieldAlert,
  Target,
  Eye,
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  Code2,
  Rocket,
  Layers,
  Globe,
  Database
} from "lucide-react";

export function About() {
  const TECH_STACK = [
    { name: "React 18 & TypeScript", desc: "Type-safe, high-performance UI components", category: "Frontend" },
    { name: "Tailwind CSS & Motion", desc: "Modern styling, dark mode & smooth transitions", category: "UI/UX" },
    { name: "Gemini 1.5 Flash AI", desc: "Context-aware emergency triage & audio CPR metronome", category: "Artificial Intelligence" },
    { name: "Firebase Firestore & Auth", desc: "Real-time sync, secure security rules & auth state", category: "Backend" },
    { name: "Google Maps Platform", desc: "Advanced markers, places API & real-time routing", category: "Location" },
    { name: "Service Worker PWA", desc: "Offline survival guides & cached emergency dispatch", category: "PWA & Offline" }
  ];

  const FEATURES = [
    { title: "Golden Hour SOS Dispatch", desc: "Single-tap emergency activation sending live GPS coordinates, blood type, and contacts." },
    { title: "Gemini AI CPR Coach", desc: "Interactive emergency triage with real-time audio metronome (100-120 BPM)." },
    { title: "Smart Hazard Map", desc: "Crowdsourced blackspots, road crashes, flood hazards, and live volunteer radar." },
    { title: "Certified Bystander Network", desc: "Dispatches registered CPR volunteers within 1km radius under 3 minutes." },
    { title: "Trauma Bed Reservation", desc: "Locks Level I & II hospital beds automatically with ER prep alerts." },
    { title: "Admin Command Center", desc: "Real-time municipal dashboard for monitoring emergency fleets & unit dispatch." }
  ];

  const FUTURE_SCOPE = [
    { title: "IoT Crash Detection", desc: "Automated motorcycle helmet & car accelerometer impact sensors triggering instant SOS." },
    { title: "Drone AED Delivery", desc: "Autonomous drone dispatch carrying automated defibrillators directly to crash sites." },
    { title: "Smart Traffic Green Wave", desc: "API integration with municipal traffic signals to clear green lights for ambulances." },
    { title: "Wearable Vitals Sensor", desc: "Apple Watch & Android Wear ECG sync for automatic cardiac arrest detection." }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-surface-900 text-white p-8 sm:p-12 border border-surface-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <ShieldAlert className="w-96 h-96 text-amber-500" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Hackathon Architectural Blueprint
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            About GoldenGuard
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            GoldenGuard is an AI-powered road safety and emergency response ecosystem engineered to maximize survival rates during the critical 10-minute Golden Hour.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-surface-200 dark:border-surface-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Our Mission</h2>
          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            To eliminate preventable road fatalities by leveraging artificial intelligence, real-time spatial routing, and crowdsourced bystander first responders to deliver care within the first 3 minutes of an accident.
          </p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-surface-200 dark:border-surface-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Our Vision</h2>
          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            A world where no accident victim dies waiting for help. We aim to build a global zero-latency emergency grid connecting citizens, medical facilities, municipal police, and AI guidance seamlessly.
          </p>
        </div>

      </div>

      {/* Core Features */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-surface-200 dark:border-surface-800 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Platform Capabilities</span>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white">Key Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 space-y-2 hover:border-amber-500/50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                0{i + 1}
              </div>
              <h3 className="font-bold text-base text-surface-900 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-surface-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5" /> High Scalability Architecture
          </div>
          <h2 className="text-3xl font-extrabold">Technology Stack</h2>
          <p className="text-sm text-surface-300">Modern, resilient full-stack cloud architecture designed for zero-downtime emergency dispatches.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TECH_STACK.map((tech, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface-800/80 border border-surface-700 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">{tech.category}</span>
              <h3 className="font-bold text-lg text-white">{tech.name}</h3>
              <p className="text-xs text-surface-300">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Future Scope */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-surface-200 dark:border-surface-800 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-500">Next Horizon</span>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white">Future Scope & Roadmap</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">Upcoming integrations planned for post-hackathon nationwide scaling.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FUTURE_SCOPE.map((scope, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 font-bold shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-surface-900 dark:text-white">{scope.title}</h4>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">{scope.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
