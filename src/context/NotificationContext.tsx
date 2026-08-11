import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  collection, onSnapshot, query, orderBy, limit, addDoc, 
  doc, setDoc, updateDoc, deleteDoc, serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { safeLocalStorage } from "../lib/utils";

export type NotificationType = 
  | "emergency" 
  | "sos" 
  | "volunteer" 
  | "hospital" 
  | "police" 
  | "ai" 
  | "hazard" 
  | "community" 
  | "training" 
  | "admin";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  group: "Today" | "Yesterday" | "Older";
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt?: any;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  pushPermission: NotificationPermission | "unsupported";
  requestPushPermission: () => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "time" | "group" | "isRead">) => Promise<void>;
  sendTestNotification: (type: NotificationType) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = safeLocalStorage.getItem("goldenguard_notifications_cache");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">(() => {
    try {
      if (typeof window !== "undefined" && "Notification" in window && window.Notification) {
        return window.Notification.permission;
      }
    } catch (e) {}
    return "unsupported";
  });

  const { userProfile } = useAuth();

  // Save cache to localStorage
  useEffect(() => {
    safeLocalStorage.setItem("goldenguard_notifications_cache", JSON.stringify(notifications));
  }, [notifications]);

  // Real-time Firestore Listener
  useEffect(() => {
    if (!userProfile?.uid) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    try {
      const notifRef = collection(db, "notifications", userProfile.uid, "items");
      // Use indexed queries and limit to optimize reads
      const q = query(notifRef, orderBy("timestamp", "desc"), limit(50));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: NotificationItem[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                title: data.title || "GoldenGuard Alert",
                message: data.message || "",
                time: data.time || "Just now",
                group: data.group || "Today",
                type: (data.type as NotificationType) || "admin",
                isRead: !!data.isRead,
                link: data.link || "/notifications",
                createdAt: data.timestamp
              };
            });

            // Merge fetched items with initial/local items without duplicates
            setNotifications((prev) => {
              const initialIds = new Set(["n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8", "n9", "n10"]);
              const uniqueFetched = fetched.filter(f => !initialIds.has(f.id));

              const fetchedMap = new Map(uniqueFetched.map(f => [f.id, f]));
              const merged = prev.map(item => {
                if (fetchedMap.has(item.id)) {
                  const updated = fetchedMap.get(item.id)!;
                  fetchedMap.delete(item.id);
                  return updated;
                }
                return item;
              });

              return [...fetchedMap.values(), ...merged];
            });
          }
        },
        (err) => {
          console.warn("Firestore Notification Listener Note:", err.message);
        }
      );
    } catch (e) {
      console.warn("Firestore notification initialization notice:", e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userProfile?.uid]);

  // Trigger System Push Notification
  const triggerBrowserPush = useCallback((title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.warn("Browser push notice:", e);
      }
    }
  }, []);

  // Request Push Permission
  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        setPushPermission(res);
        if (res === "granted") {
          triggerBrowserPush("GoldenGuard Alerts Enabled 🛡️", "You will receive instant Golden Hour dispatch and crash notifications.");
          return true;
        }
      } catch (e) {
        console.warn("Permission error:", e);
      }
    }
    return false;
  };

  // Add Notification Function
  const addNotification = async (item: Omit<NotificationItem, "id" | "time" | "group" | "isRead">) => {
    const newId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timeStr = "Just now";

    const newItem: NotificationItem = {
      ...item,
      id: newId,
      time: timeStr,
      group: "Today",
      isRead: false
    };

    setNotifications((prev) => [newItem, ...prev]);

    // Send Browser Push
    triggerBrowserPush(newItem.title, newItem.message);

    // Save to user subcollection
    if (userProfile?.uid) {
      try {
        await setDoc(doc(db, "notifications", userProfile.uid, "items", newId), {
          title: newItem.title,
          message: newItem.message,
          type: newItem.type,
          group: "Today",
          isRead: false,
          time: timeStr,
          link: newItem.link || "/notifications",
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.warn("Firestore save notice:", e);
      }
    }
  };

  // Mark as Read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      if (id.length > 10 && userProfile?.uid) {
        const notifDoc = doc(db, "notifications", userProfile.uid, "items", id);
        updateDoc(notifDoc, { isRead: true }).catch(() => {});
      }
    } catch (e) {}
  };

  // Mark All as Read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Delete Notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      if (id.length > 10 && userProfile?.uid) {
        const notifDoc = doc(db, "notifications", userProfile.uid, "items", id);
        deleteDoc(notifDoc).catch(() => {});
      }
    } catch (e) {}
  };

  // Clear All
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Send Preset Test Notification
  const sendTestNotification = (type: NotificationType) => {
    const presets: Record<NotificationType, { title: string; message: string; link: string }> = {
      emergency: {
        title: "🚨 High-Speed Collision Anomaly",
        message: "SafeRide Guardian registered velocity drop from 52 km/h to 0 in 0.3s. Auto SOS countdown active.",
        link: "/saferide"
      },
      sos: {
        title: "🆘 Golden Hour Emergency Dispatch #882",
        message: "National 112 Control Center assigned Mobile Intensive Care Ambulance #12.",
        link: "/sos"
      },
      volunteer: {
        title: "🤝 Nearby Volunteer Response Accepted",
        message: "First Responder Dr. Kavita Sharma accepted triage dispatch (ETA: 1.8 mins).",
        link: "/community"
      },
      hospital: {
        title: "🏥 Trauma Center Bay Reserved",
        message: "Fortis Escorts Hospital ICU Trauma Room #1 prepped for emergency casualty.",
        link: "/map"
      },
      police: {
        title: "🚔 Traffic Cordon Patrol Assigned",
        message: "Highway Police Squad 9 dispatched for traffic clearance corridor.",
        link: "/map"
      },
      ai: {
        title: "🤖 AI Assistant First Aid Advisory",
        message: "Victim is non-responsive. Open airway using chin-lift method and prepare CPR cycles.",
        link: "/first-aid"
      },
      hazard: {
        title: "⚠️ Verified Blackspot Hazard: Oil Spill",
        message: "High-risk slippery pavement verified on Expressway Flyover Km 18.",
        link: "/report"
      },
      community: {
        title: "🌐 Community Volunteer Fleet Online",
        message: "12 new certified volunteers registered in your 2 km radius today.",
        link: "/community"
      },
      training: {
        title: "🎓 First Responder Recertification Due",
        message: "Your Level 2 Bleeding Control certificate refresher is scheduled for this weekend.",
        link: "/training"
      },
      admin: {
        title: "📢 BROADCAST: Admin System Update",
        message: "GoldenGuard v2.4 SafeRide Guardian AI Anomaly Engine now deployed.",
        link: "/admin"
      }
    };

    const preset = presets[type] || presets.admin;
    addNotification({
      title: preset.title,
      message: preset.message,
      type,
      link: preset.link
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        pushPermission,
        requestPushPermission,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        sendTestNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
