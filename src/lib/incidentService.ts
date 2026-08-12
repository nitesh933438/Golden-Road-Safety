import { 
  collection, doc, setDoc, updateDoc, onSnapshot, query, where, 
  getDocs, serverTimestamp, Timestamp, orderBy, limit 
} from "firebase/firestore";
import { db, auth } from "./firebase";

export type IncidentStatus = 
  | "active"
  | "acknowledged"
  | "responding"
  | "hospital-arrived"
  | "resolved"
  | "cancelled"
  | "expired";

export type IncidentPriority = "critical" | "high" | "medium" | "low";

export interface IncidentDoc {
  id: string;
  incidentId: string;
  reporterUid: string;
  reporterName: string;
  reporterPhone: string;
  latitude: number;
  longitude: number;
  locationText: string;
  createdAt: any;
  createdAtMs: number;
  goldenHourDeadline: any;
  goldenHourDeadlineMs: number;
  status: IncidentStatus;
  priority: IncidentPriority;
  type: string;
  notes?: string;
  responders: string[];
  hospitalId: string | null;
  hospitalName?: string | null;
  policeId: string | null;
  volunteerId: string | null;
  volunteerName?: string | null;
  acknowledgedAt: any | null;
  respondingAt?: any | null;
  hospitalAcknowledgedAt?: any | null;
  resolvedAt: any | null;
  traumaCapacity?: string;
  bedsAvailable?: number;
  hospitalEta?: string;
  hospitalStatus?: "accepted" | "arrived" | "treatment_started" | "resolved" | "pending";
}

export const ACTIVE_STATUSES: IncidentStatus[] = ["active", "acknowledged", "responding", "hospital-arrived"];

export function parseTimestampMs(ts: any): number {
  if (!ts) return Date.now();
  if (typeof ts === "number") return ts;
  if (ts?.toMillis && typeof ts.toMillis === "function") return ts.toMillis();
  if (ts?.seconds) return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  return Date.now();
}

export function parseIncidentDoc(id: string, data: any): IncidentDoc {
  const createdAtMs = parseTimestampMs(data.createdAt || data.createdTime);
  const goldenHourDeadlineMs = data.goldenHourDeadlineMs || (
    data.goldenHourDeadline ? parseTimestampMs(data.goldenHourDeadline) : createdAtMs + 60 * 60 * 1000
  );

  return {
    id: id || data.incidentId || data.id,
    incidentId: id || data.incidentId || data.id,
    reporterUid: data.reporterUid || data.userId || "anonymous",
    reporterName: data.reporterName || data.userName || "Unknown Reporter",
    reporterPhone: data.reporterPhone || data.phone || "N/A",
    latitude: Number(data.latitude || (data.location?.lat) || 0),
    longitude: Number(data.longitude || (data.location?.lng) || 0),
    locationText: data.locationText || data.address || data.location || "Location unavailable",
    createdAt: data.createdAt || data.createdTime,
    createdAtMs,
    goldenHourDeadline: data.goldenHourDeadline || null,
    goldenHourDeadlineMs,
    status: (data.status || "active").toLowerCase() as IncidentStatus,
    priority: (data.priority || "critical").toLowerCase() as IncidentPriority,
    type: data.type || data.emergencyType || "1-TAP SOS",
    notes: data.notes || "",
    responders: Array.isArray(data.responders) ? data.responders : [],
    hospitalId: data.hospitalId || null,
    hospitalName: data.hospitalName || data.hospital || null,
    policeId: data.policeId || data.police || null,
    volunteerId: data.volunteerId || data.volunteer || null,
    volunteerName: data.volunteerName || null,
    acknowledgedAt: data.acknowledgedAt || null,
    respondingAt: data.respondingAt || null,
    hospitalAcknowledgedAt: data.hospitalAcknowledgedAt || null,
    resolvedAt: data.resolvedAt || data.completedTime || null,
    traumaCapacity: data.traumaCapacity || undefined,
    bedsAvailable: typeof data.bedsAvailable === "number" ? data.bedsAvailable : undefined,
    hospitalEta: data.hospitalEta || undefined,
    hospitalStatus: data.hospitalStatus || undefined,
  };
}

/**
 * Priority order sorting:
 * 1. critical > high > medium > low
 * 2. Newest createdAtMs first
 */
export function sortIncidentsByPriority(incidents: IncidentDoc[]): IncidentDoc[] {
  const priorityRank: Record<IncidentPriority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...incidents].sort((a, b) => {
    const rankA = priorityRank[a.priority] || 1;
    const rankB = priorityRank[b.priority] || 1;
    if (rankA !== rankB) return rankB - rankA;
    return b.createdAtMs - a.createdAtMs;
  });
}

/**
 * Check if a user already has an active emergency incident
 */
export async function getUserActiveIncident(reporterUid: string): Promise<IncidentDoc | null> {
  if (!reporterUid) return null;
  try {
    const q = query(
      collection(db, "incidents"),
      where("reporterUid", "==", reporterUid),
      where("status", "in", ACTIVE_STATUSES)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return parseIncidentDoc(docSnap.id, docSnap.data());
    }

    // Secondary check in emergencies collection for backwards compatibility
    const qLegacy = query(
      collection(db, "emergencies"),
      where("userId", "==", reporterUid),
      where("status", "in", ["active", "CREATED", "ACKNOWLEDGED", "RESPONDER_ASSIGNED", "DISPATCHED", "ARRIVED"])
    );
    const snapLegacy = await getDocs(qLegacy);
    if (!snapLegacy.empty) {
      const docSnap = snapLegacy.docs[0];
      return parseIncidentDoc(docSnap.id, docSnap.data());
    }
  } catch (err) {
    console.warn("Error checking user active incident:", err);
  }
  return null;
}

/**
 * Create a new emergency incident in Firestore
 */
export async function createEmergencyIncident(params: {
  reporterUid: string;
  reporterName: string;
  reporterPhone: string;
  latitude: number;
  longitude: number;
  locationText: string;
  type?: string;
  priority?: IncidentPriority;
  notes?: string;
}): Promise<{ incident: IncidentDoc; isExisting: boolean }> {
  if (!params.reporterUid) {
    throw new Error("Authentication required. Please log in to trigger an emergency SOS.");
  }

  // Check for duplicate active SOS
  const existingActive = await getUserActiveIncident(params.reporterUid);
  if (existingActive) {
    return { incident: existingActive, isExisting: true };
  }

  const uniqueId = "inc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  const priority = params.priority || "critical";
  const type = params.type || "1-TAP SOS Emergency";

  // Create incident record
  const incidentData = {
    incidentId: uniqueId,
    id: uniqueId,
    reporterUid: params.reporterUid,
    reporterName: params.reporterName || "GoldenGuard User",
    reporterPhone: params.reporterPhone || "N/A",
    latitude: params.latitude,
    longitude: params.longitude,
    locationText: params.locationText || `${params.latitude.toFixed(4)}, ${params.longitude.toFixed(4)}`,
    createdAt: serverTimestamp(),
    goldenHourDeadline: new Date(Date.now() + 60 * 60 * 1000),
    goldenHourDeadlineMs: Date.now() + 60 * 60 * 1000,
    status: "active",
    priority: priority,
    type: type,
    notes: params.notes || "",
    responders: [],
    hospitalId: null,
    policeId: null,
    volunteerId: null,
    acknowledgedAt: null,
    respondingAt: null,
    hospitalAcknowledgedAt: null,
    resolvedAt: null,
  };

  try {
    // Write to primary /incidents collection
    await setDoc(doc(db, "incidents", uniqueId), incidentData);

    // Also mirror to legacy /emergencies collection for full system sync
    await setDoc(doc(db, "emergencies", uniqueId), {
      ...incidentData,
      userId: params.reporterUid,
      type: type,
      severity: priority,
      location: params.locationText,
      address: params.locationText,
      status: "CREATED",
      createdTime: serverTimestamp(),
    });

    const parsed = parseIncidentDoc(uniqueId, {
      ...incidentData,
      createdAt: Date.now(),
      goldenHourDeadlineMs: Date.now() + 60 * 60 * 1000,
    });

    return { incident: parsed, isExisting: false };
  } catch (err: any) {
    console.error("Failed to create emergency incident in Firestore:", err);
    throw new Error("Unable to create emergency incident in Firebase. Please check connection and permissions.");
  }
}

/**
 * Update incident status or assign responder
 */
export async function updateIncident(
  incidentId: string, 
  updates: Partial<{
    status: IncidentStatus;
    priority: IncidentPriority;
    volunteerId: string | null;
    volunteerName: string | null;
    hospitalId: string | null;
    hospitalName: string | null;
    policeId: string | null;
    responders: string[];
    traumaCapacity: string;
    bedsAvailable: number;
    hospitalEta: string;
    hospitalStatus: "accepted" | "arrived" | "treatment_started" | "resolved" | "pending";
    notes: string;
  }>
) {
  if (!incidentId) return;

  const patch: any = {
    updatedAt: serverTimestamp(),
    ...updates,
  };

  if (updates.status === "acknowledged" && !updates.volunteerId) {
    patch.acknowledgedAt = serverTimestamp();
  } else if (updates.status === "responding") {
    patch.respondingAt = serverTimestamp();
  } else if (updates.status === "hospital-arrived" || updates.hospitalStatus === "arrived") {
    patch.hospitalAcknowledgedAt = serverTimestamp();
  } else if (updates.status === "resolved" || updates.status === "cancelled") {
    patch.resolvedAt = serverTimestamp();
  }

  if (updates.volunteerId) {
    patch.acknowledgedAt = patch.acknowledgedAt || serverTimestamp();
  }

  if (updates.hospitalId) {
    patch.hospitalAcknowledgedAt = patch.hospitalAcknowledgedAt || serverTimestamp();
  }

  try {
    await updateDoc(doc(db, "incidents", incidentId), patch);
    
    // Also mirror update to legacy /emergencies
    const legacyPatch: any = { updatedAt: serverTimestamp() };
    if (updates.status) {
      if (updates.status === "resolved") legacyPatch.status = "RESOLVED";
      else if (updates.status === "cancelled") legacyPatch.status = "CANCELLED";
      else legacyPatch.status = updates.status.toUpperCase();
    }
    if (updates.volunteerId) legacyPatch.volunteer = updates.volunteerId;
    if (updates.hospitalId) legacyPatch.hospital = updates.hospitalId;
    if (updates.policeId) legacyPatch.police = updates.policeId;

    await updateDoc(doc(db, "emergencies", incidentId), legacyPatch).catch(() => {});

    // Also mirror update to /sosRequests collection
    const sosPatch: any = { updatedAt: serverTimestamp() };
    if (updates.status) {
      switch (updates.status) {
        case "active": sosPatch.status = "CREATED"; break;
        case "acknowledged": sosPatch.status = "ASSIGNED"; break;
        case "responding": sosPatch.status = "RESPONDER_EN_ROUTE"; break;
        case "hospital-arrived": sosPatch.status = "ARRIVED"; break;
        case "resolved": sosPatch.status = "RESOLVED"; sosPatch.resolvedAt = serverTimestamp(); break;
        case "cancelled": sosPatch.status = "CANCELLED"; sosPatch.resolvedAt = serverTimestamp(); break;
        default: sosPatch.status = updates.status.toUpperCase();
      }
    }
    if (updates.volunteerId !== undefined) sosPatch.assignedVolunteerId = updates.volunteerId;
    if (updates.hospitalId !== undefined) sosPatch.assignedHospitalId = updates.hospitalId;
    if (updates.policeId !== undefined) sosPatch.assignedPoliceId = updates.policeId;

    await updateDoc(doc(db, "sosRequests", incidentId), sosPatch).catch(() => {});
  } catch (err: any) {
    console.error("Failed to update incident in Firestore:", err);
    throw new Error("Unable to update incident in Firebase.");
  }
}
