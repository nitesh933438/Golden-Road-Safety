import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  collection, onSnapshot, query, where, orderBy, limit, getDocs 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  IncidentDoc, IncidentStatus, parseIncidentDoc, 
  sortIncidentsByPriority, ACTIVE_STATUSES, createEmergencyIncident, updateIncident 
} from "../lib/incidentService";
import { useAuth } from "./AuthContext";
import { useDemo } from "./DemoContext";

interface IncidentContextType {
  activeIncidents: IncidentDoc[];
  allIncidents: IncidentDoc[];
  selectedIncident: IncidentDoc | null;
  setSelectedIncidentId: (id: string | null) => void;
  isLoadingIncidents: boolean;
  incidentError: string | null;
  isReconnecting: boolean;
  
  // Real Golden Hour Timer State for current selected active incident
  remainingSeconds: number | null; // null if no active emergency
  formattedTimer: string; // "MM:SS" or "--:--" or "00:00"
  isTimerExpired: boolean;

  // Real Firebase statistics
  realMetrics: {
    activeIncidentsCount: number;
    volunteersCount: number;
    hospitalsCount: number;
    avgResponseTimeMinutes: string;
  };

  // Actions
  triggerSOS: (params: {
    latitude: number;
    longitude: number;
    locationText: string;
    type?: string;
    priority?: "critical" | "high" | "medium" | "low";
    notes?: string;
  }) => Promise<{ incident: IncidentDoc; isExisting: boolean; message?: string }>;
  
  updateIncidentStatus: (
    incidentId: string, 
    updates: Parameters<typeof updateIncident>[1]
  ) => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const { userProfile } = useAuth();
  const { demoMode } = useDemo();

  const [activeIncidents, setActiveIncidents] = useState<IncidentDoc[]>([]);
  const [allIncidents, setAllIncidents] = useState<IncidentDoc[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  
  const [isLoadingIncidents, setIsLoadingIncidents] = useState<boolean>(true);
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  // Real statistics counters
  const [volunteersCount, setVolunteersCount] = useState<number>(0);
  const [hospitalsCount, setHospitalsCount] = useState<number>(0);

  // Timer Tick State
  const [nowMs, setNowMs] = useState<number>(Date.now());

  // Ticker for real-time Golden Hour countdown (every 1 sec)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Firestore subscription to active incidents
  useEffect(() => {
    if (demoMode) {
      setIsLoadingIncidents(false);
      return;
    }

    setIsLoadingIncidents(true);
    setIncidentError(null);

    // Query active incidents from /incidents
    const q = query(
      collection(db, "incidents"),
      where("status", "in", ACTIVE_STATUSES)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIsReconnecting(false);
        const docs = snapshot.docs.map((d) => parseIncidentDoc(d.id, d.data()));
        const sorted = sortIncidentsByPriority(docs);
        setActiveIncidents(sorted);
        setIsLoadingIncidents(false);
      },
      (error) => {
        console.warn("Firestore active incidents listener error:", error);
        setIsReconnecting(true);
        setIncidentError("Connection lost. Reconnecting to Firebase...");
        setIsLoadingIncidents(false);
      }
    );

    // Query all incidents for history & admin analytics
    const qAll = query(collection(db, "incidents"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribeAll = onSnapshot(
      qAll,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => parseIncidentDoc(d.id, d.data()));
        setAllIncidents(docs);
      },
      (err) => {
        console.warn("Firestore all incidents listener warning:", err);
      }
    );

    // One-time stats fetch for Volunteers and Hospitals count
    getDocs(query(collection(db, "users"), where("role", "==", "volunteer"))).then((snap) => {
      setVolunteersCount(snap.size);
    }).catch(() => {});

    getDocs(query(collection(db, "users"), where("role", "==", "hospital"))).then((snap) => {
      setHospitalsCount(snap.size);
    }).catch(() => {});

    return () => {
      unsubscribe();
      unsubscribeAll();
    };
  }, [demoMode]);

  // Selected Active Incident selection logic:
  // If user selected an ID explicitly, find it. Else pick highest-priority active incident.
  const selectedIncident = React.useMemo(() => {
    if (selectedIncidentId) {
      const found = activeIncidents.find((i) => i.id === selectedIncidentId);
      if (found) return found;
    }
    return activeIncidents.length > 0 ? activeIncidents[0] : null;
  }, [activeIncidents, selectedIncidentId]);

  // Compute Golden Hour timer for selected active incident
  const { remainingSeconds, formattedTimer, isTimerExpired } = React.useMemo(() => {
    if (!selectedIncident || !ACTIVE_STATUSES.includes(selectedIncident.status)) {
      return {
        remainingSeconds: null,
        formattedTimer: "--:--",
        isTimerExpired: false,
      };
    }

    const deadlineMs = selectedIncident.goldenHourDeadlineMs;
    const diffMs = deadlineMs - nowMs;
    const remainingSec = Math.max(0, Math.floor(diffMs / 1000));

    if (remainingSec <= 0) {
      return {
        remainingSeconds: 0,
        formattedTimer: "00:00",
        isTimerExpired: true,
      };
    }

    const m = Math.floor(remainingSec / 60);
    const s = remainingSec % 60;
    const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    return {
      remainingSeconds: remainingSec,
      formattedTimer: formatted,
      isTimerExpired: false,
    };
  }, [selectedIncident, nowMs]);

  // Compute real average response time from resolved/acknowledged incidents
  const avgResponseTimeMinutes = React.useMemo(() => {
    const validDurations: number[] = [];
    allIncidents.forEach((inc) => {
      if (inc.createdAtMs && inc.acknowledgedAt) {
        const ackMs = typeof inc.acknowledgedAt === "number" ? inc.acknowledgedAt : (inc.acknowledgedAt?.toMillis ? inc.acknowledgedAt.toMillis() : Date.now());
        const diffMin = (ackMs - inc.createdAtMs) / (1000 * 60);
        if (diffMin >= 0 && diffMin <= 120) {
          validDurations.push(diffMin);
        }
      }
    });

    if (validDurations.length === 0) return "No active data";
    const sum = validDurations.reduce((a, b) => a + b, 0);
    const avg = sum / validDurations.length;
    return `${avg.toFixed(1)} min`;
  }, [allIncidents]);

  // Trigger SOS with Duplicate Protection
  const triggerSOS = async (params: {
    latitude: number;
    longitude: number;
    locationText: string;
    type?: string;
    priority?: "critical" | "high" | "medium" | "low";
    notes?: string;
  }) => {
    if (!userProfile?.uid) {
      throw new Error("Authentication required. Please sign in to activate GoldenGuard Emergency SOS.");
    }

    const reporterName = userProfile.name || "GoldenGuard Reporter";
    const reporterPhone = userProfile.phone || "N/A";

    const result = await createEmergencyIncident({
      reporterUid: userProfile.uid,
      reporterName,
      reporterPhone,
      latitude: params.latitude,
      longitude: params.longitude,
      locationText: params.locationText,
      type: params.type || "1-TAP SOS Emergency",
      priority: params.priority || "critical",
      notes: params.notes || "",
    });

    setSelectedIncidentId(result.incident.id);

    return {
      incident: result.incident,
      isExisting: result.isExisting,
      message: result.isExisting 
        ? "Active emergency already exists. Displaying existing incident."
        : "Golden Hour emergency incident created successfully."
    };
  };

  const handleUpdateIncidentStatus = async (
    incidentId: string, 
    updates: Parameters<typeof updateIncident>[1]
  ) => {
    await updateIncident(incidentId, updates);
  };

  return (
    <IncidentContext.Provider
      value={{
        activeIncidents,
        allIncidents,
        selectedIncident,
        setSelectedIncidentId,
        isLoadingIncidents,
        incidentError,
        isReconnecting,
        remainingSeconds,
        formattedTimer,
        isTimerExpired,
        realMetrics: {
          activeIncidentsCount: activeIncidents.length,
          volunteersCount,
          hospitalsCount,
          avgResponseTimeMinutes,
        },
        triggerSOS,
        updateIncidentStatus: handleUpdateIncidentStatus,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidents must be used within an IncidentProvider");
  }
  return context;
}
