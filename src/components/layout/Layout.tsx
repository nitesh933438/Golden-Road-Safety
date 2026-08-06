import React, { useState } from "react";
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

import { LucideIcon, Shield as ShieldIcon } from "lucide-react";

type NavItem = {
  name: string;
  to: string;
  icon: LucideIcon;
  alert?: boolean;
  adminOnly?: boolean;
};

const BASE_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "Emergency Wallet 💳", to: "/wallet", icon: ShieldAlert },
  { name: "SafeRide Guardian 🏍️", to: "/saferide", icon: Bike },
  { name: "SOS (Golden Hour)", to: "/sos", icon: ShieldAlert, alert: true },
  { name: "Sync Center 🔄", to: "/sync", icon: Wifi },
  { name: "AI First Aid", to: "/first-aid", icon: Stethoscope },
  { name: "Smart Map", to: "/map", icon: MapIcon },
  { name: "Notifications", to: "/notifications", icon: Bell },
  { name: "My Profile", to: "/profile", icon: User },
  { name: "Impact & Strategy", to: "/impact", icon: TrendingUp },
  { name: "About GoldenGuard", to: "/about", icon: Info },
  { name: "Team & Contact", to: "/team", icon: UserCheck },
  { name: "Report Hazard", to: "/report", icon: AlertTriangle },
  { name: "Training", to: "/training", icon: BookOpen },
  { name: "Community", to: "/community", icon: Users },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { name: "Admin Center", to: "/admin", icon: ShieldAlert, adminOnly: true },
];

export function Layout() {
  const { userProfile, isAdmin } = useAuth();
  const { demoMode, toggleDemoMode, startTour, setShowWelcomeModal } = useDemo();
  const { isOnline, pendingCount } = useOfflineSync();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const NAV_ITEMS = [...BASE_NAV_ITEMS, ...(isAdmin || userProfile?.role === "admin" ? ADMIN_NAV_ITEMS : [])];

  return (
    <div className="flex h-screen w-full bg-surface-50 dark:bg-surface-950 overflow-hidden font-sans">
      <WelcomeModal />
      <GuidedDemoTour />
      <AutoSOSModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Slide-in) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface-900 transition-transform duration-300 lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-surface-800/60">
          <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="flex items-center justify-center w-10 h-10 bg-amber-500 text-white rounded-xl shadow-lg ring-2 ring-amber-500/40">
              <ShieldIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">GoldenGuard</span>
              <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Golden Hour Guardian</span>
            </div>
          </Link>
          <button
            className="ml-auto lg:hidden text-surface-500 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hackathon Live Demo Launcher & Simulate Crash */}
        <div className="mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-red-600/30 via-amber-600/30 to-amber-500/20 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between mb-1">
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

        <div className="flex-1 overflow-y-auto mt-2 px-4 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "bg-surface-800 text-white shadow-sm font-semibold"
                    : "text-surface-400 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "w-4 h-4 opacity-80",
                      isActive ? "text-current" : ""
                    )}
                  />
                  <span className={cn(item.alert && "text-red-400 font-bold")}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        <div className="p-4 border-t border-surface-800 space-y-2">
           <button 
             onClick={toggleDemoMode}
             className="flex items-center justify-between px-4 py-2.5 w-full rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
             aria-label="Toggle Demo Mode"
           >
             <span className="text-xs font-medium flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-blue-400 animate-pulse' : 'bg-surface-600'}`}></span>
               Demo Mode
             </span>
             {demoMode ? <ToggleRight className="w-5 h-5 text-blue-400" /> : <ToggleLeft className="w-5 h-5" />}
           </button>

           <button
             onClick={() => setShowWelcomeModal(true)}
             className="flex items-center gap-2 px-4 py-2 w-full text-surface-400 hover:text-white transition-colors text-xs font-medium"
           >
             <Info className="w-4 h-4 text-amber-500" />
             <span>Re-open Welcome Screen</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 bg-surface-50 dark:bg-surface-950">
        <CrashTopBanner />

        {/* Header */}
        <Header 
          onOpenSidebar={() => setSidebarOpen(true)} 
          onOpenAuthModal={() => setAuthModalOpen(true)} 
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
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}


