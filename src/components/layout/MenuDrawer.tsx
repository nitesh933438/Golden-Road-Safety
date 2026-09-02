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
        <div className="flex-none h-14 flex items-center justify-between px-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
          <Link to="/" onClick={onClose}>
            <Logo size="sm" variant="auto" />
          </Link>
          <button
            className="p-1.5 rounded-lg text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-800"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="flex-none p-3 border-b border-surface-200 dark:border-surface-800">
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
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-amber-500" />
            <input
              type="text"
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 text-[11px] rounded-lg bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-700"
            />
          </form>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3">
          {/* Quick Controls */}
          <div className="px-3 space-y-1">
            <h3 className="text-[8px] font-black uppercase text-surface-400 tracking-wider">Controls</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-[10px] font-bold"
              >
                {theme === "dark" ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3" />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <Link
                to="/notifications"
                onClick={onClose}
                className="flex items-center justify-between px-2 py-1.5 rounded-md bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-[10px] font-bold"
              >
                Alerts {unreadCount > 0 && <span className="bg-red-500 text-white px-1 rounded-full text-[8px]">{unreadCount}</span>}
              </Link>
            </div>
            <div className="grid grid-cols-1 p-1.5 rounded-md bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-[10px] space-y-0.5">
              <div className="flex justify-between"><span>Battery</span><BatteryStatus variant="compact" /></div>
              <div className="flex justify-between"><span>Voice SOS</span><VoiceSOSToggle variant="header" /></div>
            </div>
          </div>

          {/* Navigation */}
          {navGroups.map((group) => (
            <div key={group.title} className="px-3 space-y-0.5">
              <div className="px-2 pt-2 pb-0.5 text-[8px] font-black uppercase tracking-wider text-surface-400">
                {group.title}
              </div>
              {group.items.map((item: any) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-2 py-2 rounded-md text-[11px] font-semibold transition-colors",
                      isActive
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                    )
                  }
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-none p-2 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 safe-area-bottom space-y-1">
          <div className="flex gap-1.5">
            <div className="flex-1">
              <PWAInstallButton variant="sidebar" />
            </div>
            {currentUser ? (
              <button 
                onClick={async () => { onClose(); await logout(); }} 
                className="p-2 rounded-md bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => { onClose(); }}
                className="px-3 py-1.5 rounded-md bg-amber-500 text-black font-black text-[10px]"
              >
                Sign In
              </button>
            )}
          </div>
          {currentUser && (
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
              <div className="text-[9px] truncate">
                <p className="font-bold truncate">{userProfile?.name || currentUser.displayName}</p>
                <p className="text-surface-500 truncate">{userProfile?.role}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
