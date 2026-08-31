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
import { useOfflineSync } from "../../context/OfflineSyncContext";
import { AuthModal } from "../auth/AuthModal";
import { cn } from "../../lib/utils";
import { Logo } from "../ui/Logo";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { CrashTopBanner } from "../crash/CrashTopBanner";
import { CrashDetectionModal } from "../crash/CrashDetectionModal";
import { useAuth } from "../../context/AuthContext";
import { RoadSafetyBackground } from "../RoadSafetyBackground";
import { CompleteProfile } from "../auth/CompleteProfile";
import { PWAInstallButton } from "../pwa/PWAInstallButton";

type NavItem = {
  name: string;
  to: string;
  icon: LucideIcon;
  alert?: boolean;
  adminOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const CITIZEN_HOME_GROUP: NavGroup = {
  title: "HOME",
  items: [
    { name: "Dashboard", to: "/", icon: LayoutDashboard },
    { name: "Emergency Help", to: "/sos", icon: ShieldAlert, alert: true },
    { name: "Report a Road Problem", to: "/report", icon: AlertTriangle },
    { name: "Find Help", to: "/map", icon: MapIcon },
    { name: "Safety & First Aid", to: "/first-aid", icon: Stethoscope },
    { name: "My Activity", to: "/profile", icon: Users },
  ]
};

const CITIZEN_ACCOUNT_GROUP: NavGroup = {
  title: "ACCOUNT",
  items: [
    { name: "My Profile", to: "/profile", icon: User },
    { name: "Emergency Contacts", to: "/profile?tab=contacts", icon: ShieldAlert },
    { name: "Settings & Offline", to: "/sync", icon: Wifi },
  ]
};

const ADMIN_MANAGEMENT_GROUP: NavGroup = {
  title: "MANAGEMENT (ADMIN)",
  items: [
    { name: "Emergency Control Center", to: "/admin", icon: ShieldIcon, adminOnly: true },
    { name: "Trainer Portal", to: "/trainer", icon: Award },
    { name: "Impact Analytics", to: "/impact", icon: TrendingUp },
  ]
};

const TRAINER_MANAGEMENT_GROUP: NavGroup = {
  title: "MANAGEMENT (TRAINER)",
  items: [
    { name: "Trainer Dashboard", to: "/trainer", icon: Award },
    { name: "Lifesaver Training", to: "/training", icon: BookOpen },
  ]
};

export function Layout() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  
  const { isOnline, pendingCount } = useOfflineSync();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  const role = userProfile?.role || "user";

  const navGroups: NavGroup[] = [
    CITIZEN_HOME_GROUP,
    CITIZEN_ACCOUNT_GROUP,
  ];

  if (isAdmin || role === "admin") {
    navGroups.push(ADMIN_MANAGEMENT_GROUP);
  } else if (role === "trainer") {
    navGroups.push(TRAINER_MANAGEMENT_GROUP);
  }

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

  // Listen to global open-auth-modal triggers (e.g. from ProtectedRoute)
  useEffect(() => {
    const handleOpenAuth = () => {
      setAuthModalOpen(true);
    };
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  // Dispatch a window resize event to trigger Leaflet map invalidateSize or other redraws
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-[100dvh] w-full bg-transparent overflow-hidden font-sans relative">
      {/* Full-screen Fixed Animated Road Safety Background */}
      <RoadSafetyBackground />

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
          "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[290px] flex flex-col bg-white dark:bg-surface-950 text-surface-900 dark:text-white shadow-2xl border-r border-surface-200 dark:border-surface-800/80 transition-transform duration-300 ease-in-out h-[100dvh] max-h-[100dvh] overflow-hidden shrink-0 pt-[env(safe-area-inset-top)]",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header (Fixed/pinned at the top) */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-surface-200 dark:border-surface-800/80 bg-surface-50 dark:bg-surface-900/50 shrink-0">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <Logo size="md" variant="auto" />
          </Link>
          <button
            className="p-2 rounded-xl text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Navigation Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu Area (Independent scrolling) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="px-3 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-500/90 select-none">
                {group.title}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3.5 min-h-[44px] py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 group select-none outline-none",
                      isActive
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border-l-4 border-amber-500 shadow-xs"
                        : "text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/80"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          "w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 shrink-0",
                          isActive ? "text-amber-600 dark:text-amber-400" : "text-surface-500 dark:text-surface-400 group-hover:text-amber-600 dark:group-hover:text-amber-400"
                        )}
                      />
                      <span className={cn("flex-1 text-left leading-snug whitespace-normal py-0.5", item.alert && "text-red-600 dark:text-red-400 font-bold")}>
                        {item.name}
                      </span>
                      {item.alert && (
                        <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-600 dark:text-red-400 text-[9px] font-black uppercase border border-red-500/30 animate-pulse shrink-0">
                          SOS
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar Footer (Fixed/pinned at the bottom) */}
        <div 
          className="p-4 border-t border-surface-200 dark:border-surface-800/80 bg-surface-50 dark:bg-surface-900/60 space-y-3 shrink-0"
          style={{ 
            paddingBottom: "calc(max(16px, env(safe-area-inset-bottom)) + 12px)" 
          }}
        >
          {/* PWA App Install Action */}
          <PWAInstallButton variant="sidebar" />

          {/* User Profile Card or Login */}
          {currentUser ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/50 min-h-[56px]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-black font-black text-xs flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-amber-400/50">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    userProfile?.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-surface-900 dark:text-white truncate">
                    {userProfile?.name || currentUser.displayName || "GoldenGuard User"}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                    {userProfile?.role || "Verified Samaritan"}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setSidebarOpen(false);
                  await logout();
                }}
                className="p-2 text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-surface-200 dark:hover:bg-surface-700/50 rounded-lg transition-colors ml-2 shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
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
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 bg-transparent h-full overflow-hidden relative z-10">
        <CrashTopBanner />
        <CrashDetectionModal />

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
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col custom-scrollbar min-w-0 break-words">
          <div className="flex-1 p-3 min-[360px]:p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 w-full max-w-full min-w-0">
            {currentUser && userProfile?.isProfileComplete === false && !reminderDismissed && !isAdmin && (
              <div className="mb-6 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Complete your profile</h4>
                    <p className="text-xs opacity-90">Please update your medical profile and emergency contacts to improve emergency response capabilities.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/profile"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    Complete Profile
                  </Link>
                  <button
                    onClick={() => setReminderDismissed(true)}
                    className="px-3 py-2 bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    Remind Me Later
                  </button>
                </div>
              </div>
            )}
            <Outlet context={{}} />
          </div>
          <Footer />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-t border-surface-200/90 dark:border-surface-800/90 pb-[env(safe-area-inset-bottom)] shadow-lg transition-colors">
        <div className="flex items-center justify-around px-2 py-1.5">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[44px] gap-0.5 rounded-xl transition-all",
                isActive
                  ? "text-amber-500 dark:text-amber-400 font-bold"
                  : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
              )
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-semibold truncate text-center">Dashboard</span>
          </NavLink>

          <NavLink
            to="/sos"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[44px] gap-0.5 rounded-xl transition-all",
                isActive
                  ? "text-red-600 dark:text-red-400 font-bold"
                  : "text-red-500 hover:text-red-600 dark:hover:text-red-400"
              )
            }
          >
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-tight text-center text-red-600 dark:text-red-400">SOS</span>
          </NavLink>

          <NavLink
            to="/report"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[44px] gap-0.5 rounded-xl transition-all",
                isActive
                  ? "text-amber-500 dark:text-amber-400 font-bold"
                  : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
              )
            }
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px] font-semibold truncate text-center">Report</span>
          </NavLink>

          <NavLink
            to="/map"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[44px] gap-0.5 rounded-xl transition-all",
                isActive
                  ? "text-amber-500 dark:text-amber-400 font-bold"
                  : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
              )
            }
          >
            <MapIcon className="w-5 h-5" />
            <span className="text-[10px] font-semibold truncate text-center">Find Help</span>
          </NavLink>

          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center min-w-[52px] min-h-[44px] gap-0.5 rounded-xl text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}


