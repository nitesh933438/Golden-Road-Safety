import React, { useEffect, useState } from "react";
import { useDemo } from "../../context/DemoContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldAlert,
  LogIn,
  Stethoscope,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  Pause,
  Sparkles,
  ChevronRight
} from "lucide-react";

const STEPS = [
  {
    step: 1,
    title: "Step 1: Login & Identity",
    subtitle: "Authenticated as Citizen Alex Rivera (Demo)",
    description: "User profile with medical info, blood type (O+), and CPR certification loaded safely in Demo Mode.",
    route: "/admin",
    icon: LogIn,
    badgeColor: "bg-blue-500",
  },
  {
    step: 2,
    title: "Step 2: Trigger SOS",
    subtitle: "Golden Hour Emergency Signal",
    description: "Single-tap emergency dispatch retrieves exact GPS coordinates and alerts 911 + nearby responders.",
    route: "/sos",
    icon: ShieldAlert,
    badgeColor: "bg-red-600",
  },
  {
    step: 3,
    title: "Step 3: AI First Aid Starts",
    subtitle: "Gemini AI Triage & CPR Metronome",
    description: "Instant voice & visual CPR assistance guides bystanders with 100-120 BPM compressions rhythm.",
    route: "/first-aid",
    icon: Stethoscope,
    badgeColor: "bg-amber-500",
  },
  {
    step: 4,
    title: "Step 4: Nearby Volunteers Respond",
    subtitle: "Bystander Dispatch (Marcus Chen)",
    description: "Volunteer Marcus Chen (0.4km away) accepts dispatch with portable AED unit en route in 2 mins.",
    route: "/map",
    icon: Users,
    badgeColor: "bg-indigo-500",
  },
  {
    step: 5,
    title: "Step 5: Hospital Assigned",
    subtitle: "Level I Trauma Unit Lock",
    description: "St. Jude Metropolitan Trauma Center confirms ICU bed reservation and preps emergency room.",
    route: "/map",
    icon: Building2,
    badgeColor: "bg-emerald-500",
  },
  {
    step: 6,
    title: "Step 6: Emergency Completed",
    subtitle: "Golden Hour Life Saved",
    description: "Patient stabilized, response metrics logged, community certificate earned, incident recorded.",
    route: "/",
    icon: CheckCircle2,
    badgeColor: "bg-green-600",
  },
];

export function GuidedDemoTour() {
  const { isTourActive, tourStep, nextTourStep, prevTourStep, endTour, triggerDemoEmergency } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [autoPlay, setAutoPlay] = useState(false);

  const currentStepData = STEPS.find(s => s.step === tourStep) || STEPS[0];

  useEffect(() => {
    if (!isTourActive) return;
    // Auto navigate when step changes
    if (currentStepData.route && location.pathname !== currentStepData.route) {
      navigate(currentStepData.route);
    }
    if (tourStep === 2) {
      triggerDemoEmergency("Severe Motorbike Crash");
    }
  }, [tourStep, isTourActive]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlay && isTourActive) {
      timer = setInterval(() => {
        if (tourStep < 6) {
          nextTourStep();
        } else {
          setAutoPlay(false);
          endTour();
        }
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [autoPlay, tourStep, isTourActive]);

  if (!isTourActive) return null;

  const IconComp = currentStepData.icon;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[480px] z-50 bg-surface-900/95 backdrop-blur-xl border border-amber-500/40 text-white rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Hackathon Live Demo Tour
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              autoPlay ? "bg-amber-500 text-black font-bold" : "bg-surface-800 text-surface-300 hover:text-white"
            }`}
          >
            {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoPlay ? "Pause" : "Auto-Play"}</span>
          </button>
          
          <button
            onClick={endTour}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            aria-label="Exit tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="grid grid-cols-6 gap-1.5 mb-4">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s.step === tourStep
                ? "bg-amber-400 shadow-md shadow-amber-400/50 scale-y-125"
                : s.step < tourStep
                ? "bg-amber-600/60"
                : "bg-surface-800"
            }`}
          />
        ))}
      </div>

      {/* Step Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-2xl ${currentStepData.badgeColor} text-white shadow-lg shrink-0 animate-bounce`}>
          <IconComp className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
              Step {tourStep} of 6
            </span>
            <span className="text-[10px] text-surface-400 font-mono">
              Live Interactive Simulation
            </span>
          </div>
          <h3 className="text-base font-bold text-white truncate leading-snug">
            {currentStepData.title}
          </h3>
          <p className="text-xs text-amber-200/90 font-medium mb-1">
            {currentStepData.subtitle}
          </p>
          <p className="text-xs text-surface-300 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-800">
        <button
          onClick={prevTourStep}
          disabled={tourStep === 1}
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-surface-800 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <span className="text-[11px] text-surface-400 font-medium hidden sm:inline-block">
          Press Next to proceed
        </span>

        <button
          onClick={nextTourStep}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <span>{tourStep === 6 ? "Finish Tour" : "Next Step"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
