import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, Navigation, Clock, User, Filter, MoreVertical, Shield, Zap, Car, AlertTriangle } from "lucide-react";
import { useCrashDetection } from "../../context/CrashDetectionContext";

export function AdminEmergenciesTab() {
  const [filter, setFilter] = useState("all");
  const { activeEmergency } = useCrashDetection();

  // Combine live active auto emergency if triggered with predefined emergencies
  const baseEmergencies = [
    { id: "SOS-AUTO-9982", type: "Vehicle Crash / Impact Sensor Alert", severity: "critical", location: "Km 14 Expressway, Sector 62", time: "Just now", status: "active", assignee: "Unit 2 (Traffic Police)", isAutoSOS: true, unconscious: true },
    { id: "SOS-8492", type: "Cardiac Arrest", severity: "critical", location: "Downtown Metro Station", time: "2 mins ago", status: "active", assignee: "Sarah J. (Volunteer)", isAutoSOS: false, unconscious: false },
    { id: "SOS-AUTO-9981", type: "Sudden Orientation Fall Anomaly", severity: "high", location: "Grand Trunk Road, Pillar 42", time: "8 mins ago", status: "assigned", assignee: "Dr. K. Sharma (Medical Response)", isAutoSOS: true, unconscious: true },
    { id: "SOS-8491", type: "Road Accident", severity: "high", location: "Highway 42, Exit 5", time: "14 mins ago", status: "assigned", assignee: "Unit 4 (Police)", isAutoSOS: false, unconscious: false },
    { id: "SOS-8490", type: "Fire", severity: "critical", location: "Industrial Park, Block B", time: "45 mins ago", status: "assigned", assignee: "Fire Dept", isAutoSOS: false, unconscious: false },
    { id: "SOS-8489", type: "Minor Injury", severity: "low", location: "Central Park", time: "2 hours ago", status: "closed", assignee: "David C. (Volunteer)", isAutoSOS: false, unconscious: false },
  ];

  const allEmergencies = activeEmergency 
    ? [
        {
          id: activeEmergency.id,
          type: activeEmergency.type,
          severity: activeEmergency.severity,
          location: activeEmergency.location,
          time: "JUST NOW",
          status: activeEmergency.status,
          assignee: "Rapid Response Unit (Auto Dispatched)",
          isAutoSOS: true,
          unconscious: activeEmergency.unconscious
        },
        ...baseEmergencies
      ]
    : baseEmergencies;

  const filteredEmergencies = allEmergencies.filter((e) => {
    if (filter === "auto_sos") return e.isAutoSOS;
    if (filter === "critical") return e.severity === "critical";
    if (filter === "active") return e.status === "active";
    return true;
  });

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
      
      {/* Auto SOS Command Overview Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-5 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-80">Auto SOS Crash Events</span>
            <Car className="w-5 h-5 text-amber-300 animate-bounce" />
          </div>
          <div className="text-2xl font-black">{allEmergencies.filter(e => e.isAutoSOS).length} Active Detections</div>
          <div className="text-[11px] opacity-90 font-medium">100% Automated GPS Telemetry Capture</div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-surface-500">
            <span className="text-xs font-bold uppercase tracking-wider">Unconscious Victim Rate</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">2 Dispatched</div>
          <div className="text-[11px] text-surface-500 font-medium">15s Timer Expired without Response</div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-surface-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Response Time</span>
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">1.8 Mins</div>
          <div className="text-[11px] text-surface-500 font-medium">Auto Contacts & Volunteer Dispatch</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-2">
        <div>
          <h2 className="text-2xl font-bold">Emergency Dispatch</h2>
          <p className="text-xs text-surface-500">Includes real-time Vehicle Telemetry & Crash Sensor SOS Feeds</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-surface-100 dark:bg-surface-700 p-1 rounded-xl flex flex-wrap gap-1">
            {[
              { id: "all", label: "All" },
              { id: "auto_sos", label: "🚗 Auto SOS Crashes" },
              { id: "critical", label: "Critical" },
              { id: "active", label: "Active" }
            ].map((f) => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
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
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">ID / Time</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Emergency Type</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Mode</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Severity</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider">Assigned To</th>
                <th className="py-4 px-6 font-bold text-xs uppercase text-surface-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {filteredEmergencies.map((em) => (
                <tr key={em.id} className={`hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors ${em.isAutoSOS ? "bg-red-50/40 dark:bg-red-950/20" : ""}`}>
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-surface-900 dark:text-white">{em.id}</div>
                    <div className="text-xs text-surface-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {em.time}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-1.5">
                      {em.type}
                    </div>
                    <div className="text-xs text-surface-500 flex items-center gap-1"><Navigation className="w-3 h-3 text-emerald-500" /> {em.location}</div>
                  </td>
                  <td className="py-4 px-6">
                    {em.isAutoSOS ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm animate-pulse">
                        <Zap className="w-3 h-3 fill-amber-300" />
                        {em.unconscious ? "AUTO Crash / Unconscious" : "Auto Crash SOS"}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-surface-500">Manual SOS</span>
                    )}
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
                          Dispatch
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

