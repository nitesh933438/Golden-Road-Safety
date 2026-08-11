import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  getPendingSyncQueue, 
  removeSyncItem, 
  updateSyncItemStatus, 
  PendingSyncItem,
  queueOfflineItem
} from "../lib/offlineStore";
import { uploadToCloudinary } from "../lib/cloudinary";
import { safeLocalStorage } from "../lib/utils";

interface OfflineSyncContextType {
  isOnline: boolean;
  pendingCount: number;
  syncQueue: PendingSyncItem[];
  isSyncing: boolean;
  lastSyncedTime: number | null;
  triggerSync: () => Promise<void>;
  queueItem: (type: PendingSyncItem["type"], data: any) => Promise<PendingSyncItem>;
  cancelSyncItem: (id: string) => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<PendingSyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<number | null>(() => {
    const saved = safeLocalStorage.getItem("goldenguard_last_sync_time");
    return saved ? parseInt(saved, 10) : null;
  });

  // Load initial queue
  const loadQueue = async () => {
    try {
      const items = await getPendingSyncQueue();
      setSyncQueue(items);
    } catch (e) {
      console.warn("Error loading sync queue:", e);
    }
  };

  useEffect(() => {
    loadQueue();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync processor
  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);

    try {
      const queue = await getPendingSyncQueue();
      setSyncQueue(queue);

      for (const item of queue) {
        if (item.status === "syncing") continue;
        if (item.status === "permanently_failed" || item.retryCount >= 5) {
          continue; // Skip permanently failed items
        }

        // Exponential backoff check: delay increases with retry count
        if (item.retryCount > 0 && item.lastAttemptAt) {
          const delayMs = Math.min(Math.pow(2, item.retryCount) * 5000, 15 * 60 * 1000); // Max backoff 15 mins
          const timeSinceLastAttempt = Date.now() - item.lastAttemptAt;
          if (timeSinceLastAttempt < delayMs) {
            console.log(`Skipping sync for item ${item.id} due to backoff cooldown (${Math.ceil((delayMs - timeSinceLastAttempt) / 1000)}s remaining)`);
            continue;
          }
        }

        await updateSyncItemStatus(item.id, "syncing");

        try {
          if (item.type === "sos") {
            let photoURL = item.data.photoURL || "";
            if (photoURL.startsWith("data:")) {
              try {
                photoURL = await uploadToCloudinary(photoURL, "emergencies");
              } catch (cloudinaryErr) {
                console.warn("Cloudinary upload failed during SOS sync:", cloudinaryErr);
                // Throw error so it fails the sync of this item to avoid writing base64 to Firestore
                throw cloudinaryErr;
              }
            }
            const docId = item.data.id || item.id;
            await setDoc(doc(db, "emergencies", docId), {
              ...item.data,
              photoURL,
              status: item.data.status || "CREATED",
              syncedFromOffline: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } else if (item.type === "hazard") {
            let photoURL = item.data.photoURL || "";
            if (photoURL.startsWith("data:")) {
              try {
                photoURL = await uploadToCloudinary(photoURL, "hazards");
              } catch (cloudinaryErr) {
                console.warn("Cloudinary upload failed during hazard sync:", cloudinaryErr);
                throw cloudinaryErr;
              }
            }
            await addDoc(collection(db, "hazards"), {
              ...item.data,
              photoURL,
              syncedFromOffline: true,
              createdAt: serverTimestamp()
            });
          } else if (item.type === "community") {
            let photoURL = item.data.photoURL || "";
            if (photoURL.startsWith("data:")) {
              try {
                photoURL = await uploadToCloudinary(photoURL, "community");
              } catch (cloudinaryErr) {
                console.warn("Cloudinary upload failed during community post sync:", cloudinaryErr);
                throw cloudinaryErr;
              }
            }
            await addDoc(collection(db, "communityPosts"), {
              ...item.data,
              photoURL,
              syncedFromOffline: true,
              createdAt: serverTimestamp()
            });
          } else if (item.type === "ride") {
            await addDoc(collection(db, "rideHistory"), {
              ...item.data,
              syncedFromOffline: true,
              createdAt: serverTimestamp()
            });
          } else if (item.type === "notification") {
            const uId = item.data.userId || "anonymous";
            const docId = item.data.id || item.id;
            await setDoc(doc(db, "notifications", uId, "items", docId), {
              ...item.data,
              syncedFromOffline: true,
              timestamp: serverTimestamp()
            });
          } else if (item.type === "volunteer") {
            await addDoc(collection(db, "volunteers"), {
              ...item.data,
              syncedFromOffline: true,
              createdAt: serverTimestamp()
            });
          }

          // Successfully uploaded to Firestore -> remove from offline IndexedDB queue
          await removeSyncItem(item.id);
        } catch (err: any) {
          console.error(`Error syncing item ${item.id}:`, err);
          await updateSyncItemStatus(item.id, "failed", err.message || "Network Error");
        }
      }

      const now = Date.now();
      setLastSyncedTime(now);
      safeLocalStorage.setItem("goldenguard_last_sync_time", now.toString());
      await loadQueue();
    } catch (err) {
      console.warn("Background sync execution error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const queueItem = async (type: PendingSyncItem["type"], data: any) => {
    const item = await queueOfflineItem(type, data);
    await loadQueue();
    if (navigator.onLine) {
      triggerSync();
    }
    return item;
  };

  const cancelSyncItem = async (id: string) => {
    await removeSyncItem(id);
    await loadQueue();
  };

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        pendingCount: syncQueue.length,
        syncQueue,
        isSyncing,
        lastSyncedTime,
        triggerSync,
        queueItem,
        cancelSyncItem
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error("useOfflineSync must be used within an OfflineSyncProvider");
  }
  return context;
};
