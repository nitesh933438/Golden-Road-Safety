import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, Navigation, Clock, User, Filter, MoreVertical, Shield } from "lucide-react";

export function AdminEmergenciesTab() {
  const [filter, setFilter] = useState("all");

  const emergencies = [
    { id: "SOS-8492", type: "Cardiac Arrest", severity: "critical", location: "Downtown Metro Station", time: "2 mins ago", status: "active", assignee: "Sarah J. (Volunteer)" },
    { id: "SOS-8491", type: "Road Accident", severity: "high", location: "Highway 42, Exit 5", time: "14 mins ago", status: "assigned", assignee: "Unit 4 (Police)" },
    { id: "SOS-8490", type: "Fire", severity: "critical", location: "Industrial Park, Block B", time: "45 mins ago", status: "assigned", assignee: "Fire Dept" },
    { id: "SOS-8489", type: "Minor Injury", severity: "low", location: "Central Park", time: "2 hours ago", status: "closed", assignee: "David C. (Volunteer)" },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-red-500 text-white animate-pulse";
      case "assigned": return "bg-blue-500 text-white";
      case "closed": return "bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300";
      default: return "bg-surface-200 text-surface-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Emergency Dispatch</h2>
        
        <div className="flex items-center gap-2">
          <div className="bg-surface-100 dark:bg-surface-700 p-1 rounded-xl flex">
            {["all", "critical", "active"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="p-2 bg-surface-100 dark:bg-surface-700 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
            <Filter className="w-5 h-5 text-surface-600 dark:text-surface-300" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700">
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">ID / Time</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Emergency</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Severity</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Assigned To</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {emergencies.map((em) => (
                <tr key={em.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-surface-900 dark:text-white">{em.id}</div>
                    <div className="text-xs text-surface-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {em.time}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-surface-900 dark:text-white">{em.type}</div>
                    <div className="text-xs text-surface-500 flex items-center gap-1"><Navigation className="w-3 h-3" /> {em.location}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getSeverityBadge(em.severity)}`}>
                      {em.severity}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusBadge(em.status)}`}>
                      {em.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {em.assignee ? (
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        {em.assignee.includes("Police") ? <Shield className="w-4 h-4 text-blue-500" /> : <User className="w-4 h-4 text-emerald-500" />}
                        {em.assignee}
                      </span>
                    ) : (
                      <span className="text-sm text-surface-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {em.status !== 'closed' && (
                        <button className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg text-xs font-bold transition-colors">
                          Assign
                        </button>
                      )}
                      <button className="p-1.5 text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
