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
  { name: "Smart Incident Map", to: "/map", icon: MapIcon },
  { name: "AI First Aid Assistant", to: "/first-aid", icon: Stethoscope },
  { name: "Report Hazard", to: "/report", icon: AlertTriangle },
  { name: "Good Samaritan Network", to: "/community", icon: Users },
  { name: "Notifications", to: "/notifications", icon: Bell },
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

  return (
    <div className="flex h-screen w-full bg-surface-950 overflow-hidden font-sans relative">
      {/* Full-screen Fixed Animated Road Safety Background */}
      <RoadSafetyBackground />

      <WelcomeModal />
      <GuidedDemoTour />
      <AutoSOSModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Backdrop Overlay (Every Device) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Overlay Drawer (Every Device) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 sm:w-80 flex flex-col bg-surface-950 text-white shadow-2xl border-r border-surface-800/80 transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-surface-800/80 bg-surface-900/50">
          <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 text-black rounded-xl shadow-lg ring-2 ring-amber-500/40">
              <ShieldIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">GoldenGuard</span>
              <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Golden Hour Guardian</span>
            </div>
          </Link>
          <button
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Navigation Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hackathon Live Demo Launcher & Simulate Crash */}
        <div className="mx-4 my-3 p-3.5 rounded-2xl bg-gradient-to-r from-red-600/20 via-amber-600/20 to-amber-500/15 border border-amber-500/30 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Hackathon Mode</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-xs text-surface-200 font-medium leading-tight">Interactive Guided Live Demo & Crash Simulator</p>
          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => {
                setSidebarOpen(false);
                startTour();
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Live Tour</span>
            </button>

            <SimulateCrashButton variant="compact" className="w-full justify-center" />
          </div>
        </div>

        {/* Scrollable Navigation Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar py-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group",
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 font-bold border-l-4 border-amber-500 shadow-sm"
                    : "text-surface-300 hover:text-white hover:bg-surface-800/80"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "w-4 h-4 transition-transform group-hover:scale-110 shrink-0",
                      isActive ? "text-amber-400" : "text-surface-400 group-hover:text-amber-400"
                    )}
                  />
                  <span className={cn("flex-1 truncate", item.alert && "text-red-400 font-bold")}>
                    {item.name}
                  </span>
                  {item.alert && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-black uppercase border border-red-500/30 animate-pulse">
                      SOS
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-surface-800/80 bg-surface-900/60 space-y-2.5 shrink-0">
          {/* User Profile Card or Login */}
          {currentUser ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-black font-black text-xs flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-amber-400/50">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
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
                className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-surface-700/50 rounded-lg transition-colors ml-2"
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
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Quick Controls */}
          <div className="flex items-center justify-between pt-1">
            <button 
              onClick={toggleDemoMode}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 text-xs font-medium transition-colors"
              aria-label="Toggle Demo Mode"
            >
              <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-400 animate-pulse' : 'bg-surface-600'}`}></span>
              <span>Demo Mode</span>
              {demoMode ? <ToggleRight className="w-4 h-4 text-amber-400 ml-1" /> : <ToggleLeft className="w-4 h-4 ml-1" />}
            </button>

            <button
              onClick={() => {
                setSidebarOpen(false);
                setShowWelcomeModal(true);
              }}
              className="p-1.5 text-surface-400 hover:text-amber-400 hover:bg-surface-800 rounded-lg transition-colors text-xs font-medium"
              title="Re-open Welcome Screen"
              aria-label="Re-open Welcome Screen"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 bg-surface-950/60 backdrop-blur-[2px] h-full overflow-hidden relative z-10">
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


