/**
 * Real-time AI Intent & Action Detection for Search and Text Inputs
 */

export interface AIIntentSuggestion {
  intent: "emergency" | "firstaid" | "hospital" | "police" | "hazard" | "saferide" | "general";
  title: string;
  actionText: string;
  targetUrl: string;
  badgeColor: string;
  description: string;
}

export function detectAIIntent(query: string): AIIntentSuggestion | null {
  if (!query || query.trim().length < 2) return null;

  const q = query.toLowerCase();

  // 1. Critical Bleeding / Trauma / First Aid
  if (q.includes("bleed") || q.includes("blood") || q.includes("cut") || q.includes("wound") || q.includes("injury")) {
    return {
      intent: "firstaid",
      title: "System Detected: Severe Bleeding / Trauma",
      actionText: "Open Bleeding First Aid Guide",
      targetUrl: "/first-aid?condition=bleeding",
      badgeColor: "bg-red-600 text-white",
      description: "Apply direct firm pressure with clean cloth. Elevate limb if possible."
    };
  }

  // 2. CPR / Unconscious / Breathing
  if (q.includes("cpr") || q.includes("breathe") || q.includes("chok") || q.includes("unconscious") || q.includes("faint") || q.includes("heart")) {
    return {
      intent: "firstaid",
      title: "System Detected: Cardiac / Respiratory Crisis",
      actionText: "Launch 30:2 CPR Metronome & Protocol",
      targetUrl: "/first-aid?condition=cpr",
      badgeColor: "bg-red-600 text-white",
      description: "Check responsiveness, call 108/112 immediately, start 100-120 chest compressions/min."
    };
  }

  // 3. Fire / Burns
  if (q.includes("fire") || q.includes("burn") || q.includes("smoke") || q.includes("flame")) {
    return {
      intent: "emergency",
      title: "System Detected: Fire / Thermal Burn Emergency",
      actionText: "Trigger Fire Dispatch & Burn Guide",
      targetUrl: "/sos?type=fire",
      badgeColor: "bg-amber-600 text-white",
      description: "Cool burns with clean running cool water for 10-20 mins. Do not apply ice."
    };
  }

  // 4. Accident / Crash / Collision
  if (q.includes("crash") || q.includes("accident") || q.includes("hit") || q.includes("bike") || q.includes("car") || q.includes("collision")) {
    return {
      intent: "saferide",
      title: "System Detected: Vehicle Crash / Incident",
      actionText: "Trigger 1-Tap Golden Hour SOS",
      targetUrl: "/sos?active=true",
      badgeColor: "bg-red-600 text-white animate-pulse",
      description: "Automated crash telemetry sensor active. Dispatching nearest bystander volunteers."
    };
  }

  // 5. Hospital / Ambulance / ICU
  if (q.includes("hospital") || q.includes("icu") || q.includes("ambulance") || q.includes("doctor") || q.includes("clinic") || q.includes("trauma")) {
    return {
      intent: "hospital",
      title: "System Detected: Medical Facility Lookup",
      actionText: "Find Nearest Verified Trauma Centers",
      targetUrl: "/map?filter=hospitals",
      badgeColor: "bg-blue-600 text-white",
      description: "Showing 24/7 emergency ICUs with available bed count & oxygen readiness."
    };
  }

  // 6. Hazard / Pothole / Oil / Road Obstruction
  if (q.includes("hazard") || q.includes("pothole") || q.includes("oil") || q.includes("block") || q.includes("landslide") || q.includes("flood")) {
    return {
      intent: "hazard",
      title: "System Detected: Roadway Safety Hazard",
      actionText: "Report Road Hazard with Geo-Tag",
      targetUrl: "/report-hazard",
      badgeColor: "bg-amber-500 text-black",
      description: "Alert nearby GoldenGuard riders & traffic police within 5km radius."
    };
  }

  // 7. Police / Security / Crime
  if (q.includes("police") || q.includes("thief") || q.includes("crime") || q.includes("help") || q.includes("attack") || q.includes("harass")) {
    return {
      intent: "police",
      title: "System Detected: Emergency Security Alert",
      actionText: "Connect to Police Control Room (112)",
      targetUrl: "/map?filter=police",
      badgeColor: "bg-purple-600 text-white",
      description: "Broadcast live GPS coordinates to nearest mobile police patrol unit."
    };
  }

  return null;
}
