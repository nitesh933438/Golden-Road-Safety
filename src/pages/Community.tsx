import React, { useState } from "react";
import { Users, ShieldAlert, Trophy, Activity, MessageSquare } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { Feed } from "../components/community/Feed";
import { VolunteerHub } from "../components/community/VolunteerHub";
import { Leaderboard } from "../components/community/Leaderboard";

type TabType = "feed" | "volunteer" | "leaderboard";

export function Community() {
  const { demoMode } = useOutletContext<{ demoMode: boolean }>();
  const [activeTab, setActiveTab] = useState<TabType>("feed");

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shrink-0 hover:shadow-xl transition-shadow">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Community & Volunteers</h1>
          <p className="text-emerald-50 max-w-2xl text-sm sm:text-base">
            Connect with others, stay informed on local safety, and volunteer to save lives in your community.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Active Volunteers</div>
            <div className="text-sm font-bold">Network Active</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 shrink-0 pb-2">
        {[
          { id: "feed", label: "Community Feed", icon: MessageSquare },
          { id: "volunteer", label: "Volunteer Hub", icon: ShieldAlert },
          { id: "leaderboard", label: "Leaderboard", icon: Trophy },
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
      <div className="flex-1 overflow-y-auto bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-md transition-shadow custom-scrollbar relative animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === "feed" && <Feed />}
        {activeTab === "volunteer" && <VolunteerHub />}
        {activeTab === "leaderboard" && <Leaderboard />}
      </div>
    </div>
  );
}
