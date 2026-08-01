import React from "react";
import { ShieldAlert, Play, LogIn, Info, Sparkles, HeartPulse, CheckCircle2, ArrowRight } from "lucide-react";
import { useDemo } from "../../context/DemoContext";
import { useNavigate } from "react-router-dom";

import appLogo from "../../assets/images/goldenguard_app_logo_1785611320510.jpg";

export function WelcomeModal() {
  const { showWelcomeModal, setShowWelcomeModal, startTour, setDemoMode } = useDemo();
  const navigate = useNavigate();

  if (!showWelcomeModal) return null;

  const handleStartDemo = () => {
    startTour();
    navigate("/sos");
  };

  const handleLogin = () => {
    localStorage.setItem("goldenguard_welcome_seen", "true");
    setShowWelcomeModal(false);
    navigate("/admin");
  };

  const handleLearnMore = () => {
    localStorage.setItem("goldenguard_welcome_seen", "true");
    setShowWelcomeModal(false);
    navigate("/about");
  };

  const handleDismiss = () => {
    localStorage.setItem("goldenguard_welcome_seen", "true");
    setShowWelcomeModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Banner Top Gradient */}
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-primary-600 p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <ShieldAlert className="w-64 h-64" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> Hackathon Presentation Experience
          </div>

          <div className="flex items-center gap-4 mb-2">
            <img 
              src={appLogo} 
              alt="GoldenGuard Logo" 
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/30 shadow-2xl shrink-0" 
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
                GoldenGuard
              </h1>
              <span className="text-xs font-bold text-amber-200 uppercase tracking-widest">Golden Hour Response Network</span>
            </div>
          </div>
          <p className="text-lg font-medium text-amber-100 max-w-xl leading-snug">
            AI-Powered Road Safety & Golden Hour Response Platform
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold mb-2">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-900 dark:text-white mb-1">Golden Hour SOS</h4>
              <p className="text-xs text-surface-500 dark:text-surface-400">Instant 1-tap SOS triage & automated 911 dispatch.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-900 dark:text-white mb-1">Gemini AI First Aid</h4>
              <p className="text-xs text-surface-500 dark:text-surface-400">Step-by-step CPR guides, metronome & audio instructions.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-900 dark:text-white mb-1">Volunteer Network</h4>
              <p className="text-xs text-surface-500 dark:text-surface-400">Dispatches certified nearby citizens under 3 minutes.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={handleStartDemo}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Demo</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </button>

            <button
              onClick={handleLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-bold rounded-2xl border border-surface-200 dark:border-surface-700 transition-all"
            >
              <LogIn className="w-4 h-4 text-primary-500" />
              <span>Login</span>
            </button>

            <button
              onClick={handleLearnMore}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-bold rounded-2xl border border-surface-200 dark:border-surface-700 transition-all"
            >
              <Info className="w-4 h-4 text-amber-500" />
              <span>Learn More</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-8 py-3 bg-surface-100 dark:bg-surface-950/80 border-t border-surface-200 dark:border-surface-800 flex justify-between items-center text-xs text-surface-500">
          <span>Google AI Studio Hackathon Edition</span>
          <button onClick={handleDismiss} className="hover:underline font-medium text-surface-600 dark:text-surface-400">
            Skip to App &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}
