import React, { useState } from "react";
import { 
  HeartPulse, Droplets, Bone, Flame, UserMinus, Activity, Zap, 
  Car, Skull, Baby, Phone, ShieldAlert, Map as MapIcon, Share2, 
  ChevronLeft, BookOpen, AlertTriangle, Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { EmergencyTimers } from "../components/firstaid/EmergencyTimers";
import { FirstAidChat } from "../components/firstaid/FirstAidChat";
import { SmartInput } from "../components/ui/SmartInput";

const EMERGENCY_CATEGORIES = [
  { id: "cpr", label: "Cardiac Arrest", icon: HeartPulse, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "bleeding", label: "Severe Bleeding", icon: Droplets, color: "text-red-600", bg: "bg-red-600/10" },
  { id: "fracture", label: "Fracture", icon: Bone, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "burns", label: "Burns", icon: Flame, color: "text-orange-600", bg: "bg-orange-600/10" },
  { id: "choking", label: "Choking", icon: UserMinus, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "head_injury", label: "Head Injury", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "shock", label: "Electric Shock", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "accident", label: "Road Accident", icon: Car, color: "text-slate-500", bg: "bg-slate-500/10" },
  { id: "poison", label: "Poisoning", icon: Skull, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "pregnancy", label: "Pregnancy", icon: Baby, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: "child", label: "Child Emergency", icon: Baby, color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

export function FirstAid() {
  const [activeMode, setActiveMode] = useState<"dashboard" | "chat">("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [symptomSearch, setSymptomSearch] = useState("");

  const startChat = (category: string | null = null) => {
    setSelectedCategory(category || symptomSearch || "General Emergency");
    setActiveMode("chat");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {activeMode === "chat" ? (
              <button 
                onClick={() => setActiveMode("dashboard")}
                className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-700 flex items-center justify-center hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">
                {activeMode === "chat" ? (selectedCategory ? `AI Guide: ${selectedCategory}` : "AI First Aid Assistant") : "AI First Aid Dashboard"}
              </h1>
              <p className="text-sm text-surface-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Guidance only. Not professional medical care.
              </p>
            </div>
          </div>

          {/* Quick Action (Mobile SOS) */}
          <Link to="/sos" className="sm:hidden px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> SOS
          </Link>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeMode === "dashboard" ? (
            <div className="p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Smart Symptom Input Bar */}
              <div className="mb-8 p-[1px] bg-gradient-to-r from-red-500 via-amber-500 to-primary-500 rounded-2xl shadow-md">
                <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-black mb-1 text-surface-900 dark:text-white flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-red-500 animate-pulse" /> What is the medical emergency?
                    </h3>
                    <p className="text-xs font-semibold text-surface-500">
                      Type symptoms (e.g. "heavy bleeding", "no pulse cpr", "burns") or speak into microphone.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <SmartInput
                        value={symptomSearch}
                        onChange={setSymptomSearch}
                        placeholder="Search symptoms or condition (e.g. Bleeding, CPR, Fracture)..."
                        historyKey="first_aid_symptoms"
                        suggestions={[
                          "Heavy Bleeding Direct Pressure",
                          "Unconscious Victim CPR 30:2",
                          "Chemical Flame Burns First Aid",
                          "Leg Fracture Splinting",
                          "Airway Choking Heimlich Maneuver",
                          "Head Injury Concussion Check",
                          "Electric Shock Isolation Protocol"
                        ]}
                        showVoiceInput={true}
                        enableAIIntent={true}
                      />
                    </div>
                    <button 
                      onClick={() => startChat(symptomSearch)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shrink-0 text-xs"
                    >
                      <Search className="w-4 h-4" /> Get AI Triage
                    </button>
                  </div>
                </div>
              </div>

              <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Emergency Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {EMERGENCY_CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => startChat(cat.label)}
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl hover:border-primary-500 dark:hover:border-primary-500 transition-all group hover:shadow-md bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-center text-surface-900 dark:text-white leading-tight">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Training Mode Teaser */}
              <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" /> Training Mode
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Practice first aid with interactive quizzes and earn a certificate.</p>
                </div>
                <Link to="/training" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors hidden sm:block shadow-sm">
                  Start Training
                </Link>
              </div>

            </div>
          ) : (
            <FirstAidChat category={selectedCategory} />
          )}
        </div>
      </div>

      {/* Right Sidebar: Timers & Quick Actions */}
      <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col gap-2">
           <Link to="/sos" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
             <Phone className="w-5 h-5" /> Call 108 / 112
           </Link>
           <Link to="/map" className="w-full py-3 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
             <MapIcon className="w-5 h-5 text-blue-500" /> Open Smart Map
           </Link>
           <button 
             onClick={() => {
               const text = "EMERGENCY: I need assistance. My current location is: 37.7749, -122.4194 (GoldenGuard Emergency Dispatch)";
               if (navigator.share) {
                 navigator.share({ title: "GoldenGuard Location Share", text }).catch(() => {});
               } else {
                 navigator.clipboard.writeText(text);
                 alert("Emergency location copied to clipboard! Share with first responders.");
               }
             }}
             className="w-full py-3 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
           >
             <Share2 className="w-5 h-5 text-green-500" /> Share Location
           </button>
        </div>

        {/* Timers */}
        <EmergencyTimers />

        {/* Offline notice */}
        <div className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 text-center">
          <p className="text-xs text-surface-500 flex items-center justify-center gap-1.5 font-medium">
            <BookOpen className="w-4 h-4" /> Offline Guides Downloaded
          </p>
        </div>

      </div>

    </div>
  );
}
