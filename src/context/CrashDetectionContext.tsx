import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useDemo } from "./DemoContext";

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
  triggerCrashSimulation: (reason?: string) => void;
  cancelCrashAlert: () => void;
  confirmSOSNow: () => void;
  resetEmergencyState: () => void;
  requestSensorPermissions: () => Promise<boolean>;
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
  const { demoMode, triggerDemoEmergency } = useDemo();
  
  const [sensorActive, setSensorActive] = useState<boolean>(true);
  const [isCrashDetected, setIsCrashDetected] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [unconsciousMode, setUnconsciousMode] = useState<boolean>(false);
  const [activeEmergency, setActiveEmergency] = useState<AutoEmergencyPayload | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const goldenHourTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Default User Geolocation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.5672,
    lng: 77.2100, // Delhi NCR Corridor / Fallback India Hub
  });

  // Track Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
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
    if (!sensorActive || isCrashDetected) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = Date.now();

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null) return;

      const currentTime = Date.now();
      if (currentTime - lastTime > 100) {
        const diffTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        // Calculate G-Force Magnitude
        const gForce = Math.sqrt(x * x + y * y + z * z);
        
        // Sudden High Impact Threshold (e.g. > 26 m/s² ~ 2.6G deceleration/impact or drop)
        if (gForce > 28) {
          triggerCrashSimulation("High G-Force Telemetry Impact Detected");
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [sensorActive, isCrashDetected]);

  // Dispatch Auto SOS Workflow
  const dispatchAutoSOS = useCallback((wasUserResponded: boolean) => {
    const emergencyId = `SOS-CRASH-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mapsLink = `https://www.openstreetmap.org/?mlat=${userCoords.lat}&mlon=${userCoords.lng}#map=18/${userCoords.lat}/${userCoords.lng}`;
    const locationName = "Km 14 Expressway, Sector 62 Corridor";

    const contacts: EmergencyContactNotice[] = [
      { name: "Elena Rivera (Spouse)", phone: "+91 98765 43210", relationship: "Spouse", status: "Delivered via SMS/WhatsApp", timeSent: timeStr },
      { name: "Dr. Robert Miller", phone: "+91 98123 45678", relationship: "Primary Physician", status: "Delivered via SMS", timeSent: timeStr },
      { name: "National Emergency Hub 112", phone: "112", relationship: "Control Room", status: "High Priority Relay Dispatched", timeSent: timeStr },
    ];

    const emergencyPayload: AutoEmergencyPayload = {
      id: emergencyId,
      patientName: "Alex Rivera",
      type: "Automated Vehicle Crash & Impact Alert",
      severity: "critical",
      location: `${locationName} (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)})`,
      lat: userCoords.lat,
      lng: userCoords.lng,
      timestamp: timeStr,
      status: "active",
      isAutoSOS: true,
      crashDetected: true,
      unconscious: !wasUserResponded,
      contactsNotified: contacts,
      nearbyVolunteersNotifiedCount: 4,
      goldenHourMinutesLeft: 60,
    };

    setActiveEmergency(emergencyPayload);

    // Save to Firestore (if available)
    if (!demoMode) {
      addDoc(collection(db, "emergencies"), {
        id: emergencyId,
        type: emergencyPayload.type,
        severity: "critical",
        isAutoSOS: true,
        crashDetected: true,
        unconscious: !wasUserResponded,
        status: "active",
        patientName: "Alex Rivera",
        location: emergencyPayload.location,
        lat: userCoords.lat,
        lng: userCoords.lng,
        timestamp: new Date(),
        contactsNotified: contacts,
      }).catch((err) => console.warn("Firestore Auto SOS write notice:", err));
    }

    // Sync to Demo Context
    triggerDemoEmergency(`Auto Crash SOS (${!wasUserResponded ? "Unconscious Victim" : "Crash Triggered"})`);

    // Start Golden Hour Ticker
    if (goldenHourTimerRef.current) clearInterval(goldenHourTimerRef.current);
    goldenHourTimerRef.current = setInterval(() => {
      setActiveEmergency((prev) => {
        if (!prev) return null;
        if (prev.goldenHourMinutesLeft <= 1) return prev;
        return { ...prev, goldenHourMinutesLeft: prev.goldenHourMinutesLeft - 1 };
      });
    }, 60000);

  }, [userCoords, demoMode, triggerDemoEmergency]);

  // Handle Countdown Ticker
  useEffect(() => {
    if (isCrashDetected && countdown > 0 && !unconsciousMode) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isCrashDetected, unconsciousMode]);

  // Handle countdown reaching zero or playing urgent beep
  useEffect(() => {
    if (isCrashDetected && countdown === 0 && !unconsciousMode && !activeEmergency) {
      setUnconsciousMode(true);
      dispatchAutoSOS(false);
    } else if (countdown > 0 && countdown < 15 && isCrashDetected && !unconsciousMode) {
      playUrgentBeep(countdown % 2 === 0 ? 880 : 1040, 0.12);
    }
  }, [countdown, isCrashDetected, unconsciousMode, activeEmergency, dispatchAutoSOS]);

  // Trigger Crash Simulation (Hackathon Demo)
  const triggerCrashSimulation = (reason = "Simulated High-Speed Vehicle Impact") => {
    setIsCrashDetected(true);
    setCountdown(15);
    setUnconsciousMode(false);
    setActiveEmergency(null);
    playUrgentBeep(1200, 0.3);
  };

  // User clicked "I'm Safe"
  const cancelCrashAlert = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setIsCrashDetected(false);
    setCountdown(15);
    setUnconsciousMode(false);
  };

  // User clicked "Send SOS Now"
  const confirmSOSNow = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setUnconsciousMode(false);
    dispatchAutoSOS(true);
  };

  // Reset Emergency completely
  const resetEmergencyState = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (goldenHourTimerRef.current) clearInterval(goldenHourTimerRef.current);
    setIsCrashDetected(false);
    setCountdown(15);
    setUnconsciousMode(false);
    setActiveEmergency(null);
  };

  const toggleSensorActive = () => setSensorActive((prev) => !prev);

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
        triggerCrashSimulation,
        cancelCrashAlert,
        confirmSOSNow,
        resetEmergencyState,
        requestSensorPermissions,
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
