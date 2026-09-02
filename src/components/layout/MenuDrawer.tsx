import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { X, Search, Bell, Sun, Moon, LogOut, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { Logo } from "../ui/Logo";
import { BatteryStatus } from "../BatteryStatus";
import { VoiceSOSToggle } from "../voice/VoiceSOSToggle";
import { PWAInstallButton } from "../pwa/PWAInstallButton";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../theme/ThemeProvider";
import { useOfflineSync } from "../../context/OfflineSyncContext";
import { useNotifications } from "../../context/NotificationContext";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navGroups: any[];
}

export function MenuDrawer({ isOpen, onClose, navGroups }: MenuDrawerProps) {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isOnline, pendingCount } = useOfflineSync();
  const { unreadCount } = useNotifications();
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="fixed top-0 left-0 z-[1001] w-full max-w-[420px] h-[100dvh] flex flex-col bg-white dark:bg-surface-950 text-surface-900 dark:text-white shadow-2xl border-r border-surface-200 dark:border-surface-800 transition-transform duration-300 ease-in-out pt-[env(safe-area-inset-top)]"
      >
        {/* Header */}
        <div className="flex-none h-16 flex items-center justify-between px-5 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
          <Link to="/" onClick={onClose}>
            <Logo size="md" variant="auto" />
          </Link>
          <button
            className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-800"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="flex-none p-4 border-b border-surface-200 dark:border-surface-800">
           <form
            onSubmit={(e) => {
              e.preventDefault();
              if (sidebarSearchQuery.trim()) {
                onClose();
                navigate(`/search?q=${encodeURIComponent(sidebarSearchQuery.trim())}`);
              }
            }}
            className="relative flex items-center"
          >
            <Search className="w-4 h-4 absolute left-3 text-amber-500" />
            <input
              type="text"
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-3 text-sm rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-700"
            />
          </form>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-6">
          {/* Quick Controls */}
          <div className="px-4 space-y-3">
            <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Quick Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-xs font-bold"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <Link
                to="/notifications"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-xs font-bold"
              >
                Alerts {unreadCount > 0 && <span className="bg-red-500 text-white px-1.5 rounded-full text-[10px]">{unreadCount}</span>}
              </Link>
            </div>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-2 text-xs">
              <div className="flex justify-between"><span>Battery</span><BatteryStatus variant="compact" /></div>
              <div className="flex justify-between"><span>Voice SOS</span><VoiceSOSToggle variant="header" /></div>
              <div className="flex justify-between">
                <span>Sync</span>
                <span className={isOnline ? "text-emerald-500" : "text-amber-500"}>{isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {navGroups.map((group) => (
            <div key={group.title} className="px-4 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-500">
                {group.title}
              </div>
              {group.items.map((item: any) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-none p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 safe-area-bottom space-y-3">
          <PWAInstallButton variant="sidebar" />
          {currentUser ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-200 dark:bg-surface-800">
              <div className="text-xs">
                <p className="font-bold">{userProfile?.name || currentUser.displayName}</p>
                <p className="text-surface-500">{userProfile?.role}</p>
              </div>
              <button onClick={async () => { onClose(); await logout(); }} className="p-2 hover:text-red-500">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onClose(); /* Handle auth modal open */ }}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-black text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
