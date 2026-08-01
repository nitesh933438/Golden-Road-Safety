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
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Info,
  UserCheck,
  Play,
  User
} from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";
import { useDemo } from "../../context/DemoContext";
import { cn } from "../../lib/utils";
import { Footer } from "./Footer";
import { WelcomeModal } from "../demo/WelcomeModal";
import { GuidedDemoTour } from "../demo/GuidedDemoTour";

const NAV_ITEMS = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "SOS (Golden Hour)", to: "/sos", icon: ShieldAlert, alert: true },
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
  { name: "Admin Center", to: "/admin", icon: ShieldAlert },
];

export function Layout() {
  const { theme, setTheme } = useTheme();
  const { demoMode, toggleDemoMode, startTour, setShowWelcomeModal } = useDemo();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-screen w-full bg-surface-50 dark:bg-surface-950 overflow-hidden font-sans">
      <WelcomeModal />
      <GuidedDemoTour />

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
        <div className="flex h-16 items-center px-6">
          <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20">
              G
            </div>
            <span className="text-lg font-bold tracking-tight text-white">GoldenGuard</span>
          </Link>
          <button
            className="ml-auto lg:hidden text-surface-500 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guided Tour Launcher Card */}
        <div className="mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-red-600/30 via-amber-600/30 to-amber-500/20 border border-amber-500/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Hackathon Mode</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-xs text-surface-200 mb-2 font-medium leading-tight">Interactive 6-Step Guided Live Demo</p>
          <button
            onClick={() => {
              setSidebarOpen(false);
              startTour();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Live Demo</span>
          </button>
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
        {/* Header */}
        <header className="flex items-center h-16 px-4 sm:px-8 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 sticky top-0 z-30">
          <button
            className="p-2 mr-4 -ml-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden focus:ring-2 focus:ring-primary-500 outline-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative group w-80 hidden sm:block">
            <input
              type="text"
              placeholder="Search GoldenGuard operations..."
              className="w-full bg-surface-100 dark:bg-surface-800 border-none rounded-full py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 opacity-40" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {demoMode ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs font-bold text-blue-700 dark:text-blue-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                DEMO MODE ACTIVE
              </div>
            ) : (
              <button
                onClick={toggleDemoMode}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-xs font-semibold text-surface-600 dark:text-surface-300 hover:text-white transition-colors"
              >
                <span>Enable Demo Mode</span>
              </button>
            )}

            <button
              onClick={startTour}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold shadow-md hover:scale-105 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Guided Tour</span>
            </button>
            
            <div className="flex items-center gap-3 text-surface-500">
              <Link to="/notifications" className="relative hover:text-surface-900 dark:hover:text-surface-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-surface-900"></span>
              </Link>
              
              <button
                onClick={toggleTheme}
                className="hover:text-surface-900 dark:hover:text-surface-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 text-white flex items-center justify-center font-bold text-xs shadow-md hover:scale-105 transition-transform" title="My Profile">
                 AR
              </Link>
            </div>
          </div>
        </header>

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

