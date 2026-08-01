import React from "react";
import { Award, Shield, Heart, Zap, BookOpen } from "lucide-react";

export function Achievements() {
  const BADGES = [
    { id: 1, title: "First Steps", description: "Completed your first Academy module.", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", earned: true },
    { id: 2, title: "CPR Certified", description: "Passed the CPR Basics training.", icon: Heart, color: "text-red-500", bg: "bg-red-500/10", earned: true },
    { id: 3, title: "Good Samaritan", description: "Read the Good Samaritan Law guide.", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10", earned: true },
    { id: 4, title: "Safety Volunteer", description: "Completed 3 Confidence Mode scenarios.", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", earned: true },
    { id: 5, title: "Master Responder", description: "Complete all Academy modules.", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10", earned: false },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Achievements</h2>
        <p className="text-surface-600 dark:text-surface-400">Collect badges as you build your life-saving skills.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGES.map(badge => (
          <div 
            key={badge.id} 
            className={`p-6 rounded-3xl border-2 flex flex-col items-center text-center transition-all ${
              badge.earned 
                ? "border-primary-100 dark:border-primary-900/30 bg-primary-50/50 dark:bg-primary-900/10" 
                : "border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 opacity-60 grayscale"
            }`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${badge.bg} ${badge.color}`}>
              <badge.icon className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{badge.title}</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400">{badge.description}</p>
            
            {badge.earned ? (
              <span className="mt-6 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full">
                Earned
              </span>
            ) : (
              <span className="mt-6 px-4 py-1.5 bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs font-bold uppercase tracking-wider rounded-full">
                Locked
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
