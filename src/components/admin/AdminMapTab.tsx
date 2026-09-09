import React, { useState, useEffect } from "react";
import { LiveEmergencyMap } from "../LiveEmergencyMap";
import { MapPinOff } from "lucide-react";

export function AdminMapTab() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationDenied(false);
        },
        () => {
          setLocationDenied(true);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationDenied(true);
    }
  }, []);

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
        <LiveEmergencyMap userCoords={userCoords} />
        {locationDenied && !userCoords && (
          <div className="absolute bottom-4 left-4 z-[500] bg-surface-900/90 text-white text-xs px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 border border-surface-700">
            <MapPinOff className="w-4 h-4 text-amber-400" />
            <span>GPS location unavailable for admin command marker.</span>
          </div>
        )}
      </div>
    </div>
  );
}
