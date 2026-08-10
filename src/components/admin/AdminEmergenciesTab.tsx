import React, { useState } from "react";
import { 
  ShieldAlert, CheckCircle2, Navigation, Clock, User, Filter, 
  MoreVertical, Shield, Zap, Car, AlertTriangle, Building2, Phone 
} from "lucide-react";
import { useIncidents } from "../../context/IncidentContext";
import { IncidentDoc } from "../../lib/incidentService";

export function AdminEmergenciesTab() {
  const { allIncidents, activeIncidents, updateIncidentStatus, setSelectedIncidentId } = useIncidents();
  const [filter, setFilter] = useState<"all" | "active" | "critical">("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const displayIncidents = filter === "active" 
    ? activeIncidents 
    : filter === "critical" 
    ? allIncidents.filter(i => i.priority === "critical") 
    : allIncidents;

  const totalPages = Math.ceil(displayIncidents.length / itemsPerPage) || 1;
  const paginatedIncidents = displayIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-red-500 text-white animate-pulse";
      case "acknowledged": 
      case "responding": return "bg-blue-500 text-white";
      case "hospital-arrived": return "bg-purple-500 text-white";
      case "resolved": return "bg-emerald-600 text-white";
      case "cancelled": return "bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300";
      default: return "bg-amber-500 text-black";
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await updateIncidentStatus(id, { status: "resolved" });
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Auto SOS Command Overview Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-5 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-80">Real Active Incidents</span>
            <ShieldAlert className="w-5 h-5 text-amber-300 animate-bounce" />
          </div>
          <div className="text-2xl font-black">{activeIncidents.length} Active Dispatches</div>
          <div className="text-[11px] opacity-90 font-medium">Real-time Golden Hour Pipeline</div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-surface-500">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Priorities</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {activeIncidents.filter(i => i.priority === "critical").length} Critical
          </div>
          <div className="text-[11px] text-surface-500 font-medium">Requires Priority Hospital Allocation</div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-surface-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total System Logs</span>
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{allIncidents.length} Recorded</div>
          <div className="text-[11px] text-surface-500 font-medium">Persisted in Firestore Database</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-2">
        <div>
          <h2 className="text-2xl font-bold">Emergency Command Dispatch</h2>
          <p className="text-xs text-surface-500">Manage real Firebase emergency incidents and responder allocations</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-surface-100 dark:bg-surface-700 p-1 rounded-xl flex flex-wrap gap-1">
            {[
              { id: "all", label: "All Incidents" },
              { id: "active", label: "Active Only" },
              { id: "critical", label: "Critical Priority" }
            ].map((f) => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  filter === f.id 
                    ? 'bg-amber-500 text-black shadow-sm' 
                    : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                {f.label}
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
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Incident ID</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Reporter / Contact</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Emergency Type & Location</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Priority</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {paginatedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-surface-500">
                    No emergency incidents recorded.
                  </td>
                </tr>
              ) : (
                paginatedIncidents.map((em) => (
                  <tr key={em.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">{em.id}</div>
                      <div className="text-[10px] text-surface-400 font-mono">
                        {em.createdAtMs ? new Date(em.createdAtMs).toLocaleTimeString() : "Recent"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm text-surface-900 dark:text-white">{em.reporterName}</div>
                      <div className="text-xs text-surface-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" /> {em.reporterPhone}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-1.5">
                        {em.type}
                      </div>
                      <div className="text-xs text-surface-500 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-500" /> {em.locationText}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getSeverityBadge(em.priority)}`}>
                        {em.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusBadge(em.status)}`}>
                        {em.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedIncidentId(em.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition-colors"
                        >
                          Focus Clock
                        </button>
                        {em.status !== "resolved" && em.status !== "cancelled" && (
                          <button 
                            onClick={() => handleResolve(em.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <span className="text-xs text-surface-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, displayIncidents.length)} of {displayIncidents.length}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-surface-700"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-surface-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
