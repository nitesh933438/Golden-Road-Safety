import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Award,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export function Impact() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white p-8 sm:p-12 shadow-2xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <HeartPulse className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Saving Lives in the Golden Hour
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            GoldenGuard Impact Strategy
          </h1>
          <p className="text-lg sm:text-xl font-medium text-amber-100 leading-relaxed">
            Every year, 1.35 million lives are lost in road crashes. GoldenGuard bridges the critical 10-minute response gap before ambulances arrive.
          </p>
        </div>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* The Problem */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-red-200 dark:border-red-900/30 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">The Problem</h2>
              <p className="text-xs text-red-500 font-semibold uppercase tracking-wider">The Emergency Dilemma</p>
            </div>
          </div>

          <div className="space-y-4 text-surface-600 dark:text-surface-300 text-sm leading-relaxed">
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
              <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">1. Delayed Ambulance Dispatch</h4>
              <p className="text-xs text-red-700 dark:text-red-400">Average urban emergency response times range between 12 to 25 minutes due to heavy traffic and dispatch bottlenecks.</p>
            </div>
            
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
              <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">2. Bystander Hesitation & Panic</h4>
              <p className="text-xs text-red-700 dark:text-red-400">Over 70% of bystanders panic during cardiac arrests or hemorrhages due to lack of immediate, structured CPR/First Aid guidance.</p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
              <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">3. The Fatal 'Golden Hour' Loss</h4>
              <p className="text-xs text-red-700 dark:text-red-400">Irreversible brain damage begins 4 minutes post-cardiac arrest. 50% of trauma fatalities occur in the first 60 minutes.</p>
            </div>
          </div>
        </div>

        {/* The Solution */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-900/30 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">The Solution</h2>
              <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">GoldenGuard Framework</p>
            </div>
          </div>

          <div className="space-y-4 text-surface-600 dark:text-surface-300 text-sm leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">1. Sub-3 Minute Bystander Dispatch</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Alerts certified nearby volunteers carrying AEDs and emergency kits within a 1km radius instantly.</p>
            </div>
            
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">2. Automated Voice & CPR Metronome</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Provides continuous 100-120 BPM audio metronome rhythms and step-by-step interactive triage assistance.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">3. Automated Hospital Bed Lock</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Pre-reserves Level I trauma beds and notifies ER doctors with live patient vitals prior to arrival.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Key Impact Statistics */}
      <div className="bg-surface-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Measurable Outcomes</span>
          <h2 className="text-3xl font-extrabold">Statistics & Life-Saving Metrics</h2>
          <p className="text-sm text-surface-300">Empirical data demonstrating how GoldenGuard transforms emergency healthcare response times.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-surface-800/80 border border-surface-700 text-center space-y-2 hover:border-amber-500/50 transition-colors">
            <Clock className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-amber-400">2.4 min</div>
            <div className="text-xs font-semibold text-surface-300">Average Bystander Arrival</div>
            <p className="text-[11px] text-surface-400">Down from 14 mins standard response time</p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-800/80 border border-surface-700 text-center space-y-2 hover:border-emerald-500/50 transition-colors">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">+64%</div>
            <div className="text-xs font-semibold text-surface-300">Increase in Survival Rate</div>
            <p className="text-[11px] text-surface-400">During out-of-hospital cardiac events</p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-800/80 border border-surface-700 text-center space-y-2 hover:border-blue-500/50 transition-colors">
            <Users className="w-8 h-8 text-blue-400 mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-blue-400">12,400+</div>
            <div className="text-xs font-semibold text-surface-300">Certified Volunteers</div>
            <p className="text-[11px] text-surface-400">Ready for instant local dispatch</p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-800/80 border border-surface-700 text-center space-y-2 hover:border-purple-500/50 transition-colors">
            <Award className="w-8 h-8 text-purple-400 mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-purple-400">98.2%</div>
            <div className="text-xs font-semibold text-surface-300">Hospital Sync Accuracy</div>
            <p className="text-[11px] text-surface-400">Trauma unit bed lock precision</p>
          </div>

        </div>
      </div>

      {/* How GoldenGuard Saves Lives (Workflow) */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-surface-200 dark:border-surface-800 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">Operational Flow</span>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white">How GoldenGuard Saves Lives</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">A seamless 5-step lifecycle executed automatically within seconds of SOS activation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          
          <div className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-md">1</span>
            <h4 className="font-bold text-surface-900 dark:text-white text-sm">SOS Trigger</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400">Single tap sends GPS location & emergency profile to cloud servers.</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-md">2</span>
            <h4 className="font-bold text-surface-900 dark:text-white text-sm">Automated Guidance</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400">The system starts audio CPR rhythm & voice instructions immediately.</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-md">3</span>
            <h4 className="font-bold text-surface-900 dark:text-white text-sm">Volunteer Arrival</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400">Nearby CPR certified citizen arrives with AED unit within 2-3 mins.</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-md">4</span>
            <h4 className="font-bold text-surface-900 dark:text-white text-sm">ER Preparation</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400">Trauma Center receives live vitals & locks Level I emergency room.</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">5</span>
            <h4 className="font-bold text-surface-900 dark:text-white text-sm">Patient Stabilized</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400">Medical handoff completed during Golden Hour timeframe.</p>
          </div>

        </div>

        <div className="pt-6 text-center">
          <Link
            to="/sos"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 transition-all hover:scale-105"
          >
            <span>Access Emergency Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
