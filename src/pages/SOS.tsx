import React, { useState, useEffect } from "react";
import { ShieldAlert, Phone, AlertTriangle, MapPin, Activity, CheckCircle2, Zap, Car, ToggleLeft, ToggleRight, Radio, Shield, WifiOff, CloudUpload, Heart, Stethoscope, User, Lock, Eye, PhoneCall } from "lucide-react";
import { useOutletContext, Link, useLocation } from "react-router-dom";
import { useCrashDetection } from "../context/CrashDetectionContext";
import { SimulateCrashButton } from "../components/crash/SimulateCrashButton";
import { useOfflineSync } from "../context/OfflineSyncContext";
import { getLastLocation } from "../lib/offlineStore";
import { getLocalMedicalID, MedicalIDData } from "../lib/medicalIdStore";
import { EmergencyCallBanner } from "../components/EmergencyCallBanner";
import { triggerEmergencyCall, triggerEmergencySMS, generateSOSMessage, TEST_EMERGENCY_NUMBER } from "../lib/emergencyCall";
import { useAuth } from "../context/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export function SOS() {
  const { userProfile } = useAuth();
  const { demoMode } = useOutletContext<{ demoMode: boolean }>();
  const pageLocation = useLocation();
  const [sosActive, setSosActive] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [medicalID, setMedicalID] = useState<MedicalIDData>(() => getLocalMedicalID());
  const { sensorActive, toggleSensorActive } = useCrashDetection();
  const { isOnline, queueItem } = useOfflineSync();

  useEffect(() => {
    setMedicalID(getLocalMedicalID());
  }, [sosActive]);

  // Check URL params for auto-triggering SOS (e.g., from 1-TAP SOS header link)
  useEffect(() => {
    const searchParams = new URLSearchParams(pageLocation.search);
    if (searchParams.get("active") === "true" || searchParams.get("autoTrigger") === "true") {
      activateEmergency();
    }
  }, [pageLocation.search]);

  const fetchGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(null);
        },
        (err) => {
          console.error("GPS Position Error:", err);
          setLocationError("Location permission is unavailable.");
          setCoords(null);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationError("Location permission is unavailable.");
      setCoords(null);
    }
  };

  const activateEmergency = async () => {
    setSosActive(true);
    fetchGPSLocation();

    const sosMsg = generateSOSMessage({
      userName: userProfile?.name || "GoldenGuard Test User",
      coords,
    });

    let smsStatus = "PENDING";
    try {
      const response = await fetch("/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: TEST_EMERGENCY_NUMBER,
          latitude: coords ? coords.lat : "Location unavailable",
          longitude: coords ? coords.lng : "Location unavailable",
          timestamp: new Date().toISOString(),
          message: sosMsg,
        }),
      });
      const data = await response.json();
      smsStatus = response.ok && data.success ? "SENT" : "FAILED";
    } catch (err) {
      console.error("Backend SOS request failed in SOS page:", err);
      smsStatus = "FAILED";
    }

    const loc = getLastLocation();
    const sosRecord = {
      userId: userProfile?.uid || "anonymous",
      location: loc.address,
      coords: coords || { lat: loc.lat, lng: loc.lng },
      severity: "CRITICAL",
      emergencyContact: TEST_EMERGENCY_NUMBER,
      status: smsStatus === "SENT" ? "Active" : "Failed",
      smsStatus,
      type: "1-Tap SOS Emergency Dispatch",
      triggeredAt: new Date().toISOString(),
    };

    if (!isOnline) {
      await queueItem("sos", sosRecord);
      setOfflineSaved(true);
    } else {
      setOfflineSaved(false);
      try {
        await addDoc(collection(db, "emergencies"), {
          ...sosRecord,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("Failed to write emergency to Firestore:", e);
      }
    }
  };

  const toggleSOS = async () => {
    if (!sosActive) {
      await activateEmergency();
    } else {
      setSosActive(false);
      setOfflineSaved(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-500">
      
      {/* Crash Detection Telemetry & Hackathon Card */}
      <div className="w-full bg-gradient-to-r from-red-600/10 via-amber-500/10 to-red-600/10 border-2 border-amber-500/30 rounded-3xl p-6 text-left space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md">
              <Car className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  AUTOMATIC CRASH DETECTION & AUTO SOS
                </span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <h3 className="text-base font-black text-surface-900 dark:text-white">
                Unconscious Victim Protection System
              </h3>
            </div>
          </div>

          <button
            onClick={toggleSensorActive}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-xs font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors shrink-0"
          >
            <Radio className={`w-4 h-4 ${sensorActive ? "text-emerald-500 animate-pulse" : "text-surface-400"}`} />
            <span>Sensors: {sensorActive ? "ACTIVE" : "PAUSED"}</span>
            {sensorActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-600 dark:text-surface-400 font-medium">
            Uses G-force accelerometer spikes, orientation flips, and velocity telemetry. If an accident occurs and you are unresponsible for 15s, Auto SOS triggers contacts & volunteers instantly.
          </p>

          <SimulateCrashButton variant="primary" className="shrink-0" />
        </div>
      </div>

      {sosActive && (
        <EmergencyCallBanner 
          coords={coords} 
          locationError={locationError} 
          userName={userProfile?.name || "GoldenGuard Test User"}
          onCancel={() => setSosActive(false)} 
          className="my-4"
        />
      )}

      {sosActive ? (
        <div className="w-48 h-48 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center animate-ping absolute opacity-50"></div>
      ) : null}

      <button 
        onClick={toggleSOS}
        className={`relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
          sosActive 
            ? "bg-red-600 text-white shadow-red-600/50 scale-110" 
            : "bg-surface-100 dark:bg-surface-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:scale-105"
        }`}
      >
        <ShieldAlert className={`w-16 h-16 sm:w-20 sm:h-20 ${sosActive ? "animate-pulse" : ""}`} />
      </button>
      
      <div className="space-y-3 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 dark:text-white">
          {sosActive ? "Manual SOS Activated" : "Emergency SOS"}
        </h1>
        <p className="text-lg text-surface-600 dark:text-surface-400 max-w-lg mx-auto">
          {sosActive 
            ? "Emergency contacts and nearby responders have been alerted. Stay calm, help is on the way." 
            : "If you are in immediate danger, tap the shield to broadcast your location to responders."}
        </p>
      </div>

      {sosActive && offlineSaved && (
        <div className="w-full bg-amber-500/10 border-2 border-amber-500/40 p-4 rounded-2xl flex items-center gap-3 text-left animate-in fade-in duration-300">
          <WifiOff className="w-6 h-6 text-amber-500 shrink-0 animate-pulse" />
          <div>
            <div className="text-sm font-black text-amber-500">Emergency Saved in Offline Queue</div>
            <div className="text-xs text-surface-400">
              Internet is unavailable. Emergency ID and GPS coordinates are stored in IndexedDB and will automatically transmit to GoldenGuard emergency services as soon as connection is restored.
            </div>
          </div>
        </div>
      )}

      {sosActive && (
        <div className="w-full bg-gradient-to-b from-surface-900 via-surface-900 to-red-950 border-2 border-red-500/50 rounded-3xl p-6 text-left space-y-5 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                AI READOUT: AUTOMATED EMERGENCY MEDICAL BRIEF
              </span>
            </div>
            <Link 
              to={`/medical-id/view?uid=${medicalID.uid}`}
              target="_blank"
              className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Lockscreen ID View
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Blood Group */}
            <div className="p-4 rounded-2xl bg-red-600 text-white space-y-1 shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-200">BLOOD GROUP</span>
              <div className="text-3xl font-black">{medicalID.bloodGroup}</div>
            </div>

            {/* Allergies */}
            <div className="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> ALLERGIES
              </span>
              <div className="text-xs font-bold text-white">{medicalID.allergies || "None Reported"}</div>
            </div>

            {/* Medical Conditions */}
            <div className="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" /> CONDITIONS
              </span>
              <div className="text-xs font-bold text-white">{medicalID.medicalConditions || "None"}</div>
            </div>

            {/* Emergency Contacts */}
            <div className="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> PRIMARY CONTACT
              </span>
              <div className="text-xs font-bold text-white">
                {medicalID.emergencyContacts[0]?.name || "Not Set"}
              </div>
              <div className="text-[11px] font-mono text-emerald-400">
                {medicalID.emergencyContacts[0]?.phone || "N/A"}
              </div>
            </div>
          </div>

          {medicalID.emergencyContacts.length > 1 && (
            <div className="pt-2 border-t border-surface-800/80 flex flex-wrap gap-2 text-xs text-surface-400">
              <span className="font-bold text-surface-300">All Registered Contacts ({medicalID.emergencyContacts.length}):</span>
              {medicalID.emergencyContacts.map((c, i) => (
                <a 
                  key={i} 
                  href={`tel:${c.phone}`} 
                  className="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-emerald-400" /> {c.name} ({c.phone})
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {sosActive && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4 animate-in slide-in-from-bottom-4 duration-500 relative z-10">
           <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-green-200 dark:border-green-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
              <MapPin className="w-6 h-6 text-green-500" />
              <span className="text-sm font-bold text-surface-900 dark:text-white">Location Sent</span>
              <span className="text-xs text-surface-500">{demoMode ? "142 Sector 7 Expressway" : "Fetching..."}</span>
           </div>
           <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-blue-200 dark:border-blue-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
              <Activity className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-bold text-surface-900 dark:text-white">Responders</span>
              <span className="text-xs text-surface-500">{demoMode ? "3 En Route" : "Alerting..."}</span>
           </div>
           <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-amber-200 dark:border-amber-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-amber-500" />
              <span className="text-sm font-bold text-surface-900 dark:text-white">Contacts</span>
              <span className="text-xs text-surface-500">Notified</span>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8 relative z-10">
        <a 
          href={`tel:${TEST_EMERGENCY_NUMBER}`}
          onClick={(e) => {
            triggerEmergencyCall(TEST_EMERGENCY_NUMBER);
          }}
          className="flex flex-col items-center gap-3 p-6 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white rounded-2xl transition-all shadow-xl ring-2 ring-amber-400/40 hover:-translate-y-1 sm:col-span-1"
        >
          <PhoneCall className="w-8 h-8 animate-bounce text-amber-300" />
          <div className="font-black text-xl">9334387983</div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-amber-200">Test Emergency Contact</div>
        </a>

        <a 
          href="tel:108"
          onClick={(e) => {
            if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
              e.preventDefault();
              alert("Dialing 108 (National Ambulance)... Direct line connected to regional dispatch.");
            }
          }}
          className="flex flex-col items-center gap-3 p-6 bg-surface-900 dark:bg-surface-800 hover:bg-surface-800 text-white rounded-2xl transition-all shadow-lg hover:-translate-y-1"
        >
          <Phone className="w-7 h-7 text-red-400" />
          <div className="font-bold text-lg">Call 108</div>
          <div className="text-xs text-surface-300">National Ambulance</div>
        </a>

        <a 
          href="tel:112"
          onClick={(e) => {
            if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
              e.preventDefault();
              alert("Dialing 112 (General Emergency Helpline)... Priority dispatch initiated.");
            }
          }}
          className="flex flex-col items-center gap-3 p-6 bg-surface-900 dark:bg-surface-800 hover:bg-surface-800 text-white rounded-2xl transition-all shadow-lg hover:-translate-y-1"
        >
          <Phone className="w-7 h-7 text-blue-400" />
          <div className="font-bold text-lg">Call 112</div>
          <div className="text-xs text-surface-300">General Helpline</div>
        </a>
      </div>
    </div>
  );
}

