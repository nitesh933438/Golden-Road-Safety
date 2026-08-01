import React, { useState, useEffect, useRef } from "react";
import { 
  Bike, Car, ShieldCheck, Play, Square, Pause, AlertTriangle, Zap, 
  Clock, Gauge, Navigation, MapPin, Battery, BatteryCharging, Wifi, 
  WifiOff, History, CheckCircle2, PhoneCall, ShieldAlert, Users, 
  RefreshCw, ArrowRight, Shield, Activity, ChevronRight, Download
} from "lucide-react";
import { useCrashDetection } from "../context/CrashDetectionContext";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface RideHistoryItem {
  id: string;
  date: string;
  destination: string;
  distanceKm: number;
  durationSec: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  emergencyTriggered: boolean;
  status: "completed" | "interrupted" | "emergency";
}

export function SafeRide() {
  const { triggerCrashSimulation, activeEmergency } = useCrashDetection();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Ride State
  const [isRideActive, setIsRideActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>("");
  
  // Telemetry Metrics
  const [durationSec, setDurationSec] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(88);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentAddress, setCurrentAddress] = useState<string>("Km 14 Expressway, Sector 62 Corridor");

  // Ride History State
  const [rideHistory, setRideHistory] = useState<RideHistoryItem[]>(() => {
    const saved = localStorage.getItem("goldenguard_ride_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: "RIDE-902",
        date: "2026-07-31 18:45",
        destination: "Cyber City Hub, Sector 29",
        distanceKm: 14.2,
        durationSec: 1320, // 22 mins
        avgSpeedKmh: 38.7,
        maxSpeedKmh: 62.4,
        emergencyTriggered: false,
        status: "completed"
      },
      {
        id: "RIDE-901",
        date: "2026-07-30 09:12",
        destination: "Airport Expressway Terminal 3",
        distanceKm: 28.5,
        durationSec: 2540, // 42 mins
        avgSpeedKmh: 40.3,
        maxSpeedKmh: 74.1,
        emergencyTriggered: true,
        status: "emergency"
      }
    ];
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speedSimRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor Battery Status API
  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener("chargingchange", () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save Ride History to LocalStorage
  useEffect(() => {
    localStorage.setItem("goldenguard_ride_history", JSON.stringify(rideHistory));
  }, [rideHistory]);

  // Active Ride Timer and Telemetry Simulator
  useEffect(() => {
    if (isRideActive && !isPaused) {
      // Duration Clock
      timerRef.current = setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);

      // Speed & Distance Dynamic Simulator
      speedSimRef.current = setInterval(() => {
        // Random speed fluctuations simulating realistic city/highway ride (25 km/h to 55 km/h)
        const newSpeed = Math.floor(28 + Math.random() * 26);
        setCurrentSpeed(newSpeed);

        setMaxSpeed((prevMax) => Math.max(prevMax, newSpeed));

        // Distance increment ~ speed / 3600
        setDistanceKm((prevDist) => parseFloat((prevDist + newSpeed / 3600).toFixed(2)));
      }, 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speedSimRef.current) clearInterval(speedSimRef.current);
      if (!isRideActive) setCurrentSpeed(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speedSimRef.current) clearInterval(speedSimRef.current);
    };
  }, [isRideActive, isPaused]);

  // Start Ride Handler
  const handleStartRide = () => {
    setIsRideActive(true);
    setIsPaused(false);
    setDurationSec(0);
    setDistanceKm(0);
    setCurrentSpeed(32);
    setMaxSpeed(32);
  };

  // Stop & Save Ride Handler
  const handleStopRide = async (wasEmergency = false) => {
    if (durationSec > 5 || distanceKm > 0.1) {
      const avgSpd = durationSec > 0 ? parseFloat(((distanceKm / (durationSec / 3600))).toFixed(1)) : 30;
      const newHistoryItem: RideHistoryItem = {
        id: `RIDE-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().slice(0, 16).replace("T", " "),
        destination: destination.trim() || "Unscheduled Route",
        distanceKm,
        durationSec,
        avgSpeedKmh: isNaN(avgSpd) ? 32.5 : avgSpd,
        maxSpeedKmh: maxSpeed || 42,
        emergencyTriggered: wasEmergency || !!activeEmergency,
        status: wasEmergency ? "emergency" : "completed"
      };

      setRideHistory((prev) => [newHistoryItem, ...prev]);

      try {
        await addDoc(collection(db, "rideHistory"), {
          uid: currentUser?.uid || "guest",
          date: newHistoryItem.date,
          destination: newHistoryItem.destination,
          distanceKm: newHistoryItem.distanceKm,
          durationSec: newHistoryItem.durationSec,
          avgSpeedKmh: newHistoryItem.avgSpeedKmh,
          maxSpeedKmh: newHistoryItem.maxSpeedKmh,
          emergencyTriggered: newHistoryItem.emergencyTriggered,
          status: newHistoryItem.status,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Firestore save ride error:", e);
      }
    }

    setIsRideActive(false);
    setIsPaused(false);
    setCurrentSpeed(0);
  };

  // Trigger Telemetry Anomaly Simulations
  const handleSimulateAnomaly = (type: string) => {
    switch (type) {
      case "crash":
        triggerCrashSimulation("High-Speed Impact Anomaly (SafeRide Telemetry)");
        break;
      case "sudden_stop":
        setCurrentSpeed(0);
        setTimeout(() => {
          triggerCrashSimulation("Sudden Velocity Drop Anomaly (>40 km/h to 0 in 0.4s)");
        }, 800);
        break;
      case "inactivity":
        setIsPaused(true);
        triggerCrashSimulation("Long Route Inactivity Anomaly (>2 Mins Zero Movement)");
        break;
      case "gps_jump":
        setCurrentAddress("Signal Re-route: Km 28 Expressway (Position Anomaly)");
        triggerCrashSimulation("Sudden Telemetry GPS Discrepancy & Impact");
        break;
    }
  };

  // Format Duration helper
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs}:` : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const avgSpeed = durationSec > 0 ? (distanceKm / (durationSec / 3600)).toFixed(1) : "0.0";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-surface-900 via-surface-800 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-700/50 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Bike className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>UNCONSCIOUS RIDER GUARDIAN ACTIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              SafeRide Guardian 🏍️🚗
            </h1>
            <p className="text-surface-300 text-sm max-w-2xl font-medium leading-relaxed">
              Real-time velocity, impact G-force, and route inactivity monitoring. If an accident renders you unconscious, GoldenGuard Auto SOS dispatches emergency services and contacts automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isRideActive ? (
              <button
                onClick={handleStartRide}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-base flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START RIDE NOW</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="py-3 px-5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-sm flex items-center gap-2 transition-all"
                >
                  <Pause className="w-4 h-4" />
                  <span>{isPaused ? "Resume" : "Pause"}</span>
                </button>

                <button
                  onClick={() => handleStopRide(false)}
                  className="py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>END RIDE</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: LIVE RIDE DASHBOARD & TELEMETRY */}
      {isRideActive && (
        <div className="bg-white dark:bg-surface-900 rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <div>
                <h2 className="text-xl font-black text-surface-900 dark:text-white flex items-center gap-2">
                  <span>Active Ride Session</span>
                  {isPaused && <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">(PAUSED)</span>}
                </h2>
                <p className="text-xs text-surface-500">Live Telemetry & AI Anomaly Sentinel Active</p>
              </div>
            </div>

            {/* Device Hardware Status Pills */}
            <div className="flex items-center gap-3 text-xs font-bold text-surface-600 dark:text-surface-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800">
                {isCharging ? <BatteryCharging className="w-4 h-4 text-emerald-500" /> : <Battery className="w-4 h-4 text-amber-500" />}
                <span>Battery: {batteryLevel !== null ? `${batteryLevel}%` : "88%"}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800">
                {isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                <span>Network: {isOnline ? "5G Online" : "Offline Cache"}</span>
              </div>
            </div>
          </div>

          {/* Core Telemetry Gauge Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Speedometer Gauge Card */}
            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-surface-900 to-surface-800 text-white p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-400" /> CURRENT SPEED
              </div>
              <div className="text-5xl font-black text-amber-400 my-1 font-mono tracking-tight">
                {currentSpeed}
              </div>
              <span className="text-xs font-bold text-surface-300">KM / H</span>
              
              <div className="w-full bg-surface-700 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentSpeed / 80) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Duration Timer Card */}
            <div className="bg-surface-50 dark:bg-surface-800/60 p-5 rounded-3xl border border-surface-200 dark:border-surface-700 flex flex-col justify-between">
              <div className="text-xs font-bold text-surface-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" /> Duration
              </div>
              <div className="text-3xl font-black text-surface-900 dark:text-white font-mono tracking-tight my-2">
                {formatTime(durationSec)}
              </div>
              <span className="text-[11px] text-surface-500 font-medium">Real-time Ride Clock</span>
            </div>

            {/* Distance Covered Card */}
            <div className="bg-surface-50 dark:bg-surface-800/60 p-5 rounded-3xl border border-surface-200 dark:border-surface-700 flex flex-col justify-between">
              <div className="text-xs font-bold text-surface-500 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-500" /> Distance
              </div>
              <div className="text-3xl font-black text-surface-900 dark:text-white font-mono tracking-tight my-2">
                {distanceKm} <span className="text-sm font-bold text-surface-500">KM</span>
              </div>
              <span className="text-[11px] text-surface-500 font-medium">GPS Tracked Route</span>
            </div>

            {/* Avg & Max Speed Card */}
            <div className="bg-surface-50 dark:bg-surface-800/60 p-5 rounded-3xl border border-surface-200 dark:border-surface-700 flex flex-col justify-between">
              <div className="text-xs font-bold text-surface-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-500" /> Speed Profile
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-surface-500">Avg:</span>
                  <span className="text-lg font-black text-surface-900 dark:text-white">{avgSpeed} km/h</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-surface-500">Max:</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{maxSpeed} km/h</span>
                </div>
              </div>
              <span className="text-[11px] text-surface-500 font-medium">Velocity Envelope</span>
            </div>

          </div>

          {/* Current Address & Route Destination */}
          <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-surface-600 dark:text-surface-300">Live Address:</span>
              <strong className="text-surface-900 dark:text-white truncate max-w-md">{currentAddress}</strong>
            </div>

            {destination && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                <span>Destination: {destination}</span>
              </div>
            )}
          </div>

          {/* AI Ride Anomaly Simulator Controls (Hackathon Feature) */}
          <div className="border-t border-surface-200 dark:border-surface-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-current" /> Hackathon Telemetry Anomaly Simulator
              </span>
              <span className="text-[11px] text-surface-500 font-medium">Triggers Auto SOS & Unconscious Flow</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleSimulateAnomaly("crash")}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all text-center"
              >
                🚗 High G Impact
              </button>

              <button
                onClick={() => handleSimulateAnomaly("sudden_stop")}
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all text-center"
              >
                🛑 Sudden Velocity Drop
              </button>

              <button
                onClick={() => handleSimulateAnomaly("inactivity")}
                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all text-center"
              >
                ⏳ 2-Min Inactivity
              </button>

              <button
                onClick={() => handleSimulateAnomaly("gps_jump")}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all text-center"
              >
                📍 GPS Jump Anomaly
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: RIDE SETUP FORM & EMERGENCY CONTACTS PREVIEW */}
      {!isRideActive && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Start Ride Options Card */}
          <div className="md:col-span-2 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 sm:p-8 space-y-6 shadow-md">
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
                <Bike className="w-5 h-5 text-amber-500" />
                <span>Configure New SafeRide</span>
              </h2>
              <p className="text-xs text-surface-500 mt-0.5">Enter an optional destination or press Start to begin monitoring instantly.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-2">
                  Destination Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Cyber City Hub, Connaught Place, or Home"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm font-semibold text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Start Ride Big Action CTA */}
              <div className="pt-2">
                <button
                  onClick={handleStartRide}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-98 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START SAFERIDE MONITORING</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Attached Card */}
          <div className="bg-surface-900 text-white rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-surface-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-sm">Emergency Contacts</h3>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  3 ACTIVE
                </span>
              </div>

              <p className="text-xs text-surface-400 leading-relaxed font-medium">
                In case of crash anomaly with no response, GoldenGuard automatically alerts:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-surface-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Elena Rivera (Spouse)</div>
                    <div className="text-[10px] text-surface-400">+91 98765 43210</div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">✓ Ready</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Dr. Robert Miller</div>
                    <div className="text-[10px] text-surface-400">+91 98123 45678</div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">✓ Ready</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Control Hub 112</div>
                    <div className="text-[10px] text-surface-400">National Dispatch</div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">✓ Linked</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-xs font-bold text-surface-300 hover:text-white transition-colors text-center"
            >
              Manage Contacts in Profile
            </button>
          </div>

        </div>
      )}

      {/* SECTION 3: RIDE HISTORY TABLE & LOGS */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 sm:p-8 space-y-6 shadow-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              <span>SafeRide History & Log Archive</span>
            </h2>
            <p className="text-xs text-surface-500">Stored telemetry logs, average speed, and emergency triggers.</p>
          </div>

          <div className="text-xs font-bold text-surface-500">
            Total Rides Logged: <span className="text-surface-900 dark:text-white font-extrabold">{rideHistory.length}</span>
          </div>
        </div>

        {rideHistory.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Bike className="w-12 h-12 text-surface-300 dark:text-surface-700 mx-auto" />
            <p className="text-sm font-bold text-surface-500">No rides logged yet. Start your first ride above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
                  <th className="py-3.5 px-4 font-extrabold text-xs uppercase text-surface-500">Date & ID</th>
                  <th className="py-3.5 px-4 font-extrabold text-xs uppercase text-surface-500">Destination</th>
                  <th className="py-3.5 px-4 font-extrabold text-xs uppercase text-surface-500">Distance</th>
                  <th className="py-3.5 px-4 font-extrabold text-xs uppercase text-surface-500">Duration</th>
                  <th className="py-3.5 px-4 font-extrabold text-xs uppercase text-surface-500">Avg / Max Speed</th>
                  <th className="py-3.5 px-4 font-extrabold text-xs uppercase text-surface-500">Emergency Triggered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800 font-medium text-xs">
                {rideHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-surface-900 dark:text-white">{item.id}</div>
                      <div className="text-[11px] text-surface-500">{item.date}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-surface-800 dark:text-surface-200">
                      {item.destination}
                    </td>
                    <td className="py-4 px-4 font-bold text-surface-900 dark:text-white">
                      {item.distanceKm} KM
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-surface-700 dark:text-surface-300">
                      {formatTime(item.durationSec)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-surface-900 dark:text-white">{item.avgSpeedKmh} km/h</span>
                      <span className="text-[11px] text-amber-500 ml-1.5 font-bold">(Max {item.maxSpeedKmh})</span>
                    </td>
                    <td className="py-4 px-4">
                      {item.emergencyTriggered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" /> YES (Auto SOS)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Safe
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
