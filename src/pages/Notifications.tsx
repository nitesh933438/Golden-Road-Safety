import React, { useState } from "react";
import { 
  Bell, ShieldAlert, AlertTriangle, CheckCircle2, 
  MapPin, Heart, Search, Filter, Trash2, CheckCheck, 
  Info, ArrowRight, UserCheck, Activity
} from "lucide-react";
import { Link } from "react-router-dom";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  group: "Today" | "Yesterday" | "Older";
  type: "emergency" | "hazard" | "volunteer" | "system";
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Volunteer Accepted SOS",
    message: "Vol. Rahul Verma accepted your emergency dispatch request in Sector 7, Delhi. (ETA: 2.1 mins)",
    time: "10 minutes ago",
    group: "Today",
    type: "emergency",
    isRead: false,
    link: "/sos"
  },
  {
    id: "n2",
    title: "Hospital Trauma ER Prepped",
    message: "Max Super Specialty Hospital Trauma Bay 2 has reserved ICU bed for incoming Golden Hour casualty.",
    time: "25 minutes ago",
    group: "Today",
    type: "emergency",
    isRead: false,
    link: "/map"
  },
  {
    id: "n3",
    title: "Police Patrol Unit Dispatched",
    message: "Highway Patrol Squad 4 dispatched to NH-48 Km 14 for accident site cordon and traffic clearance.",
    time: "1 hour ago",
    group: "Today",
    type: "emergency",
    isRead: true,
    link: "/map"
  },
  {
    id: "n4",
    title: "Road Hazard Report Verified",
    message: "Municipal Command Center verified blackspot pothole report on Outer Ring Road. Maintenance crew assigned.",
    time: "3 hours ago",
    group: "Today",
    type: "hazard",
    isRead: true,
    link: "/report"
  },
  {
    id: "n5",
    title: "New CPR Certificate Awarded",
    message: "Congratulations! Your Level 3 CPR & Advanced Triage Refresher certificate has been verified.",
    time: "Yesterday at 4:30 PM",
    group: "Yesterday",
    type: "volunteer",
    isRead: true,
    link: "/training"
  },
  {
    id: "n6",
    title: "Community Responder Milestone",
    message: "Over 1,400 active volunteers logged in across Mumbai & Delhi today. Golden Hour response time dropped to 4.2 mins.",
    time: "Yesterday at 11:15 AM",
    group: "Yesterday",
    type: "system",
    isRead: true,
    link: "/community"
  },
  {
    id: "n7",
    title: "Good Samaritan Protection Law Update",
    message: "Supreme Court Guidelines reminder: You are legally immune when providing emergency trauma care.",
    time: "3 days ago",
    group: "Older",
    type: "system",
    isRead: true,
    link: "/first-aid"
  }
];

export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "emergency" | "hazard" | "volunteer" | "system">("all");

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filtered = notifications.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const grouped = {
    Today: filtered.filter(n => n.group === "Today"),
    Yesterday: filtered.filter(n => n.group === "Yesterday"),
    Older: filtered.filter(n => n.group === "Older")
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "hazard":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "volunteer":
        return <UserCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-900 p-6 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-surface-900 dark:text-white">Operations Notification Center</h1>
            <p className="text-xs text-surface-500">Real-time alerts, volunteer updates, and command dispatches</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" /> Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notification alerts..."
            className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "emergency", label: "SOS & Dispatch" },
            { id: "hazard", label: "Hazards" },
            { id: "volunteer", label: "Volunteers" },
            { id: "system", label: "System" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-black shadow-md"
                  : "bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:border-surface-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Group List */}
      <div className="space-y-8">
        {(["Today", "Yesterday", "Older"] as const).map((groupKey) => {
          const items = grouped[groupKey];
          if (items.length === 0) return null;

          return (
            <div key={groupKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-surface-400">{groupKey}</span>
                <span className="h-px flex-1 bg-surface-200 dark:bg-surface-800"></span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleRead(item.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      item.isRead
                        ? "bg-white/60 dark:bg-surface-900/60 border-surface-200 dark:border-surface-800 opacity-85"
                        : "bg-white dark:bg-surface-900 border-amber-500/50 dark:border-amber-500/40 shadow-md ring-1 ring-amber-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-surface-100 dark:bg-surface-800 rounded-2xl shrink-0 mt-0.5">
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-surface-900 dark:text-white">{item.title}</h3>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">{item.message}</p>
                        <span className="text-[10px] text-surface-400 font-medium block pt-1">{item.time}</span>
                      </div>
                    </div>

                    {item.link && (
                      <Link
                        to={item.link}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-900 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 space-y-3">
            <Bell className="w-10 h-10 text-surface-400 mx-auto opacity-50" />
            <h3 className="font-bold text-base text-surface-900 dark:text-white">No Notifications Found</h3>
            <p className="text-xs text-surface-500">There are no operational alerts matching your current filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}
