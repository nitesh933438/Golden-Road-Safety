import React, { useState, useEffect } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  ShieldAlert,
  Stethoscope,
  Map as MapIcon,
  AlertTriangle,
  BookOpen,
  Users,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Info,
  UserCheck,
  Play,
  User,
  Bike,
  Wifi,
  WifiOff,
  LogOut,
  Award,
  Shield as ShieldIcon,
  LucideIcon,
} from "lucide-react";
import { useDemo } from "../../context/DemoContext";
import { useOfflineSync } from "../../context/OfflineSyncContext";
import { AuthModal } from "../auth/AuthModal";
import { cn } from "../../lib/utils";
import { Logo } from "../ui/Logo";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { WelcomeModal } from "../demo/WelcomeModal";
import { GuidedDemoTour } from "../demo/GuidedDemoTour";
import { AutoSOSModal } from "../crash/AutoSOSModal";
import { CrashTopBanner } from "../crash/CrashTopBanner";
import { SimulateCrashButton } from "../crash/SimulateCrashButton";
import { useAuth } from "../../context/AuthContext";
import { RoadSafetyBackground } from "../RoadSafetyBackground";

type NavItem = {
  name: string;
  to: string;
  icon: LucideIcon;
  alert?: boolean;
  adminOnly?: boolean;
};

const USER_NAV_ITEMS: NavItem[] = [
  { name: "User Dashboard", to: "/", icon: LayoutDashboard },
  { name: "SafeRide Guardian 🏍️", to: "/saferide", icon: Bike },
  { name: "Smart Incident Map", to: "/map", icon: MapIcon },
  { name: "SOS (Golden Hour)", to: "/sos", icon: ShieldAlert, alert: true },
  { name: "Emergency Wallet 💳", to: "/wallet", icon: ShieldAlert },
  { name: "AI First Aid", to: "/first-aid", icon: Stethoscope },
  { name: "Report Hazard", to: "/report", icon: AlertTriangle },
  { name: "Good Samaritan Network", to: "/community", icon: Users },
  { name: "Lifesaver Training", to: "/training", icon: BookOpen },
  { name: "Notifications", to: "/notifications", icon: Bell },
  { name: "My Profile", to: "/profile", icon: User },
  { name: "Sync Center 🔄", to: "/sync", icon: Wifi },
];

const TRAINER_NAV_ITEMS: NavItem[] = [
  { name: "Trainer Dashboard 🎓", to: "/trainer", icon: Award },
  { name: "Training Programs & Courses", to: "/training", icon: BookOpen },
  { name: "SafeRide Guardian 🏍️", to: "/saferide", icon: Bike },
  { name: "Smart Incident Map", to: "/map", icon: MapIcon },
  { name: "Emergency Wallet 💳", to: "/wallet", icon: ShieldAlert },
  { name: "AI First Aid Assistant", to: "/first-aid", icon: Stethoscope },
  { name: "Report Hazard", to: "/report", icon: AlertTriangle },
  { name: "Good Samaritan Network", to: "/community", icon: Users },
  { name: "Notifications", to: "/notifications", icon: Bell },
  { name: "Sync Center 🔄", to: "/sync", icon: Wifi },
  { name: "Trainer Profile", to: "/profile", icon: User },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { name: "Admin Command Center 🛡️", to: "/admin", icon: ShieldAlert, adminOnly: true },
  { name: "Trainer Portal 🎓", to: "/trainer", icon: Award },
  { name: "Main System Dashboard", to: "/", icon: LayoutDashboard },
  { name: "Smart Incident Map", to: "/map", icon: MapIcon },
  { name: "Emergency Wallet 💳", to: "/wallet", icon: ShieldAlert },
  { name: "SafeRide Guardian 🏍️", to: "/saferide", icon: Bike },
  { name: "SOS (Golden Hour)", to: "/sos", icon: ShieldAlert, alert: true },
  { name: "AI First Aid", to: "/first-aid", icon: Stethoscope },
  { name: "Report Hazard", to: "/report", icon: AlertTriangle },
  { name: "Lifesaver Academy", to: "/training", icon: BookOpen },
  { name: "Samaritan Network", to: "/community", icon: Users },
  { name: "Analytics & Strategy", to: "/impact", icon: TrendingUp },
  { name: "Notifications & Broadcast", to: "/notifications", icon: Bell },
  { name: "Sync Center 🔄", to: "/sync", icon: Wifi },
  { name: "My Profile", to: "/profile", icon: User },
];

export function Layout() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { demoMode, toggleDemoMode, startTour, setShowWelcomeModal } = useDemo();
  const { isOnline, pendingCount } = useOfflineSync();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const role = userProfile?.role || "user";
  const NAV_ITEMS = (isAdmin || role === "admin")
    ? ADMIN_NAV_ITEMS
    : role === "trainer"
    ? TRAINER_NAV_ITEMS
    : USER_NAV_ITEMS;

  // Keyboard navigation: Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  // Lock body scroll when sidebar/drawer is open on mobile to prevent double-scrolling
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Dispatch a window resize event to trigger Leaflet map invalidateSize or other redraws
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen w-full bg-surface-50 dark:bg-surface-950 overflow-hidden font-sans relative">
      {/* Full-screen Fixed Animated Road Safety Background */}
      <RoadSafetyBackground />

      <WelcomeModal />
      <GuidedDemoTour />
      <AutoSOSModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Backdrop Overlay (All Devices: Mobile, Tablet, Desktop) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Overlay Drawer (All Devices: Mobile, Tablet, Desktop) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(88vw,320px)] flex flex-col bg-surface-950 text-white shadow-2xl border-r border-surface-800/80 transition-transform duration-300 ease-in-out h-[100dvh] max-h-[100dvh] overflow-hidden shrink-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header (Fixed/pinned at the top) */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-surface-800/80 bg-surface-900/50 shrink-0">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <Logo size="md" />
          </Link>
          <button
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Navigation Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu Area (Independent scrolling) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 space-y-5">
          {/* Hackathon Live Demo Launcher & Simulate Crash */}
          <div className="mx-4 p-4 rounded-2xl bg-gradient-to-r from-red-600/20 via-amber-600/20 to-amber-500/15 border border-amber-500/30 space-y-3 shrink-0 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Hackathon Mode</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-surface-200 font-medium leading-normal">
              Interactive Guided Live Demo & Crash Simulator
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  startTour();
                }}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Live Tour</span>
              </button>

              <SimulateCrashButton variant="compact" className="w-full justify-center rounded-xl min-h-[44px] py-2.5" />
            </div>
          </div>

          {/* Navigation Menu Items */}
          <div className="px-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 min-h-[44px] py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 group select-none outline-none",
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 font-black border-l-4 border-amber-500 shadow-sm"
                      : "text-surface-300 hover:text-white hover:bg-surface-800/80"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 shrink-0",
                        isActive ? "text-amber-400" : "text-surface-400 group-hover:text-amber-400"
                      )}
                    />
                    <span className={cn("flex-1 text-left leading-snug whitespace-normal py-0.5", item.alert && "text-red-400 font-bold")}>
                      {item.name}
                    </span>
                    {item.alert && (
                      <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black uppercase border border-red-500/30 animate-pulse shrink-0">
                        SOS
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Sidebar Footer (Fixed/pinned at the bottom) */}
        <div 
          className="p-4 border-t border-surface-800/80 bg-surface-900/60 space-y-3 shrink-0"
          style={{ 
            paddingBottom: "calc(max(16px, env(safe-area-inset-bottom)) + 12px)" 
          }}
        >
          {/* User Profile Card or Login */}
          {currentUser ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50 min-h-[56px]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-black font-black text-xs flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-amber-400/50">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    userProfile?.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {userProfile?.name || currentUser.displayName || "GoldenGuard User"}
                  </p>
                  <p className="text-[10px] text-amber-400 font-semibold truncate">
                    {userProfile?.role || "Verified Samaritan"}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setSidebarOpen(false);
                  await logout();
                }}
                className="p-2 text-surface-400 hover:text-red-400 hover:bg-surface-700/50 rounded-lg transition-colors ml-2 shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setSidebarOpen(false);
                setAuthModalOpen(true);
              }}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Quick Controls */}
          <div className="flex items-center gap-2 pt-1">
            <button 
              onClick={toggleDemoMode}
              className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-800/40 border border-surface-700/35 hover:border-amber-500/30 text-surface-300 hover:text-white transition-all text-xs font-black select-none min-h-[44px]"
              aria-label="Toggle Demo Mode"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${demoMode ? 'bg-amber-400 animate-pulse' : 'bg-surface-600'}`}></span>
                <span>Demo Mode</span>
              </div>
              {demoMode ? (
                <ToggleRight className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-surface-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => {
                setSidebarOpen(false);
                setShowWelcomeModal(true);
              }}
              className="p-2.5 bg-surface-800/40 border border-surface-700/35 hover:border-amber-500/30 text-surface-400 hover:text-amber-400 hover:bg-surface-800/80 rounded-xl transition-all text-xs font-medium shrink-0 flex items-center justify-center w-11 h-11"
              title="Re-open Welcome Screen"
              aria-label="Re-open Welcome Screen"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 bg-surface-50/80 dark:bg-surface-950/60 backdrop-blur-[2px] h-full overflow-hidden relative z-10">
        <CrashTopBanner />

        {/* Header */}
        <Header 
          onOpenSidebar={() => setSidebarOpen(true)} 
          onOpenAuthModal={() => setAuthModalOpen(true)} 
          isSidebarOpen={isSidebarOpen}
        />

        {/* Offline Alert Banner */}
        {!isOnline && (
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-4 py-2.5 text-xs font-black flex items-center justify-between shadow-lg z-30 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
              <span>🔴 Offline Mode Active — Internet unavailable. SOS, AI First Aid Guides & Contacts remain 100% operational.</span>
            </div>
            <Link to="/sync" className="px-3 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white text-[11px] font-black uppercase transition-colors shrink-0">
              Sync Center ({pendingCount})
            </Link>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative flex flex-col custom-scrollbar">
          <div className="flex-1 p-4 sm:p-8 pb-24 lg:pb-8">
            <Outlet context={{ demoMode }} />
          </div>
          <Footer />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-t border-surface-200 dark:border-surface-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all",
                  isActive
                    ? "text-primary-600 dark:text-primary-400 font-bold"
                    : "text-surface-500 hover:text-surface-900 dark:hover:text-surface-50"
                )
              }
            >
              <item.icon className={cn("w-5 h-5", item.alert && "text-red-500")} />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.name}
              </span>
            </NavLink>
          ))}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 transition-colors"
            aria-label="Open More Menu"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}


