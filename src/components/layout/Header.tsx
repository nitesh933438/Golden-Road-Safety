import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, Bell, Sun, Moon, ShieldAlert, Globe, 
  User, CheckCircle2, ChevronDown, LogOut, Settings, 
  Bike, Award, Wifi, WifiOff, X, Sparkles, PhoneCall, 
  Check, Trash2, HeartPulse, Stethoscope, MapPin, Play,
  ExternalLink, ArrowRight, ShieldCheck, Lock, Shield as ShieldIcon
} from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";
import { useNotifications, NotificationItem } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { useOfflineSync } from "../../context/OfflineSyncContext";
import { SmartInput } from "../ui/SmartInput";
import { NotificationsModal } from "./NotificationsModal";
import { ProfileModal } from "./ProfileModal";
import { Logo } from "../ui/Logo";
import { triggerEmergencyCall, EMERGENCY_DISPATCH_NUMBER } from "../../lib/emergencyCall";
import { PWAInstallButton } from "../pwa/PWAInstallButton";
import { VoiceSOSToggle } from "../voice/VoiceSOSToggle";
import { BatteryStatus } from "../BatteryStatus";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard Overview",
  "/wallet": "Emergency Medical ID",
  "/saferide": "SafeRide Guardian",
  "/sos": "Golden Hour SOS Dispatch",
  "/sync": "Offline Sync Center",
  "/first-aid": "Smart First Aid Assistant",
  "/map": "Smart Incident Map",
  "/notifications": "Notifications & Alerts",
  "/profile": "User Medical Profile",
  "/impact": "Impact Analytics",
  "/about": "About GoldenGuard",
  "/team": "Team & Organization",
  "/report": "Report Road Hazard",
  "/training": "Lifesaver Training",
  "/community": "Good Samaritan Network",
  "/admin": "Emergency Control Center",
};

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenAuthModal: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onOpenSidebar, onOpenAuthModal, isSidebarOpen }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { isOnline, pendingCount } = useOfflineSync();

  // State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "sos" | "emergency" | "hazard" | "system" | "community">("all");

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const activePageTitle = ROUTE_TITLES[location.pathname] || "GoldenGuard Platform";

  // Close popovers on click outside (Only needed if we had non-portal popovers. Modals handle themselves)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Modals use React Portals and handle their own backdrop clicks.
      // Do not close them here on mousedown, otherwise clicks inside the portal will unmount it before the 'click' event fires.
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

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
    <>
      <header className="sticky top-0 z-30 h-14 sm:h-16 w-full bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200/80 dark:border-surface-800/80 transition-colors shadow-xs">
        <div className="h-full px-1.5 min-[360px]:px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-0.5 min-[360px]:gap-1 sm:gap-4 max-w-[1920px] mx-auto flex-nowrap overflow-hidden">
          
          {/* ==================== LEFT SIDE ==================== */}
          <div className="flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
            {/* Hamburger Button (Sidebar Toggle for Mobile & Desktop) */}
            <button
              onClick={onOpenSidebar}
              className="flex p-1 min-[360px]:p-1.5 sm:p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 focus:outline-none transition-colors items-center justify-center shrink-0"
              aria-label="Open Navigation Menu"
              aria-expanded={isSidebarOpen}
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 min-[360px]:w-4.5 min-[360px]:h-4.5 md:w-5 md:h-5 text-amber-500 md:text-current shrink-0" />
            </button>

            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center">
              <Logo size="sm" wordmarkClassName="hidden md:flex" />
            </Link>

            {/* Current Page Breadcrumb (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-surface-200 dark:border-surface-800 ml-1">
              <span className="text-xs font-bold text-surface-600 dark:text-surface-300 truncate max-w-[180px] xl:max-w-[280px]">
                {activePageTitle}
              </span>
            </div>
          </div>

          {/* ==================== RIGHT SIDE CONTROLS ==================== */}
          <div className="flex items-center gap-0.5 min-[360px]:gap-1 sm:gap-2 shrink-0 flex-nowrap">
            
            {/* Battery / Charge Indicator (Always visible on mobile & desktop) */}
            <BatteryStatus variant="compact" />

            {/* Desktop secondary controls (PWA) */}
            <div className="hidden lg:flex items-center gap-2">
              <PWAInstallButton variant="header" />
            </div>

            {/* 1-Tap SOS Icon / Button */}
            <Link
              to="/sos?active=true"
              className="flex items-center justify-center p-1 min-[360px]:p-1.5 sm:px-3 sm:py-1.5 rounded-lg min-[360px]:rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-xs shadow-xs hover:shadow-md transition-all shrink-0 min-h-[30px] sm:min-h-0"
              title="Trigger 1-Tap SOS Emergency Dispatch"
            >
              <ShieldAlert className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-white shrink-0 animate-pulse" />
              <span className="hidden sm:inline font-extrabold tracking-wide whitespace-nowrap ml-1">1-TAP SOS</span>
            </Link>

            {/* Hands-Free Voice SOS Toggle (Always visible in header row) */}
            <div className="flex items-center shrink-0">
              <VoiceSOSToggle variant="header" />
            </div>

            {/* Always Visible: Notification Bell */}
            <div ref={notificationRef} className="relative shrink-0">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-1 min-[360px]:p-1.5 sm:p-2 rounded-xl transition-all relative outline-none shrink-0 ${
                  isNotificationOpen
                    ? "bg-amber-500/20 text-amber-500"
                    : "text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                }`}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4 min-[360px]:w-4.5 min-[360px]:h-4.5 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-[360px]:top-0.5 min-[360px]:right-0.5 h-3.5 min-[360px]:h-4 min-w-[14px] min-[360px]:min-w-[16px] px-0.5 min-[360px]:px-1 rounded-full bg-red-600 text-white text-[9px] min-[360px]:text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-surface-900 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Modal (Fits Mobile & Desktop Responsively) */}
              <NotificationsModal
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
                deleteNotification={deleteNotification}
                deleteAllNotifications={clearAllNotifications}
                clearReadNotifications={() => {
                  notifications.filter(n => n.isRead).forEach(n => deleteNotification(n.id));
                }}
                notifFilter={notifFilter}
                setNotifFilter={setNotifFilter}
              />
            </div>

            {/* Always Visible: Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 min-[360px]:p-1.5 sm:p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 focus:outline-none transition-colors shrink-0"
              aria-label="Toggle Theme"
              title="Toggle Light / Dark Mode"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 min-[360px]:w-4.5 min-[360px]:h-4.5 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 min-[360px]:w-4.5 min-[360px]:h-4.5 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Profile Avatar & Unified Menu (Mobile, Tablet & Desktop) */}
            <div ref={profileRef} className="relative shrink-0">
              <button 
                onClick={() => {
                  if (currentUser) {
                    setIsProfileOpen(!isProfileOpen);
                  } else {
                    onOpenAuthModal();
                  }
                }} 
                className="w-6.5 h-6.5 min-[360px]:w-7.5 min-[360px]:h-7.5 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-red-500 text-white flex items-center justify-center font-black text-[10px] min-[360px]:text-[11px] sm:text-xs shadow-xs hover:scale-105 transition-all overflow-hidden relative ring-2 ring-amber-500/30 outline-none shrink-0" 
                title={currentUser ? `${userProfile?.name || 'User'} Menu` : "Sign In / Register"}
              >
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "GG"}</span>
                )}
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-surface-900 ${
                  isOnline ? "bg-emerald-400" : "bg-red-500 animate-pulse"
                }`}></span>
              </button>

            {/* Profile & Settings Unified Menu */}
            <ProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              currentUser={currentUser}
              userProfile={userProfile}
              isAdmin={isAdmin}
              logout={logout}
              isOnline={isOnline}
              pendingCount={pendingCount}
            />
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
