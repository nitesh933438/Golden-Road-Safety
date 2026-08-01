import React from "react";
import { LiveEmergencyMap } from "../LiveEmergencyMap";

export function AdminMapTab() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Global Command Map</h2>
          <p className="text-sm text-surface-500">Real-time overview of all responders and emergencies.</p>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-white dark:bg-surface-800 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm"><div className="w-2 h-2 rounded-full bg-red-600"></div> Emergencies</div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-surface-800 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Volunteers</div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-surface-800 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Hazards</div>
        </div>
      </div>
      <div className="flex-1 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-sm relative bg-surface-100 dark:bg-surface-800 min-h-[400px]">
        {/* We can reuse the LiveEmergencyMap for demonstration */}
        <LiveEmergencyMap userCoords={{ lat: 37.7749, lng: -122.4194 }} />
      </div>
    </div>
  );
}
