import React from "react";
import { InteractiveFallbackMap } from "./InteractiveFallbackMap";

export function LiveEmergencyMap({ userCoords }: { userCoords: { lat: number; lng: number } | null }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <InteractiveFallbackMap userLocation={userCoords} />
    </div>
  );
}
