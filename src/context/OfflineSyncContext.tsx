import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  getPendingSyncQueue, 
  removeSyncItem, 
  updateSyncItemStatus, 
  PendingSyncItem,
  queueOfflineItem
} from "../lib/offlineStore";
import { uploadToCloudinary } from "../lib/cloudinary";

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
    const saved = localStorage.getItem("goldenguard_last_sync_time");
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
        await updateSyncItemStatus(item.id, "syncing");

        try {
          if (item.type === "sos") {
            let photoURL = item.data.photoURL || "";
            if (photoURL.startsWith("data:")) {
              photoURL = await uploadToCloudinary(photoURL, "emergencies");
            }
            await addDoc(collection(db, "emergencies"), {
              ...item.data,
              photoURL,
              status: "Active",
              syncedFromOffline: true,
              createdTime: serverTimestamp()
            });
          } else if (item.type === "hazard") {
            let photoURL = item.data.photoURL || "";
            if (photoURL.startsWith("data:")) {
              photoURL = await uploadToCloudinary(photoURL, "hazards");
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
              photoURL = await uploadToCloudinary(photoURL, "community");
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
            await addDoc(collection(db, "notifications"), {
              ...item.data,
              syncedFromOffline: true,
              createdTime: serverTimestamp()
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
      localStorage.setItem("goldenguard_last_sync_time", now.toString());
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
