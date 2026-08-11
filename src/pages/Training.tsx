import React, { useState } from "react";
import { BookOpen, Shield, Target, Award, ChevronRight } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { AcademyModules } from "../components/training/AcademyModules";
import { GoodSamaritanHub } from "../components/training/GoodSamaritanHub";
import { ConfidenceMode } from "../components/training/ConfidenceMode";
import { Achievements } from "../components/training/Achievements";

type TabType = "academy" | "good_samaritan" | "confidence" | "achievements";

export function Training() {
  const { demoMode } = useOutletContext<{ demoMode: boolean }>();
  const [activeTab, setActiveTab] = useState<TabType>("academy");

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shrink-0 hover:shadow-xl transition-shadow">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">CPR Academy & Learning Hub</h1>
          <p className="text-blue-100 max-w-2xl text-sm sm:text-base">
            Build confidence, learn life-saving skills, and understand your rights as a Good Samaritan. 
            Reduce hesitation and be ready to act during the Golden Hour.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
            {demoMode ? "12" : "4"}
          </div>
          <div>
            <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Badges Earned</div>
            <div className="text-sm font-bold">Safety Volunteer</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 shrink-0 pb-2">
        {[
          { id: "academy", label: "CPR Academy", icon: BookOpen },
          { id: "good_samaritan", label: "Good Samaritan Hub", icon: Shield },
          { id: "confidence", label: "Confidence Mode", icon: Target },
          { id: "achievements", label: "Achievements", icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-surface-900 dark:bg-white text-white dark:text-surface-900 shadow-md"
                : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 hover:shadow-sm"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-md transition-shadow relative animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === "academy" && <AcademyModules />}
        {activeTab === "good_samaritan" && <GoodSamaritanHub />}
        {activeTab === "confidence" && <ConfidenceMode />}
        {activeTab === "achievements" && <Achievements />}
      </div>
    </div>
  );
}
