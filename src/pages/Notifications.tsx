import React, { useState } from "react";
import { 
  Bell, ShieldAlert, AlertTriangle, CheckCircle2, 
  Search, Trash2, CheckCheck, Info, ArrowRight, UserCheck, 
  Stethoscope, Building2, Car, Bot, Megaphone, BookOpen, 
  Users, Send, Shield, Zap, BellRing, Sparkles, X, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications, NotificationType, NotificationItem } from "../context/NotificationContext";
import { SmartInput } from "../components/ui/SmartInput";

export function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    pushPermission, 
    requestPushPermission, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications, 
    sendTestNotification 
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Category mapping helper
  const getCategoryMatches = (itemType: NotificationType, filterCategory: string): boolean => {
    if (filterCategory === "all") return true;
    if (filterCategory === "emergency_sos") return itemType === "emergency" || itemType === "sos";
    if (filterCategory === "responders") return itemType === "volunteer" || itemType === "community";
    if (filterCategory === "services") return itemType === "hospital" || itemType === "police";
    if (filterCategory === "ai") return itemType === "ai";
    if (filterCategory === "hazard") return itemType === "hazard";
    if (filterCategory === "training_admin") return itemType === "training" || itemType === "admin";
    return itemType === filterCategory;
  };

  const filtered = notifications.filter((item) => {
    const matchesCategory = getCategoryMatches(item.type, selectedCategory);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const grouped = {
    Today: filtered.filter((n) => n.group === "Today"),
    Yesterday: filtered.filter((n) => n.group === "Yesterday"),
    Older: filtered.filter((n) => n.group === "Older"),
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "emergency":
      case "sos":
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "volunteer":
      case "community":
        return <UserCheck className="w-5 h-5 text-emerald-500" />;
      case "hospital":
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case "police":
        return <Car className="w-5 h-5 text-indigo-500" />;
      case "ai":
        return <Bot className="w-5 h-5 text-amber-500" />;
      case "hazard":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "training":
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case "admin":
        return <Megaphone className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-surface-500" />;
    }
  };

  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case "emergency":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-500/30">EMERGENCY</span>;
      case "sos":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">AUTO SOS</span>;
      case "volunteer":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">VOLUNTEER</span>;
      case "hospital":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">HOSPITAL</span>;
      case "police":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">POLICE</span>;
      case "ai":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">AI ADVISORY</span>;
      case "hazard":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">HAZARD</span>;
      case "training":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">TRAINING</span>;
      case "admin":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">BROADCAST</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-200 text-surface-700">COMMUNITY</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-surface-900 via-surface-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-surface-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Bell className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest">
              <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>REAL-TIME DISPATCH & INCIDENT CENTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
              Notification Center
              {unreadCount > 0 && (
                <span className="px-3 py-0.5 rounded-full bg-red-600 text-white text-base font-black animate-bounce">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-surface-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              Real-time Firestore synchronization for SOS dispatches, hospital trauma bed reservations, volunteer arrival ETAs, police corridor alerts, and admin broadcasts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="px-4 py-3 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white text-xs font-extrabold flex items-center gap-2 transition-all disabled:opacity-40 border border-surface-700 shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Read</span>
            </button>

            <button
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className="px-4 py-3 rounded-2xl bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-extrabold flex items-center gap-2 transition-all disabled:opacity-40 border border-red-500/30 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWA Browser Push Notification Permission Banner */}
      <div className="bg-white dark:bg-surface-900 p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-surface-900 dark:text-white">PWA Web Push Notifications</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                pushPermission === "granted" 
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : pushPermission === "denied"
                  ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}>
                STATUS: {pushPermission.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Receive native device alerts even when GoldenGuard is in the background.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {pushPermission !== "granted" ? (
            <button
              onClick={requestPushPermission}
              className="w-full sm:w-auto py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md active:scale-95 transition-all"
            >
              Enable Push Notifications
            </button>
          ) : (
            <button
              onClick={() => sendTestNotification("emergency")}
              className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5 text-amber-500" />
              <span>Test Push Alert</span>
            </button>
          )}

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <SmartInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notifications, CPR alerts, broadcasts..."
            historyKey="notification_search"
            suggestions={[
              "Auto-Crash Telemetry Detected",
              "AIIMS Trauma Room Prepped",
              "Green Corridor Active Police Dispatch",
              "CPR Certified Volunteer En Route",
              "Road Hazard Pothole Blackspot Warning",
              "AI First Aid Triage Advisory"
            ]}
            showVoiceInput={true}
            enableAIIntent={true}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: "all", label: "All Alerts" },
            { id: "emergency_sos", label: "🚨 SOS & Emergency" },
            { id: "services", label: "🏥 Hospital & Police" },
            { id: "responders", label: "🤝 Volunteers" },
            { id: "ai", label: "🤖 AI First Aid" },
            { id: "hazard", label: "⚠️ Hazards" },
            { id: "training_admin", label: "📢 Admin & Badges" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-black shadow-md scale-105"
                  : "bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:border-surface-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Grouped List */}
      <div className="space-y-8">
        {(["Today", "Yesterday", "Older"] as const).map((groupKey) => {
          const items = grouped[groupKey];
          if (items.length === 0) return null;

          return (
            <div key={groupKey} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-surface-400">{groupKey}</span>
                <span className="h-px flex-1 bg-surface-200 dark:bg-surface-800"></span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                  {items.length} {items.length === 1 ? "alert" : "alerts"}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start justify-between gap-4 ${
                      item.isRead
                        ? "bg-white/70 dark:bg-surface-900/60 border-surface-200 dark:border-surface-800/80 opacity-90"
                        : "bg-white dark:bg-surface-900 border-amber-500/60 dark:border-amber-500/50 shadow-lg ring-1 ring-amber-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-surface-100 dark:bg-surface-800 rounded-2xl shrink-0 mt-0.5">
                        {getNotificationIcon(item.type)}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-surface-900 dark:text-white leading-tight">
                            {item.title}
                          </h3>
                          {getNotificationBadge(item.type)}
                          {!item.isRead && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                          )}
                        </div>

                        <p className="text-xs text-surface-600 dark:text-surface-300 font-medium leading-relaxed">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-surface-400 font-medium">
                          <span>{item.time}</span>
                          <span>•</span>
                          <span className="capitalize text-amber-600 dark:text-amber-400 font-bold">{item.type} Channel</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                      {item.link && (
                        <Link
                          to={item.link}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-black flex items-center gap-1 transition-colors"
                        >
                          <span>Action</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item.id);
                        }}
                        title="Delete notification"
                        className="p-2 text-surface-400 hover:text-red-500 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 space-y-3">
            <Bell className="w-12 h-12 text-surface-300 dark:text-surface-700 mx-auto" />
            <h3 className="font-bold text-base text-surface-900 dark:text-white">No Matching Notifications</h3>
            <p className="text-xs text-surface-500">There are no operational alerts matching your current filter query.</p>
          </div>
        )}
      </div>

    </div>
  );
}
