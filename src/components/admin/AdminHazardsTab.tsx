import React, { useState } from "react";
import { AlertTriangle, MapPin, CheckCircle2, XCircle, ImageIcon } from "lucide-react";

export function AdminHazardsTab() {
  const [filter, setFilter] = useState("pending");

  const hazards = [
    { id: "HZ-402", type: "Fallen Tree", location: "Maple Street", reporter: "USR-992", time: "1 hour ago", status: "pending", img: true },
    { id: "HZ-401", type: "Flooded Road", location: "River Road", reporter: "USR-881", time: "3 hours ago", status: "active", img: true },
    { id: "HZ-400", type: "Pothole", location: "Highway 42", reporter: "USR-775", time: "1 day ago", status: "resolved", img: false },
    { id: "HZ-399", type: "Broken Traffic Light", location: "5th Ave", reporter: "USR-122", time: "2 days ago", status: "rejected", img: false },
  ];

  const getStatusColor = (status: string) => {
    if (status === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (status === "active") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (status === "resolved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    return "bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Hazard Moderation</h2>
        
        <div className="flex items-center gap-2">
          <div className="bg-surface-100 dark:bg-surface-700 p-1 rounded-xl flex">
            {["all", "pending", "active", "resolved"].map(f => (
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
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Hazard</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Reporter</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {hazards.filter(h => filter === 'all' || h.status === filter).map((hz) => (
                <tr key={hz.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {hz.type}
                    </div>
                    <div className="text-xs text-surface-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {hz.location}</span>
                      <span>•</span>
                      <span>{hz.time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {hz.reporter}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(hz.status)}`}>
                      {hz.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {hz.img && (
                        <button className="p-1.5 text-surface-400 hover:text-blue-500 transition-colors" title="View Image">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-surface-400 hover:text-indigo-500 transition-colors" title="Navigate to Location">
                        <MapPin className="w-4 h-4" />
                      </button>
                      
                      {hz.status === 'pending' && (
                        <>
                          <button className="p-1.5 text-surface-400 hover:text-emerald-500 transition-colors" title="Approve & Publish">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-surface-400 hover:text-red-500 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {hz.status === 'active' && (
                        <button className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-xs font-bold transition-colors ml-2">
                          Mark Resolved
                        </button>
                      )}
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
