import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  collection, onSnapshot, query, orderBy, addDoc, 
  doc, updateDoc, deleteDoc, serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";

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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "🚨 Automated Crash Anomaly Detected",
    message: "SafeRide Guardian registered 3.4G impact on Expressway Km 14. Emergency contacts notified.",
    time: "5 minutes ago",
    group: "Today",
    type: "emergency",
    isRead: false,
    link: "/sos"
  },
  {
    id: "n2",
    title: "🆘 SOS Dispatch Request Confirmed",
    message: "National Control Room assigned Emergency Response Team #4. Golden Hour timer ticking.",
    time: "15 minutes ago",
    group: "Today",
    type: "sos",
    isRead: false,
    link: "/sos"
  },
  {
    id: "n3",
    title: "🤝 Volunteer Rahul Verma En Route",
    message: "Certified Responder Rahul Verma accepted dispatch in Sector 7 (ETA: 2.1 mins).",
    time: "25 minutes ago",
    group: "Today",
    type: "volunteer",
    isRead: false,
    link: "/community"
  },
  {
    id: "n4",
    title: "🏥 Max Hospital Trauma Bay 2 Prepped",
    message: "Level-1 Trauma Center reserved ICU Bed #2 and ventilator for incoming Golden Hour victim.",
    time: "40 minutes ago",
    group: "Today",
    type: "hospital",
    isRead: true,
    link: "/map"
  },
  {
    id: "n5",
    title: "🚔 Police Patrol Squad 4 Dispatched",
    message: "Highway Patrol Squad 4 cordoning accident zone for rapid ambulance corridor pass.",
    time: "1 hour ago",
    group: "Today",
    type: "police",
    isRead: true,
    link: "/map"
  },
  {
    id: "n6",
    title: "🤖 AI First Aid Protocol: Hemorrhage Control",
    message: "Apply direct pressure with clean cloth. Do NOT remove soaked bandages — layer new ones on top.",
    time: "2 hours ago",
    group: "Today",
    type: "ai",
    isRead: true,
    link: "/first-aid"
  },
  {
    id: "n7",
    title: "⚠️ Road Hazard Verified: Deep Pothole",
    message: "Municipal Command Center verified blackspot report on Outer Ring Road. Maintenance assigned.",
    time: "4 hours ago",
    group: "Today",
    type: "hazard",
    isRead: true,
    link: "/report"
  },
  {
    id: "n8",
    title: "📢 BROADCAST: Monsoon Flash Flood Alert",
    message: "Admin Advisory: Sector 14 underpass waterlogged. GoldenGuard volunteers deployed for detour guidance.",
    time: "Yesterday at 4:15 PM",
    group: "Yesterday",
    type: "admin",
    isRead: true,
    link: "/notifications"
  },
  {
    id: "n9",
    title: "🎓 Level 3 CPR Badge Verified",
    message: "Congratulations! Your Advanced Bystander Triage refresher certificate is active on your profile.",
    time: "Yesterday at 11:30 AM",
    group: "Yesterday",
    type: "training",
    isRead: true,
    link: "/training"
  },
  {
    id: "n10",
    title: "🌐 Community Response Milestone",
    message: "Over 1,420 active volunteers online today. Golden Hour arrival time dropped to 4.2 mins.",
    time: "3 days ago",
    group: "Older",
    type: "community",
    isRead: true,
    link: "/community"
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("goldenguard_notifications_cache");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  // Save cache to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("goldenguard_notifications_cache", JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  // Real-time Firestore Listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const notifRef = collection(db, "notifications");
      const q = query(notifRef);

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

            // Merge fetched items with initial items to prevent losing default richness
            setNotifications((prev) => {
              const existingIds = new Set(prev.map((n) => n.id));
              const newItems = fetched.filter((f) => !existingIds.has(f.id));
              if (newItems.length === 0) return prev;
              return [...newItems, ...prev];
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
  }, []);

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

    // Save to Firestore
    try {
      await addDoc(collection(db, "notifications"), {
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
  };

  // Mark as Read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      if (id.length > 10) {
        const notifDoc = doc(db, "notifications", id);
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
      if (id.length > 10) {
        const notifDoc = doc(db, "notifications", id);
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
