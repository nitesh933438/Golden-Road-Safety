import React, { useState, useEffect } from "react";
import { ShieldAlert, Phone, AlertTriangle, MapPin, Activity, CheckCircle2, Zap, Car, ToggleLeft, ToggleRight, Radio, Shield, WifiOff, CloudUpload, Heart, Stethoscope, User, Lock, Eye, PhoneCall, Clock } from "lucide-react";
import { useOutletContext, Link, useLocation } from "react-router-dom";
import { useCrashDetection } from "../context/CrashDetectionContext";
import { useOfflineSync } from "../context/OfflineSyncContext";
import { getLastLocation } from "../lib/offlineStore";
import { getLocalMedicalID, MedicalIDData } from "../lib/medicalIdStore";
import { EmergencyCallBanner } from "../components/EmergencyCallBanner";
import { triggerEmergencyCall, triggerEmergencySMS, generateSOSMessage, TEST_EMERGENCY_NUMBER } from "../lib/emergencyCall";
import { useAuth } from "../context/AuthContext";
import { addDoc, collection, serverTimestamp, doc, setDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { createEmergencyIncident } from "../lib/incidentService";
import { getApiUrl } from "../lib/api";
import { BatteryStatus } from "../components/BatteryStatus";
import { VoiceSOSCard } from "../components/voice/VoiceSOSCard";
import { useVoiceSOS } from "../context/VoiceSOSContext";

export function SOS() {
  const { userProfile } = useAuth();
  
  const pageLocation = useLocation();
  const [sosActive, setSosActive] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [medicalID, setMedicalID] = useState<MedicalIDData>(() => getLocalMedicalID());
  const { sensorActive, toggleSensorActive, triggerSimulatedCrash, activeEmergency, resetEmergencyState } = useCrashDetection();
  const { isOnline, queueItem } = useOfflineSync();
  const [isProcessingSOS, setIsProcessingSOS] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);

  const [activeSosId, setActiveSosId] = useState<string | null>(null);
  const [activeSosRecord, setActiveSosRecord] = useState<any | null>(null);

  // Sync active emergency from CrashDetectionContext if present
  useEffect(() => {
    if (activeEmergency) {
      setActiveSosId(activeEmergency.id);
      setActiveSosRecord(activeEmergency);
      setSosActive(true);
      if (activeEmergency.lat && activeEmergency.lng) {
        setCoords({ lat: activeEmergency.lat, lng: activeEmergency.lng });
      }
    }
  }, [activeEmergency]);

  // Check URL params for auto-triggering SOS from 1-TAP button click with 1-click execution, then clean up URL
  useEffect(() => {
    const searchParams = new URLSearchParams(pageLocation.search);
    if ((searchParams.get("active") === "true" || searchParams.get("autoTrigger") === "true")) {
      if (!sosActive && !isProcessingSOS && !activeSosId && !activeEmergency) {
        activateEmergency();
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [pageLocation.search, sosActive, isProcessingSOS, activeSosId, activeEmergency]);

  useEffect(() => {
    setMedicalID(getLocalMedicalID());
  }, [sosActive]);

  const [manualAddress, setManualAddress] = useState("");
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [goldenHourTimerStr, setGoldenHourTimerStr] = useState<string>("--:--");
  const [goldenHourSeconds, setGoldenHourSeconds] = useState<number | null>(null);

  // Real-time calculation of Golden Hour countdown from backend createdAt timestamp
  useEffect(() => {
    if (!activeSosRecord?.createdAt) {
      setGoldenHourTimerStr("--:--");
      setGoldenHourSeconds(null);
      return;
    }

    let createdAtMillis = Date.now();
    if (activeSosRecord.createdAt?.seconds) {
      createdAtMillis = activeSosRecord.createdAt.seconds * 1000;
    } else if (typeof activeSosRecord.createdAt === "string") {
      createdAtMillis = new Date(activeSosRecord.createdAt).getTime();
    } else if (typeof activeSosRecord.createdAt === "number") {
      createdAtMillis = activeSosRecord.createdAt;
    }

    // Configured deadline: 60 minutes from createdAt
    const deadlineMillis = createdAtMillis + 60 * 60 * 1000;

    const updateGoldenHour = () => {
      const diff = deadlineMillis - Date.now();
      const remSec = Math.max(0, Math.floor(diff / 1000));
      setGoldenHourSeconds(remSec);
      if (remSec <= 0) {
        setGoldenHourTimerStr("EXPIRED (00:00)");
      } else {
        const m = Math.floor(remSec / 60);
        const s = remSec % 60;
        setGoldenHourTimerStr(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      }
    };

    updateGoldenHour();
    const interval = setInterval(updateGoldenHour, 1000);
    return () => clearInterval(interval);
  }, [activeSosRecord?.createdAt]);

  // Fetch initial active SOS from Firestore sosRequests if logged in
  useEffect(() => {
    if (!userProfile?.uid) return;

    const loadActiveSOS = async () => {
      try {
        const q = query(
          collection(db, "sosRequests"),
          where("userId", "==", userProfile.uid)
        );
        const querySnapshot = await getDocs(q);
        const activeDoc = querySnapshot.docs.find(doc => {
          const status = doc.data().status;
          return ["CREATED", "TRIAGING", "DISPATCHING", "ASSIGNED", "RESPONDER_EN_ROUTE", "ARRIVED"].includes(status);
        });

        if (activeDoc) {
          const data = activeDoc.data();
          setActiveSosId(activeDoc.id);
          setActiveSosRecord(data);
          setSosActive(true);
          if (data.latitude && data.longitude) {
            setCoords({ lat: data.latitude, lng: data.longitude });
          }
        }
      } catch (err) {
        console.error("Error loading active SOS from Firestore:", err);
      }
    };

    loadActiveSOS();
  }, [userProfile?.uid]);

  // Real-time listener for active sosRequests record
  useEffect(() => {
    if (!activeSosId || !db) return;

    const docRef = doc(db, "sosRequests", activeSosId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setActiveSosRecord(data);
          
          const terminalStatuses = ["RESOLVED", "CANCELLED", "FAILED"];
          if (terminalStatuses.includes(data.status)) {
            setSosActive(false);
            setActiveSosId(null);
            setActiveSosRecord(null);
          } else {
            setSosActive(true);
            if (data.latitude && data.longitude) {
              setCoords({ lat: data.latitude, lng: data.longitude });
            }
          }
        } else {
          setSosActive(false);
          setActiveSosId(null);
          setActiveSosRecord(null);
        }
      },
      (error) => {
        console.error("Real-time listener error on sosRequests:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeSosId]);

  const getGPSLocationAsync = (): Promise<{lat: number, lng: number, accuracy: number | null} | null> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (pos && pos.coords && Number.isFinite(pos.coords.latitude) && Number.isFinite(pos.coords.longitude)) {
              setLocationPermissionDenied(false);
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy || null
              });
            } else {
              resolve(null);
            }
          },
          (err) => {
            console.error("GPS Position Error:", err);
            setLocationPermissionDenied(true);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setLocationPermissionDenied(true);
        resolve(null);
      }
    });
  };

  const activateEmergency = async () => {
    if (isProcessingSOS) return;
    if (sosActive || activeSosId || activeEmergency) {
      setSosActive(true);
      return;
    }
    setIsProcessingSOS(true);
    setSosError(null);
    setLocationError(null);

    try {
      // Step 1: Get GPS location.
      const freshCoords = await getGPSLocationAsync();
      
      let finalLocationText = "";
      if (freshCoords) {
        setCoords({ lat: freshCoords.lat, lng: freshCoords.lng });
        finalLocationText = `GPS (${freshCoords.lat.toFixed(4)}, ${freshCoords.lng.toFixed(4)})`;
      } else {
        // Location unavailable or permission denied -> Allow manual location
        setLocationError("GPS location unavailable. Using manual location reporting.");
        finalLocationText = manualAddress.trim() || "Manual Location - Address pending verification";
      }

      // Unique SOS ID
      const uniqueSosId = "sos_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);

      const sosMsg = generateSOSMessage({
        userName: userProfile?.name || "GoldenGuard User",
        coords: freshCoords ? { lat: freshCoords.lat, lng: freshCoords.lng } : undefined,
      });

      let smsStatus = "PENDING";
      let apiSmsFailed = false;

      // Backend SMS broadcast call
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(getApiUrl("/api/emergency/sos"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: TEST_EMERGENCY_NUMBER,
            latitude: freshCoords?.lat || null,
            longitude: freshCoords?.lng || null,
            timestamp: new Date().toISOString(),
            message: `${sosMsg} Location: ${finalLocationText}`,
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const text = await response.text();
        let data: any = null;
        if (text) {
          try { data = JSON.parse(text); } catch (e) {}
        }

        if (!response.ok || !data?.success) {
          smsStatus = "FAILED";
          apiSmsFailed = true;
        } else {
          smsStatus = "SENT";
        }
      } catch (err: any) {
        smsStatus = "FAILED";
        apiSmsFailed = true;
      }

      // Medical profile snapshot
      const medProfileSnap = {
        bloodGroup: medicalID.bloodGroup || "Unknown",
        fullName: medicalID.fullName || userProfile?.name || "Citizen",
        allergies: medicalID.allergies || "None",
        medicalConditions: medicalID.medicalConditions || "None",
        emergencyContacts: medicalID.emergencyContacts || []
      };

      // Real sosRequests payload strictly adhering to schema:
      // sosId, userId, createdAt, location, latitude, longitude, severity, description, medicalProfileReference, status, assignedVolunteerId, assignedHospitalId, assignedPoliceId, updatedAt, resolvedAt
      const sosPayload = {
        sosId: uniqueSosId,
        userId: userProfile?.uid || "anonymous",
        userName: userProfile?.name || "GoldenGuard User",
        userPhone: userProfile?.phone || TEST_EMERGENCY_NUMBER,
        emergencyType: "General Emergency SOS",
        createdAt: serverTimestamp(),
        location: finalLocationText,
        latitude: freshCoords?.lat || null,
        longitude: freshCoords?.lng || null,
        severity: "CRITICAL",
        description: "1-Tap Emergency SOS Triggered",
        medicalProfileReference: medProfileSnap,
        status: "CREATED",
        assignedVolunteerId: null,
        assignedHospitalId: null,
        assignedPoliceId: null,
        updatedAt: serverTimestamp(),
        resolvedAt: null
      };

      if (!isOnline) {
        await queueItem("sos", sosPayload);
        setOfflineSaved(true);
        setActiveSosId(uniqueSosId);
        setActiveSosRecord({
          ...sosPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setSosActive(true);
      } else {
        setOfflineSaved(false);
        try {
          if (!db) {
            throw new Error("Firebase Firestore is not configured. Database unavailable.");
          }
          // Write to /sosRequests
          await setDoc(doc(db, "sosRequests", uniqueSosId), sosPayload);

          // Mirror write to /emergencies for legacy map sync
          await setDoc(doc(db, "emergencies", uniqueSosId), {
            ...sosPayload,
            id: uniqueSosId,
            type: "1-TAP SOS Beacon",
            smsStatus
          });

          // Mirror to /incidents for command center
          await createEmergencyIncident({
            reporterUid: userProfile?.uid || "anonymous",
            reporterName: userProfile?.name || "GoldenGuard Citizen",
            reporterPhone: userProfile?.phone || TEST_EMERGENCY_NUMBER,
            latitude: freshCoords?.lat || 0,
            longitude: freshCoords?.lng || 0,
            locationText: finalLocationText,
            priority: "critical",
            type: "1-TAP SOS Beacon",
            notes: sosMsg
          });

          setActiveSosId(uniqueSosId);
          setActiveSosRecord({
            ...sosPayload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          // ONLY set active AFTER backend confirms creation
          setSosActive(true);
        } catch (dbErr: any) {
          console.error("Failed to write sosRequest to database:", dbErr);
          setSosError("Database connection failed. SOS request could not be saved. Please click Retry.");
          setSosActive(false);
          setIsProcessingSOS(false);
          return;
        }
      }
    } catch (e: any) {
      console.error("SOS Activation failure:", e);
      setSosError("Failed to issue emergency request. Please call emergency services immediately.");
      setSosActive(false);
    } finally {
      setIsProcessingSOS(false);
    }
  };

  const toggleSOS = async () => {
    if (!sosActive) {
      if (!isProcessingSOS) {
        await activateEmergency();
      }
    } else {
      if (activeSosId) {
        setIsProcessingSOS(true);
        try {
          if (isOnline) {
            await setDoc(doc(db, "sosRequests", activeSosId), {
              status: "CANCELLED",
              updatedAt: serverTimestamp(),
              resolvedAt: serverTimestamp()
            }, { merge: true });

            await setDoc(doc(db, "emergencies", activeSosId), {
              status: "CANCELLED",
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (err) {
          console.error("Error cancelling SOS:", err);
        } finally {
          setIsProcessingSOS(false);
        }
      }
      resetEmergencyState();
      setSosActive(false);
      setActiveSosId(null);
      setActiveSosRecord(null);
      setOfflineSaved(false);
      setSosError(null);
    }
  };

  // Map active record status to step index matching spec: CREATED -> TRIAGING -> DISPATCHING -> ASSIGNED -> RESPONDER_EN_ROUTE -> ARRIVED -> RESOLVED
  const currentDbStatus = activeSosRecord?.status || "CREATED";
  const getStatusIndex = (st: string) => {
    switch (st) {
      case "CREATED":
        return 0;
      case "TRIAGING":
        return 1;
      case "DISPATCHING":
        return 2;
      case "ASSIGNED":
        return 3;
      case "RESPONDER_EN_ROUTE":
      case "EN_ROUTE":
      case "DISPATCHED":
        return 4;
      case "ARRIVED":
        return 5;
      case "RESOLVED":
        return 6;
      default:
        return 0;
    }
  };
  const activeStepIdx = getStatusIndex(currentDbStatus);

  const citizenSteps = [
    { title: "Created", desc: "Emergency signal registered" },
    { title: "Triaging", desc: "Command center evaluating priority" },
    { title: "Dispatching", desc: "Locating nearby responders" },
    { title: "Assigned", desc: "Responders allocated to case" },
    { title: "En Route", desc: "Helper traveling to location" },
    { title: "Arrived", desc: "Responders on scene" },
    { title: "Resolved", desc: "Emergency completed" },
  ];

  const handleSosButtonClick = () => {
    toggleSOS();
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-0 py-4 sm:py-8 text-center space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full px-1 min-[360px]:px-2">
      
      {/* Device Battery Emergency Failure Warning (< 20%) */}
      <div className="w-full">
        <BatteryStatus variant="emergency-banner" />
      </div>

      {/* Crash Detection Telemetry & Hackathon Card */}
      <div className="w-full bg-gradient-to-r from-red-600/10 via-amber-500/10 to-red-600/10 border-2 border-amber-500/30 rounded-3xl p-4 min-[360px]:p-6 text-left space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Car className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] min-[360px]:text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 break-words">
                  AUTOMATIC CRASH DETECTION & AUTO SOS
                </span>
                <span className="flex h-2.5 w-2.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <h3 className="text-sm min-[360px]:text-base font-black text-surface-900 dark:text-white truncate">
                Unconscious Victim Protection System
              </h3>
            </div>
          </div>

          <button
            onClick={toggleSensorActive}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-[11px] min-[360px]:text-xs font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors shrink-0 w-full md:w-auto justify-center"
          >
            <Radio className={`w-4 h-4 ${sensorActive ? "text-emerald-500 animate-pulse" : "text-surface-400"}`} />
            <span>Sensors: {sensorActive ? "ACTIVE" : "PAUSED"}</span>
            {sensorActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-600 dark:text-surface-400 font-medium">
            Uses G-force accelerometer spikes, orientation flips, and velocity telemetry. If an accident occurs and you are unresponsive for 15s, Auto SOS triggers contacts & volunteers instantly.
          </p>
          <button
            type="button"
            onClick={() => triggerSimulatedCrash()}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-black" />
            <span>Test Accident Detection</span>
          </button>
        </div>
      </div>

      {/* Voice-Activated Hands-Free SOS Card */}
      <VoiceSOSCard className="w-full" />

      {/* LOCATION PERMISSION / MANUAL ADDRESS CARD */}
      {!sosActive && (
        <div className="w-full bg-surface-900/90 border border-surface-800 rounded-3xl p-4 min-[360px]:p-5 text-left space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-surface-200">
            <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-sm font-bold text-white">
              Allow location so we can find nearby help.
            </span>
          </div>
          <p className="text-xs text-surface-400">
            We only request GPS permission when you confirm an emergency. If permission is denied or location is unavailable, you can manually enter your address below.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter manual location or landmark (e.g., Gate 3, MG Road Metro)"
              className="flex-1 bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={async () => {
                setLocationError(null);
                const fresh = await getGPSLocationAsync();
                if (fresh) {
                  setCoords({ lat: fresh.lat, lng: fresh.lng });
                }
              }}
              className="px-4 py-2.5 bg-surface-800 hover:bg-surface-700 text-amber-400 text-xs font-bold rounded-xl border border-surface-700 transition-colors shrink-0"
            >
              Detect GPS
            </button>
          </div>
        </div>
      )}

      {/* GOLDEN HOUR COUNTDOWN BANNER (Calculated dynamically from backend createdAt) */}
      {sosActive && (
        <div className="w-full bg-gradient-to-r from-amber-950/80 via-red-950/80 to-amber-950/80 border-2 border-amber-500/50 rounded-3xl p-4 min-[360px]:p-5 text-left shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Zap className="w-6 h-6 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-400">
                GOLDEN HOUR CRITICAL WINDOW
              </div>
              <p className="text-xs text-surface-300 font-medium">
                Calculated strictly from server creation timestamp ({activeSosRecord?.createdAt ? new Date(activeSosRecord.createdAt.seconds ? activeSosRecord.createdAt.seconds * 1000 : activeSosRecord.createdAt).toLocaleTimeString() : "Just now"})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 min-[360px]:px-5 min-[360px]:py-2.5 rounded-2xl border border-amber-500/40 shrink-0">
            <Clock className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-xl min-[360px]:text-2xl font-mono font-black text-amber-400 tracking-wider">
              {goldenHourTimerStr}
            </span>
          </div>
        </div>
      )}

      {sosActive && (
        <EmergencyCallBanner 
          coords={coords} 
          locationError={locationError} 
          userName={userProfile?.name || "GoldenGuard User"}
          onCancel={() => setSosActive(false)} 
          className="my-4"
        />
      )}

      {sosActive ? (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="w-48 h-48 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center animate-ping opacity-50"></div>
        </div>
      ) : null}

      <button 
        onClick={handleSosButtonClick}
        disabled={isProcessingSOS}
        className={`relative z-10 px-4 min-[360px]:px-8 py-5 min-[360px]:py-6 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 shadow-2xl min-h-[110px] sm:min-h-[140px] w-full max-w-md ${
          sosActive 
            ? "bg-red-600 text-white shadow-red-600/50 scale-105" 
            : isProcessingSOS
            ? "bg-amber-500 text-black shadow-amber-500/50 scale-102 cursor-wait"
            : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 hover:scale-102 active:scale-98"
        }`}
      >
        <div className="flex items-center gap-3">
          <ShieldAlert className={`w-7 h-7 sm:w-8 sm:h-8 ${sosActive || isProcessingSOS ? "animate-pulse" : ""}`} />
          <span className="text-lg min-[360px]:text-xl sm:text-2xl font-black tracking-tight">
            {isProcessingSOS ? "Sending SOS..." : sosActive ? "Cancel Emergency SOS" : "GET EMERGENCY HELP"}
          </span>
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-red-100 mt-1 opacity-90">
          Police • Ambulance • Nearby Help
        </span>
      </button>



      {/* REAL STATUS STEP PROGRESSION AFTER CONFIRMATION */}
      {sosActive && (
        <div className="w-full bg-surface-900 border-2 border-red-500/50 rounded-3xl p-6 text-left space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-surface-800 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Emergency request sent
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {citizenSteps.map((step, idx) => {
              const isCompleted = idx < activeStepIdx;
              const isCurrent = idx === activeStepIdx;

              return (
                <div
                  key={step.title}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-red-600/30 border-red-400 text-white shadow-md ring-2 ring-red-500/50"
                      : isCompleted
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-surface-950/50 border-surface-800 text-surface-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-surface-600 shrink-0" />
                    )}
                    <span className="text-[11px] font-bold truncate">{step.title}</span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-tight">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="space-y-3 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 dark:text-white">
          {isProcessingSOS ? "Sending SOS..." : sosActive ? "Manual SOS Activated" : "Emergency SOS"}
        </h1>
        <p className="text-lg text-surface-600 dark:text-surface-400 max-w-lg mx-auto">
          {isProcessingSOS
            ? "Acquiring location and alerting emergency responders..."
            : sosActive 
            ? "Emergency contacts and nearby responders have been alerted. Stay calm, help is on the way." 
            : "If you are in immediate danger, tap the shield to broadcast your location to responders."}
        </p>
      </div>

      {sosError && (
        <div className="w-full bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-left">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <div className="text-sm font-medium text-red-600 dark:text-red-400">
            {sosError}
          </div>
        </div>
      )}

      {locationError && !sosError && (
        <div className="w-full bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl flex items-center gap-3 text-left">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {locationError}
          </div>
        </div>
      )}

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
        <div className="flex flex-col gap-4 w-full mt-4 animate-in slide-in-from-bottom-4 duration-500 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
             <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-green-200 dark:border-green-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
                <MapPin className="w-6 h-6 text-green-500" />
                <span className="text-sm font-bold text-surface-900 dark:text-white">Location (GPS)</span>
                <span className="text-xs text-surface-500 font-mono">
                  {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Locating..."}
                </span>
             </div>
             <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-blue-200 dark:border-blue-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
                <Activity className="w-6 h-6 text-blue-500" />
                <span className="text-sm font-bold text-surface-900 dark:text-white">Emergency Status</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider">
                  {activeSosRecord?.status || "CREATED"}
                </span>
             </div>
             <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md rounded-2xl p-4 border border-amber-200 dark:border-amber-900/30 flex flex-col items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-amber-500" />
                <span className="text-sm font-bold text-surface-900 dark:text-white">Alert Dispatch</span>
                <span className="text-xs text-surface-500">
                  {activeSosRecord?.smsStatus === "SENT" ? "SMS Dispatched" : activeSosRecord?.smsStatus === "FAILED" ? "SMS Not Configured" : "Dispatches Alerting"}
                </span>
             </div>
          </div>

          <a 
            href={`sms:${TEST_EMERGENCY_NUMBER}?body=${encodeURIComponent(activeSosRecord?.message || "Emergency Help Requested!")}`}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Phone className="w-4 h-4" /> Send Backup SMS via Device
          </a>

          <div className="text-xs text-surface-500 dark:text-surface-400 font-medium">
            🔒 Real-time GPS location is secure. Access is restricted exclusively to you, your emergency contacts, and assigned first-responders.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8 relative z-10">
        <a 
          href={`tel:${TEST_EMERGENCY_NUMBER}`}
          onClick={(e) => {
            triggerEmergencyCall(TEST_EMERGENCY_NUMBER);
          }}
          className="flex flex-col items-center gap-2 p-4 min-[360px]:p-6 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white rounded-2xl transition-all shadow-xl ring-2 ring-amber-400/40 hover:-translate-y-1 sm:col-span-1"
        >
          <PhoneCall className="w-8 h-8 animate-bounce text-amber-300" />
          <div className="font-black text-lg min-[360px]:text-xl break-all">9334387983</div>
          <div className="text-[10px] min-[360px]:text-xs font-extrabold uppercase tracking-wider text-amber-200">Test Emergency Contact</div>
        </a>

        <a 
          href="tel:108"
          onClick={(e) => {
            if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
              e.preventDefault();
              alert("Dialing 108 (National Ambulance)... Direct line connected to regional dispatch.");
            }
          }}
          className="flex flex-col items-center gap-2 p-4 min-[360px]:p-6 bg-surface-900 dark:bg-surface-800 hover:bg-surface-800 text-white rounded-2xl transition-all shadow-lg hover:-translate-y-1"
        >
          <Phone className="w-7 h-7 text-red-400" />
          <div className="font-bold text-base min-[360px]:text-lg">Call 108</div>
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
          className="flex flex-col items-center gap-2 p-4 min-[360px]:p-6 bg-surface-900 dark:bg-surface-800 hover:bg-surface-800 text-white rounded-2xl transition-all shadow-lg hover:-translate-y-1"
        >
          <Phone className="w-7 h-7 text-blue-400" />
          <div className="font-bold text-base min-[360px]:text-lg">Call 112</div>
          <div className="text-xs text-surface-300">General Helpline</div>
        </a>
      </div>
    </div>
  );
}

