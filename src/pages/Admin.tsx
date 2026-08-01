import React, { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { 
  ShieldAlert, LayoutDashboard, Map as MapIcon, Users, 
  Activity, Bell, BarChart3, Settings, LogOut, FileText
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { AdminDashboardTab } from "../components/admin/AdminDashboardTab";
import { AdminMapTab } from "../components/admin/AdminMapTab";
import { AdminEmergenciesTab } from "../components/admin/AdminEmergenciesTab";
import { AdminVolunteersTab } from "../components/admin/AdminVolunteersTab";
import { AdminUsersTab } from "../components/admin/AdminUsersTab";
import { AdminHazardsTab } from "../components/admin/AdminHazardsTab";
import { AdminNotificationsTab } from "../components/admin/AdminNotificationsTab";
import { AdminAnalyticsTab } from "../components/admin/AdminAnalyticsTab";
import { AdminSettingsTab } from "../components/admin/AdminSettingsTab";

const ADMIN_EMAIL = "nitesh933438@gmail.com";

type AdminTab = 
  | "dashboard" | "map" | "emergencies" | "volunteers" 
  | "users" | "hazards" | "notifications" | "analytics" | "settings";

export function Admin() {
  const { demoMode } = useOutletContext<{ demoMode: boolean }>();
  const [user, setUser] = useState(auth.currentUser);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading && !demoMode) {
    return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-surface-200 dark:border-surface-700 border-t-primary-500 rounded-full animate-spin"></div></div>;
  }

  // Bypass email check if demoMode is active to allow judges to view the Admin UI
  if (!demoMode && (!user || user.email !== ADMIN_EMAIL)) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] animate-in fade-in duration-500">
        <div className="bg-white dark:bg-surface-800 p-8 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Admin Access Restricted</h1>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            You must be signed in as the authorized administrator to access the Command Center.
          </p>
          
          {user ? (
            <div className="space-y-4">
              <div className="bg-surface-100 dark:bg-surface-700 p-3 rounded-lg text-sm break-all">
                Signed in as: <strong>{user.email}</strong>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 rounded-xl font-bold transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors shadow-md"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "map", label: "Live Map", icon: MapIcon },
    { id: "emergencies", label: "Emergencies", icon: Activity },
    { id: "hazards", label: "Hazards", icon: ShieldAlert },
    { id: "volunteers", label: "Volunteers", icon: Users },
    { id: "users", label: "Users", icon: Users },
    { id: "notifications", label: "Broadcast", icon: Bell },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-surface-50 dark:bg-surface-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 animate-in fade-in duration-500">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col overflow-hidden shrink-0 mr-6">
        <div className="p-6 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
          <h2 className="font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-primary-600" />
            Command Center
          </h2>
          <div className="text-xs text-surface-500 mt-1 truncate">{demoMode ? "demo@goldenguard.ai" : user?.email}</div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700/50"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-surface-200 dark:border-surface-700">
          <button 
            onClick={demoMode ? () => {} : handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden flex flex-col relative hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-amber-500 z-10"></div>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
          {activeTab === "dashboard" && <AdminDashboardTab />}
          {activeTab === "map" && <AdminMapTab />}
          {activeTab === "emergencies" && <AdminEmergenciesTab />}
          {activeTab === "hazards" && <AdminHazardsTab />}
          {activeTab === "volunteers" && <AdminVolunteersTab />}
          {activeTab === "users" && <AdminUsersTab />}
          {activeTab === "notifications" && <AdminNotificationsTab />}
          {activeTab === "analytics" && <AdminAnalyticsTab />}
          {activeTab === "settings" && <AdminSettingsTab />}
        </div>
      </div>
    </div>
  );
}
