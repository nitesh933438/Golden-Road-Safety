import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, Search, Bell, Sun, Moon, ShieldAlert, Globe, 
  User, CheckCircle2, ChevronDown, LogOut, Settings, 
  Bike, Award, Wifi, WifiOff, X, Sparkles, PhoneCall, 
  Check, Trash2, HeartPulse, Stethoscope, MapPin, Play,
  ExternalLink, ArrowRight, ShieldCheck, Lock, Shield as ShieldIcon
} from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";
import { useNotifications, NotificationItem } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { useOfflineSync } from "../../context/OfflineSyncContext";
import { useDemo } from "../../context/DemoContext";
import { SmartInput } from "../ui/SmartInput";
import { Logo } from "../ui/Logo";
import { triggerEmergencyCall, TEST_EMERGENCY_NUMBER } from "../../lib/emergencyCall";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard Overview",
  "/wallet": "Emergency Medical ID",
  "/saferide": "SafeRide Guardian",
  "/sos": "Golden Hour SOS Dispatch",
  "/sync": "Offline Sync Center",
  "/first-aid": "AI First Aid Assistant",
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
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { isOnline, pendingCount } = useOfflineSync();
  const { startTour, demoMode } = useDemo();

  // State
  const [headerSearch, setHeaderSearch] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread" | "emergency">("all");

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const activePageTitle = ROUTE_TITLES[location.pathname] || "GoldenGuard Platform";

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === "unread") return !n.isRead;
    if (notifFilter === "emergency") return n.type === "emergency" || n.type === "sos";
    return true;
  });

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full bg-white/85 dark:bg-surface-900/85 backdrop-blur-xl border-b border-surface-200/80 dark:border-surface-800/80 transition-all shadow-sm">
        <div className="h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 max-w-[1920px] mx-auto">
          
          {/* ==================== LEFT SIDE ==================== */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Button (All Devices) */}
            <button
              onClick={onOpenSidebar}
              className="p-1.5 sm:p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open Navigation Menu"
              aria-expanded={isSidebarOpen}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Brand Logo & Name (Always Visible) */}
            <Link to="/" className="flex items-center">
              <Logo size="sm" />
            </Link>

            {/* Current Page Breadcrumb (Hidden on extra small viewports) */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-surface-200 dark:border-surface-800 ml-1">
              <span className="text-sm font-extrabold text-surface-800 dark:text-surface-200 truncate max-w-[150px] lg:max-w-[280px]">
                {activePageTitle}
              </span>
            </div>
          </div>

          {/* ==================== CENTER SEARCH BAR ==================== */}
          <div className="flex-1 max-w-xl hidden md:block px-2 lg:px-6">
            <SmartInput
              value={headerSearch}
              onChange={setHeaderSearch}
              placeholder="Search Users, Hospitals, Police, Volunteers, Hazards, Medical IDs..."
              historyKey="global_enterprise_header_search"
              suggestions={[
                "AIIMS Level-1 Trauma Center ICU Bed",
                "Severe Bleeding 30:2 CPR Guide",
                "Highway Patrol Squad 4 Dispatch",
                "Report Oil Spill / Pothole Road Hazard",
                "Rahul Verma (Certified CPR Samaritan)",
                "Emergency Medical ID QR Scan",
                "Trigger 1-Tap Golden Hour SOS",
                "SafeRide Motorcycle Crash Telemetry"
              ]}
              showVoiceInput={true}
              enableAIIntent={true}
              inputClassName="py-1.5 text-xs bg-surface-100/90 dark:bg-surface-800/90 border-surface-200/80 dark:border-surface-700/80 rounded-full shadow-inner focus:bg-white dark:focus:bg-surface-900"
            />
          </div>

          {/* ==================== RIGHT SIDE CONTROLS ==================== */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Mobile Search Icon Button (< md screens) */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 md:hidden transition-colors"
              aria-label="Open Search"
              title="Search System"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </button>

            {/* Quick 1-Tap SOS Button */}
            <Link
              to="/sos?active=true"
              onClick={() => {
                triggerEmergencyCall(TEST_EMERGENCY_NUMBER);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-xs hover:scale-105 transition-all shrink-0"
              title="Trigger 1-Tap SOS Emergency Dispatch"
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
              <span className="hidden sm:inline">1-TAP SOS</span>
              <span className="sm:hidden text-[10px]">SOS</span>
            </Link>

            {/* Notification Bell */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-1.5 sm:p-2 rounded-xl transition-all relative outline-none ${
                  isNotificationOpen
                    ? "bg-amber-500/20 text-amber-500"
                    : "text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                }`}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-3 sm:h-4 min-w-[12px] sm:min-w-[16px] px-0.5 sm:px-1 rounded-full bg-red-600 text-white text-[8px] sm:text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-surface-900 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-surface-100 dark:divide-surface-800 animate-in fade-in zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="p-3.5 bg-surface-50 dark:bg-surface-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-black text-surface-900 dark:text-white uppercase tracking-wider">
                        Emergency Dispatch Feed
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="px-3 py-1.5 flex items-center gap-1.5 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800">
                    {(["all", "unread", "emergency"] as const).map(tab => (
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

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800/60 custom-scrollbar">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-6 text-center text-surface-400 space-y-1">
                        <ShieldCheck className="w-7 h-7 mx-auto text-emerald-500 opacity-60" />
                        <p className="text-xs font-bold">No active emergency notifications.</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 flex items-start gap-3 transition-colors ${
                            !notif.isRead 
                              ? "bg-amber-500/5 dark:bg-amber-500/10" 
                              : "hover:bg-surface-50 dark:hover:bg-surface-850"
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                            notif.type === "emergency" || notif.type === "sos"
                              ? "bg-red-500/20 text-red-500"
                              : notif.type === "hospital"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-amber-500/20 text-amber-500"
                          }`}>
                            {notif.type === "emergency" ? "🚨" : notif.type === "hospital" ? "🏥" : "🔔"}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-surface-900 dark:text-white truncate">
                                {notif.title}
                              </h4>
                              <span className="text-[10px] text-surface-400 shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-surface-600 dark:text-surface-300 line-clamp-2">
                              {notif.message}
                            </p>
                            
                            <div className="flex items-center gap-3 pt-1">
                              {notif.link && (
                                <Link
                                  to={notif.link}
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    setIsNotificationOpen(false);
                                  }}
                                  className="text-[10px] font-extrabold text-amber-500 hover:underline flex items-center gap-0.5"
                                >
                                  Open View <ArrowRight className="w-2.5 h-2.5" />
                                </Link>
                              )}
                              {!notif.isRead && (
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  className="text-[10px] font-bold text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 ml-auto"
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notif.id)}
                                className="text-[10px] font-bold text-surface-400 hover:text-red-500"
                                title="Delete notification"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2.5 bg-surface-50 dark:bg-surface-850 text-center border-t border-surface-200 dark:border-surface-800">
                    <Link
                      to="/notifications"
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-xs font-black text-amber-500 hover:underline flex items-center justify-center gap-1.5"
                    >
                      View All Notifications <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 focus:outline-none transition-colors"
              aria-label="Toggle Theme"
              title="Toggle Light / Dark Mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Profile Avatar & Unified Menu */}
            <div ref={profileRef} className="relative">
              <button 
                onClick={() => {
                  if (currentUser) {
                    setIsProfileOpen(!isProfileOpen);
                  } else {
                    onOpenAuthModal();
                  }
                }} 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-red-500 text-white flex items-center justify-center font-black text-xs shadow-xs hover:scale-105 transition-all overflow-hidden relative ring-2 ring-amber-500/30 outline-none" 
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
              {isProfileOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-surface-100 dark:divide-surface-800 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* User Profile Card Header */}
                  <div className="p-3.5 bg-gradient-to-br from-surface-50 to-amber-500/10 dark:from-surface-850 dark:to-surface-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-black text-base flex items-center justify-center shrink-0 shadow-xs ring-2 ring-amber-500/40 overflow-hidden">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        userProfile?.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="font-black text-xs text-surface-900 dark:text-white truncate">
                          {userProfile?.name || currentUser.displayName || "GoldenGuard User"}
                        </h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-[11px] text-surface-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase">
                          {userProfile?.role || "Verified Samaritan"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Network Status Row */}
                  <div className="p-2.5 bg-surface-50 dark:bg-surface-850/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-surface-400 tracking-wider">
                        Quick Settings
                      </span>
                      <div className="flex items-center gap-1.5">
                        {/* Offline/Online Status Badge */}
                        <Link
                          to="/sync"
                          onClick={() => setIsProfileOpen(false)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all border ${
                            isOnline
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse"
                          }`}
                          title="View Sync Status"
                        >
                          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                          <span>{isOnline ? "Online" : "Offline"}</span>
                          {pendingCount > 0 && (
                            <span className="px-1 bg-amber-500 text-black text-[9px] font-black rounded-full">
                              {pendingCount}
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-amber-500" />
                      <span>My Profile & Emergency Medical ID</span>
                    </Link>

                    <Link
                      to="/wallet"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <span>Emergency Medical Wallet Card</span>
                    </Link>

                    <Link
                      to="/saferide"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                      <Bike className="w-4 h-4 text-blue-500" />
                      <span>SafeRide Telemetry & Crash Guard</span>
                    </Link>

                    <Link
                      to="/training"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span>First Aid Certificates & Badges</span>
                    </Link>

                    {(isAdmin || userProfile?.role === "trainer") && (
                      <Link
                        to="/trainer"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        <span>Trainer Command Center</span>
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}

                    {!isAdmin && userProfile?.role === "volunteer" && (
                      <Link
                        to="/community"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Volunteer Dashboard</span>
                      </Link>
                    )}
                  </div>

                  {/* Demo & Tour Launcher */}
                  <div className="p-1.5 bg-surface-50 dark:bg-surface-850">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        startTour();
                      }}
                      className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-extrabold text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Re-launch Guided Live Demo</span>
                      </span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Footer Logout */}
                  <div className="p-1.5">
                    <button
                      onClick={async () => {
                        setIsProfileOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from GoldenGuard</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ==================== MOBILE FULL SCREEN SEARCH MODAL ==================== */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-surface-950/95 backdrop-blur-2xl p-4 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-white">
                 <ShieldIcon className="w-4 h-4" />
              </div>
              <span className="font-black text-sm text-surface-900 dark:text-white">GoldenGuard Smart Search</span>
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4">
            <SmartInput
              value={headerSearch}
              onChange={setHeaderSearch}
              placeholder="Type CPR, Hospitals, Police, Hazards, Volunteers..."
              historyKey="mobile_global_search"
              suggestions={[
                "AIIMS Level-1 Trauma Center ICU Bed",
                "Severe Bleeding 30:2 CPR Guide",
                "Highway Patrol Squad 4 Dispatch",
                "Report Oil Spill / Pothole Road Hazard",
                "Rahul Verma (Certified CPR Samaritan)",
                "Emergency Medical ID QR Scan",
                "Trigger 1-Tap Golden Hour SOS"
              ]}
              showVoiceInput={true}
              enableAIIntent={true}
              inputClassName="py-3 text-sm bg-surface-100 dark:bg-surface-800 border-none rounded-2xl"
            />
          </div>

          {/* Mobile Quick Category Shortcuts */}
          <div className="mt-2 space-y-3">
            <span className="text-xs font-black uppercase text-surface-400 tracking-wider">Quick Navigation</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { setIsMobileSearchOpen(false); navigate("/sos"); }}
                className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-extrabold text-xs flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> 1-Tap Golden SOS
              </button>
              <button
                onClick={() => { setIsMobileSearchOpen(false); navigate("/first-aid"); }}
                className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-extrabold text-xs flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" /> AI First Aid Assistant
              </button>
              <button
                onClick={() => { setIsMobileSearchOpen(false); navigate("/map"); }}
                className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 font-extrabold text-xs flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Smart Resource Map
              </button>
              <button
                onClick={() => { setIsMobileSearchOpen(false); navigate("/wallet"); }}
                className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-500 font-extrabold text-xs flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Emergency Medical Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
