/**
 * GoldenGuard IndexedDB & LocalStorage Engine
 * Handles full offline persistence and background sync queueing
 */

export interface PendingSyncItem {
  id: string;
  type: "sos" | "hazard" | "community" | "ride" | "notification" | "volunteer";
  data: any;
  createdAt: number;
  status: "pending" | "syncing" | "failed" | "permanently_failed";
  retryCount: number;
  lastAttemptAt?: number;
  error?: string;
}

const DB_NAME = "GoldenGuardOfflineDB";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains("syncQueue")) {
        const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" });
        syncStore.createIndex("type", "type", { unique: false });
        syncStore.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains("offlineGuides")) {
        db.createObjectStore("offlineGuides", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("cachedLocation")) {
        db.createObjectStore("cachedLocation", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Runs cleanup routines on the queue:
 * 1. Deletes items older than 48 hours.
 * 2. Deletes items that have permanently failed (exceeded max retries).
 * 3. Enforces a maximum queue size (50) by deleting the oldest pending/failed items.
 */
export async function cleanupSyncQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    
    const items: PendingSyncItem[] = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const now = Date.now();
    const expirationThreshold = 48 * 60 * 60 * 1000; // 48 hours
    const maxRetries = 5;
    const maxQueueSize = 50;

    // Filter out items that should be pruned
    const itemsToDelete = items.filter(item => {
      // 1. Expired
      if (now - item.createdAt > expirationThreshold) return true;
      // 2. Permanently failed
      if (item.status === "permanently_failed" || item.retryCount >= maxRetries) return true;
      return false;
    });

    // Execute deletion of expired/permanently failed items
    for (const item of itemsToDelete) {
      store.delete(item.id);
    }

    // Enforce maximum queue size
    const remainingItems = items.filter(item => !itemsToDelete.some(d => d.id === item.id));
    if (remainingItems.length > maxQueueSize) {
      // Sort oldest first
      remainingItems.sort((a, b) => a.createdAt - b.createdAt);
      const pruneCount = remainingItems.length - maxQueueSize;
      for (let i = 0; i < pruneCount; i++) {
        store.delete(remainingItems[i].id);
      }
    }
  } catch (e) {
    console.warn("Sync queue cleanup failed:", e);
  }
}

/**
 * Add item to offline sync queue with duplicate prevention and size bounds.
 */
export async function queueOfflineItem(
  type: PendingSyncItem["type"],
  data: any
): Promise<PendingSyncItem> {
  // First run cleanup
  await cleanupSyncQueue();

  const db = await openDB();
  
  // Duplicate check: Verify if an identical item is already pending
  const existingItems = await getPendingSyncQueue();
  const serializedData = JSON.stringify(data);
  const isDuplicate = existingItems.some(item => {
    if (item.type !== type) return false;
    if (item.status === "permanently_failed") return false;
    // Compare essential data strings
    return JSON.stringify(item.data) === serializedData;
  });

  if (isDuplicate) {
    console.log(`Duplicate prevention: Item of type "${type}" already exists in the queue.`);
    const duplicate = existingItems.find(item => item.type === type && JSON.stringify(item.data) === serializedData);
    return duplicate!;
  }

  const item: PendingSyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    data,
    createdAt: Date.now(),
    status: "pending",
    retryCount: 0,
    lastAttemptAt: Date.now()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    const req = store.put(item);

    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all pending sync items
 */
export async function getPendingSyncQueue(): Promise<PendingSyncItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncQueue", "readonly");
    const store = tx.objectStore("syncQueue");
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Update sync item status with retry limits and backoff timing
 */
export async function updateSyncItemStatus(
  id: string,
  status: PendingSyncItem["status"],
  error?: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item: PendingSyncItem = getReq.result;
      if (item) {
        item.status = status;
        item.lastAttemptAt = Date.now();
        if (error) item.error = error;
        
        if (status === "failed") {
          const nextRetry = (item.retryCount || 0) + 1;
          item.retryCount = nextRetry;
          if (nextRetry >= 5) {
            item.status = "permanently_failed";
          }
        }
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Remove completed sync item
 */
export async function removeSyncItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear all sync items
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Store / Get Last Known GPS Location
 */
export async function saveLastLocation(loc: { lat: number; lng: number; address: string }): Promise<void> {
  localStorage.setItem("goldenguard_last_location", JSON.stringify({
    ...loc,
    updatedAt: Date.now()
  }));
}

export function getLastLocation(): { lat: number; lng: number; address: string; updatedAt: number } | null {
  const stored = localStorage.getItem("goldenguard_last_location");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return null;
}

/**
 * Offline AI First Aid Manual Guides
 */
export const OFFLINE_AI_GUIDES = [
  {
    id: "cpr",
    title: "Cardiopulmonary Resuscitation (CPR)",
    category: "Life Support",
    steps: [
      "Check scene safety & victim responsiveness.",
      "Call emergency services immediately (112 or GoldenGuard SOS).",
      "Place hands in center of chest, interlocking fingers.",
      "Push hard and fast (100–120 compressions/min) to the beat of 'Stayin' Alive'.",
      "Give 2 rescue breaths after every 30 compressions if trained."
    ],
    precautions: "Do not interrupt compressions for more than 10 seconds.",
    videoUrl: "#"
  },
  {
    id: "bleeding",
    title: "Severe Bleeding Control",
    category: "Trauma Care",
    steps: [
      "Apply direct firm pressure on the wound using a clean cloth or bandage.",
      "Keep pressure continuous for at least 5-10 minutes.",
      "Elevate the injured limb above heart level if no fracture is suspected.",
      "If blood soaks through, do NOT remove cloth; add more layers on top.",
      "Apply a tourniquet 2-3 inches above wound for severe arterial leg/arm bleeding if trained."
    ],
    precautions: "Do not remove embedded objects from deep wounds.",
    videoUrl: "#"
  },
  {
    id: "burn",
    title: "Thermal & Chemical Burn Treatment",
    category: "Thermal Injury",
    steps: [
      "Cool the burn with cool running tap water for 10–20 minutes.",
      "Remove tight items like rings before swelling begins.",
      "Cover loosely with sterile non-stick bandage or plastic wrap.",
      "Take OTC pain relievers if conscious.",
      "For chemical burns, flush continuously with water for 20 mins."
    ],
    precautions: "Never apply ice, butter, toothpaste, or pop blisters.",
    videoUrl: "#"
  },
  {
    id: "fracture",
    title: "Bone Fracture & Joint Dislocation",
    category: "Orthopedic",
    steps: [
      "Immobilize the injured area in the position found.",
      "Apply cold ice pack wrapped in cloth to reduce swelling.",
      "Construct a makeshift splint using rolled cardboard, magazines, or wood planks.",
      "Secure splint above and below the fracture joint.",
      "Monitor pulse and sensation in fingers/toes."
    ],
    precautions: "Never attempt to push protruding bones back into place.",
    videoUrl: "#"
  },
  {
    id: "choking",
    title: "Choking & Airway Obstruction",
    category: "Airway",
    steps: [
      "Encourage the person to cough forcefully if capable.",
      "Give 5 sharp back blows between shoulder blades with heel of hand.",
      "Perform Heimlich maneuver: 5 quick upward abdominal thrusts above navel.",
      "Alternate between 5 back blows and 5 abdominal thrusts until object clears.",
      "If victim falls unconscious, lower to ground and start CPR compressions."
    ],
    precautions: "Use chest thrusts instead of abdominal thrusts for pregnant or obese victims.",
    videoUrl: "#"
  },
  {
    id: "recovery",
    title: "Recovery Position (Unconscious Breathing)",
    category: "Airway Protection",
    steps: [
      "Kneel beside victim and extend arm nearest you at a right angle.",
      "Bring other arm across chest and hold back of hand against cheek.",
      "Bend far leg at knee and pull to roll victim toward you onto their side.",
      "Tilt head back gently to open airway and keep chin pointed down.",
      "Check breathing continuously every 60 seconds."
    ],
    precautions: "Do not move victim if spinal injury is suspected unless immediate danger exists.",
    videoUrl: "#"
  }
];
