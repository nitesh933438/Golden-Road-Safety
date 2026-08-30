import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";

export interface EmergencyContactNotice {
  name: string;
  phone: string;
  relationship: string;
  status: string;
  timeSent: string;
}

export interface AutoEmergencyPayload {
  id: string;
  patientName: string;
  type: string;
  severity: "critical" | "high" | "medium";
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: "active" | "assigned" | "dispatched" | "resolved";
  isAutoSOS: boolean;
  crashDetected: boolean;
  unconscious: boolean;
  contactsNotified: EmergencyContactNotice[];
  nearbyVolunteersNotifiedCount: number;
  goldenHourMinutesLeft: number;
}

interface CrashDetectionContextType {
  sensorActive: boolean;
  setSensorActive: (active: boolean) => void;
  toggleSensorActive: () => void;
  isCrashDetected: boolean;
  countdown: number;
  unconsciousMode: boolean;
  activeEmergency: AutoEmergencyPayload | null;
  cancelCrashAlert: () => void;
  confirmSOSNow: () => void;
  resetEmergencyState: () => void;
  requestSensorPermissions: () => Promise<boolean>;
  triggerSimulatedCrash: () => void;
}

const CrashDetectionContext = createContext<CrashDetectionContextType | undefined>(undefined);

// Web Audio API Synth Beep for high-urgency audio countdown
function playUrgentBeep(frequency = 880, duration = 0.15) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Audio context may be muted before user gesture, fail gracefully
  }
}

export const CrashDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  
  const [sensorActive, setSensorActive] = useState<boolean>(() => {
    try {
      return window.self === window.top; // Enable by default on main tab, false in sandboxed iframe
    } catch (e) {
      return false; // Safe fallback
    }
  });

  const [isCrashDetected, setIsCrashDetected] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [unconsciousMode, setUnconsciousMode] = useState<boolean>(false);
  const [activeEmergency, setActiveEmergency] = useState<AutoEmergencyPayload | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const goldenHourTimerRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Guards to prevent duplicate triggers / multiple SOS
  const hasTriggeredSOSRef = useRef<boolean>(false);
  const isDispatchingRef = useRef<boolean>(false);

  // Default User Geolocation & Status
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"available" | "permission_denied" | "unavailable" | "timeout" | "unsupported">("available");

  // Track Geolocation safely without looping
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords && Number.isFinite(pos.coords.latitude) && Number.isFinite(pos.coords.longitude)) {
            setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocationStatus("available");
          } else {
            setLocationStatus("unavailable");
          }
        },
        (err) => {
          if (err.code === 1) {
            console.warn("Geolocation permission denied (likely iframe permissions policy or user denial).");
            setLocationStatus("permission_denied");
          } else if (err.code === 2) {
            console.warn("Geolocation position unavailable.");
            setLocationStatus("unavailable");
          } else if (err.code === 3) {
            console.warn("Geolocation request timed out.");
            setLocationStatus("timeout");
          } else {
            setLocationStatus("unavailable");
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } catch (e) {
      setLocationStatus("unavailable");
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Request Device Motion Permissions (for iOS 13+ Safari)
  const requestSensorPermissions = async (): Promise<boolean> => {
    if (typeof (DeviceMotionEvent as any)?.requestPermission === "function") {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === "granted") {
          setSensorActive(true);
          return true;
        }
      } catch (err) {
        console.warn("Sensor permission request error:", err);
      }
      return false;
    }
    setSensorActive(true);
    return true;
  };

  // Real Sensor Listener (Accelerometer / Gyroscope Anomaly Detection)
  useEffect(() => {
    if (!sensorActive || isCrashDetected || activeEmergency || isDispatchingRef.current) return;

    let lastTime = Date.now();

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null) return;

      const currentTime = Date.now();
      if (currentTime - lastTime > 100) {
        lastTime = currentTime;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        // Calculate G-Force Magnitude
        const gForce = Math.sqrt(x * x + y * y + z * z);
        
        // Sudden High Impact Threshold (> 28 m/s²)
        if (gForce > 28 && !isCrashDetected && !hasTriggeredSOSRef.current && !activeEmergency) {
          setIsCrashDetected(true);
          setCountdown(15);
          setUnconsciousMode(false);
          hasTriggeredSOSRef.current = false;
          playUrgentBeep(1200, 0.3);
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [sensorActive, isCrashDetected, activeEmergency]);

  // Dispatch Auto SOS Workflow (guarded against duplicate triggers)
  const dispatchAutoSOS = useCallback((wasUserResponded: boolean) => {
    if (hasTriggeredSOSRef.current || isDispatchingRef.current || activeEmergency) return;
    isDispatchingRef.current = true;
    hasTriggeredSOSRef.current = true;

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setIsCrashDetected(false);
    setUnconsciousMode(!wasUserResponded);

    const emergencyId = `SOS-CRASH-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locationName = userCoords ? "GPS Verified Location" : "Location Unavailable (Manual Verification Required)";

    const contacts: EmergencyContactNotice[] = [
      { name: "Emergency Dispatch 112", phone: "112", relationship: "Control Room", status: "High Priority Relay Dispatched", timeSent: timeStr },
    ];

    const emergencyPayload: AutoEmergencyPayload = {
      id: emergencyId,
      patientName: userProfile?.name || "GoldenGuard User",
      type: "Automated Vehicle Crash & Impact Alert",
      severity: "critical",
      location: userCoords ? `${locationName} (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)})` : locationName,
      lat: userCoords ? userCoords.lat : 0,
      lng: userCoords ? userCoords.lng : 0,
      timestamp: timeStr,
      status: "active",
      isAutoSOS: true,
      crashDetected: true,
      unconscious: !wasUserResponded,
      contactsNotified: contacts,
      nearbyVolunteersNotifiedCount: 0,
      goldenHourMinutesLeft: 60,
    };

    setActiveEmergency(emergencyPayload);

    // Save to Firestore safely
    setDoc(doc(db, "emergencies", emergencyId), {
      id: emergencyId,
      userId: userProfile?.uid || "anonymous",
      type: emergencyPayload.type,
      severity: "critical",
      priority: "CRITICAL",
      isAutoSOS: true,
      crashDetected: true,
      unconscious: !wasUserResponded,
      status: "CREATED",
      patientName: userProfile?.name || "GoldenGuard User",
      location: emergencyPayload.location,
      latitude: userCoords ? userCoords.lat : 0,
      longitude: userCoords ? userCoords.lng : 0,
      accuracy: null,
      locationSource: userCoords ? "GPS" : "UNAVAILABLE",
      contactsNotified: contacts,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch((err) => console.warn("Firestore Auto SOS write notice:", err));

    // Start Golden Hour Ticker
    if (goldenHourTimerRef.current) clearInterval(goldenHourTimerRef.current);
    goldenHourTimerRef.current = setInterval(() => {
      setActiveEmergency((prev) => {
        if (!prev) return null;
        if (prev.goldenHourMinutesLeft <= 1) return prev;
        return { ...prev, goldenHourMinutesLeft: prev.goldenHourMinutesLeft - 1 };
      });
    }, 60000);

    isDispatchingRef.current = false;
  }, [userCoords, userProfile, activeEmergency]);

  // Handle Countdown Ticker (exactly 15 -> 0 once)
  useEffect(() => {
    if (isCrashDetected && countdown > 0 && !hasTriggeredSOSRef.current) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [isCrashDetected]);

  // Handle countdown reaching zero -> No Response -> Auto SOS
  useEffect(() => {
    if (isCrashDetected && countdown === 0 && !hasTriggeredSOSRef.current) {
      dispatchAutoSOS(false);
    } else if (countdown > 0 && countdown < 15 && isCrashDetected && !hasTriggeredSOSRef.current) {
      playUrgentBeep(countdown % 2 === 0 ? 880 : 1040, 0.12);
    }
  }, [countdown, isCrashDetected, dispatchAutoSOS]);

  // User selected "I AM SAFE"
  const cancelCrashAlert = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsCrashDetected(false);
    setCountdown(15);
    setUnconsciousMode(false);
    hasTriggeredSOSRef.current = false;
  }, []);

  // User selected "I AM NOT SAFE"
  const confirmSOSNow = useCallback(() => {
    if (hasTriggeredSOSRef.current || isDispatchingRef.current) return;
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    dispatchAutoSOS(true);
  }, [dispatchAutoSOS]);

  // Reset Emergency completely
  const resetEmergencyState = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (goldenHourTimerRef.current) {
      clearInterval(goldenHourTimerRef.current);
      goldenHourTimerRef.current = null;
    }
    setIsCrashDetected(false);
    setCountdown(15);
    setUnconsciousMode(false);
    setActiveEmergency(null);
    hasTriggeredSOSRef.current = false;
    isDispatchingRef.current = false;
  }, []);

  const toggleSensorActive = useCallback(() => setSensorActive((prev) => !prev), []);

  // Trigger simulated crash for testing / manual demonstration
  const triggerSimulatedCrash = useCallback(() => {
    if (hasTriggeredSOSRef.current || activeEmergency || isCrashDetected) return;
    setIsCrashDetected(true);
    setCountdown(15);
    setUnconsciousMode(false);
    hasTriggeredSOSRef.current = false;
    playUrgentBeep(1200, 0.3);
  }, [activeEmergency, isCrashDetected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (goldenHourTimerRef.current) clearInterval(goldenHourTimerRef.current);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <CrashDetectionContext.Provider
      value={{
        sensorActive,
        setSensorActive,
        toggleSensorActive,
        isCrashDetected,
        countdown,
        unconsciousMode,
        activeEmergency,
        cancelCrashAlert,
        confirmSOSNow,
        resetEmergencyState,
        requestSensorPermissions,
        triggerSimulatedCrash,
      }}
    >
      {children}
    </CrashDetectionContext.Provider>
  );
};

export const useCrashDetection = () => {
  const context = useContext(CrashDetectionContext);
  if (!context) {
    throw new Error("useCrashDetection must be used within a CrashDetectionProvider");
  }
  return context;
};
