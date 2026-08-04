import React from "react";
import { Users, Heart, Building2, Shield, AlertTriangle, AlertCircle, BookOpen, Radio } from "lucide-react";

export function AdminDashboardTab() {
  const stats = [
    { label: "Total Users", value: "24,592", icon: Users, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Active Volunteers", value: "3,842", icon: Heart, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { label: "Registered Hospitals", value: "142", icon: Building2, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
    { label: "Police Stations", value: "86", icon: Shield, color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-900/30" },
    { label: "Active Emergencies", value: "12", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", alert: true },
    { label: "Pending Hazards", value: "45", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { label: "Course Completions", value: "12.4k", icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
    { label: "Online Users", value: "1,204", icon: Radio, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Overview</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-surface-600 dark:text-surface-400">Live Updates Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-surface-800 p-6 rounded-2xl border ${stat.alert ? 'border-red-200 dark:border-red-900/50 shadow-md shadow-red-500/10' : 'border-surface-200 dark:border-surface-700 shadow-sm'} flex items-start gap-4`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-surface-500 dark:text-surface-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Quick Actions or Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Recent Audit Logs</h3>
          <div className="space-y-4">
            {[
              { action: "Assigned Volunteer to SOS-102", time: "2 mins ago", user: "Admin" },
              { action: "Approved Hazard Report HR-842", time: "15 mins ago", user: "Admin" },
              { action: "Broadcasted Weather Alert", time: "1 hour ago", user: "Admin" },
            ].map((log, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-surface-100 dark:border-surface-700/50 last:border-0">
                <span className="text-sm font-medium">{log.action}</span>
                <span className="text-xs text-surface-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">System Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>API Latency</span>
                <span className="text-emerald-500">24ms</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full w-[10%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>Database Load</span>
                <span className="text-emerald-500">14%</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full w-[14%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>Active Realtime Connections</span>
                <span className="text-blue-500">1,204</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full w-[60%]"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
