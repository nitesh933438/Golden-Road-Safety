import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { Bell, ShieldCheck, ArrowRight, Trash2, ExternalLink, Check, Trash } from "lucide-react";
import { NotificationItem } from "../../context/NotificationContext";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  clearReadNotifications: () => void;
  notifFilter: "all" | "sos" | "emergency" | "hazard" | "system" | "community";
  setNotifFilter: (filter: "all" | "sos" | "emergency" | "hazard" | "system" | "community") => void;
}

export function NotificationsModal({ 
  isOpen, onClose, notifications, unreadCount, markAsRead, markAllAsRead, 
  deleteNotification, deleteAllNotifications, clearReadNotifications, notifFilter, setNotifFilter 
}: NotificationsModalProps) {
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === "all") return true;
    if (notifFilter === "sos") return n.type === "sos";
    if (notifFilter === "emergency") return n.type === "emergency";
    if (notifFilter === "hazard") return n.type === "hazard";
    if (notifFilter === "system") return n.type === "system";
    if (notifFilter === "community") return n.type === "community";
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Notifications (${unreadCount})`} position="top-right">
      {/* Filter Tabs */}
      <div className="px-3 py-1.5 flex flex-wrap items-center gap-1.5 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800">
        {(["all", "sos", "emergency", "hazard", "system", "community"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setNotifFilter(tab)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
              notifFilter === tab
                ? "bg-amber-500 text-black shadow-xs"
                : "text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="px-3 py-1 flex items-center justify-between bg-surface-50 dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800">
        <button onClick={markAllAsRead} className="text-[10px] font-bold text-emerald-600 hover:underline">Mark all read</button>
        <button onClick={clearReadNotifications} className="text-[10px] font-bold text-surface-500 hover:underline">Clear read</button>
        <button onClick={() => { if(confirm("Are you sure?")) deleteAllNotifications() }} className="text-[10px] font-bold text-red-500 hover:underline">Delete all</button>
      </div>

      {/* List */}
      <div className="divide-y divide-surface-100 dark:divide-surface-800/60 max-h-[60vh] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center text-surface-400 space-y-1">
            <Bell className="w-7 h-7 mx-auto text-surface-300" />
            <p className="text-xs font-bold">No notifications found.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => { if (!notif.isRead) markAsRead(notif.id); }}
              className={`p-3 flex items-start gap-3 transition-colors cursor-pointer ${
                !notif.isRead ? "bg-amber-500/5 dark:bg-amber-500/10" : "hover:bg-surface-50 dark:hover:bg-surface-850"
              }`}
            >
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-surface-100 dark:bg-surface-800">
                {notif.type === "sos" ? "🚨" : notif.type === "emergency" ? "⚠️" : "🔔"}
              </div>
              
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-surface-900 dark:text-white truncate">{notif.title}</h4>
                  <span className="text-[10px] text-surface-400 shrink-0">{notif.time}</span>
                </div>
                <p className="text-[11px] text-surface-600 dark:text-surface-300 line-clamp-2">{notif.message}</p>
                
                <div className="flex items-center gap-2 pt-1.5">
                  {notif.link && (
                    <Link to={notif.link} onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-[10px] font-extrabold text-amber-500 hover:underline">
                      View <ArrowRight className="w-2.5 h-2.5 inline" />
                    </Link>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} className="text-[10px] font-bold text-surface-400 hover:text-red-500 ml-auto">
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
