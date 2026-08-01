import React, { useState } from "react";
import { Search, Filter, ShieldCheck, XCircle, AlertTriangle, MoreVertical, Eye } from "lucide-react";

export function AdminVolunteersTab() {
  const [filter, setFilter] = useState("all");

  const volunteers = [
    { id: "V-1004", name: "Marcus Johnson", status: "pending", location: "North District", applied: "2 hours ago", training: "CPR, Basic First Aid" },
    { id: "V-1003", name: "Sarah Jenkins", status: "approved", location: "Central Park", applied: "1 year ago", training: "Advanced Paramedic" },
    { id: "V-1002", name: "David Chen", status: "approved", location: "Downtown", applied: "8 months ago", training: "First Aid" },
    { id: "V-1001", name: "Emma Wilson", status: "suspended", location: "Westside", applied: "2 years ago", training: "CPR" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Volunteer Management</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search volunteers by name, ID, or location..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-surface-100 dark:bg-surface-700 p-1 rounded-xl flex">
            {["all", "pending", "approved", "suspended"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700">
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Volunteer</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Training</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Applied/Joined</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {volunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-surface-900 dark:text-white">{vol.name}</div>
                    <div className="text-xs text-surface-500">{vol.id} • {vol.location}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      vol.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      vol.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {vol.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">{vol.training}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-surface-600 dark:text-surface-400">{vol.applied}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-surface-400 hover:text-blue-500 transition-colors" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </button>
                      {vol.status === 'pending' && (
                        <>
                          <button className="p-1.5 text-surface-400 hover:text-emerald-500 transition-colors" title="Approve">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-surface-400 hover:text-red-500 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {vol.status === 'approved' && (
                        <button className="p-1.5 text-surface-400 hover:text-orange-500 transition-colors" title="Suspend">
                          <AlertTriangle className="w-4 h-4" />
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
