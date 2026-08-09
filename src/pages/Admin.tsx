import React, { useState } from "react";
import { 
  ShieldAlert, LayoutDashboard, Map as MapIcon, Users, 
  Activity, Bell, BarChart3, Settings, LogOut, Lock, AlertTriangle, AlertCircle
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFriendlyAuthErrorMessage } from "../lib/authUtils";
import { AdminDashboardTab } from "../components/admin/AdminDashboardTab";
import { AdminMapTab } from "../components/admin/AdminMapTab";
import { AdminEmergenciesTab } from "../components/admin/AdminEmergenciesTab";
import { AdminVolunteersTab } from "../components/admin/AdminVolunteersTab";
import { AdminUsersTab } from "../components/admin/AdminUsersTab";
import { AdminHazardsTab } from "../components/admin/AdminHazardsTab";
import { AdminNotificationsTab } from "../components/admin/AdminNotificationsTab";
import { AdminAnalyticsTab } from "../components/admin/AdminAnalyticsTab";
import { AdminSettingsTab } from "../components/admin/AdminSettingsTab";

type AdminTab = 
  | "dashboard" | "map" | "emergencies" | "volunteers" 
  | "users" | "hazards" | "notifications" | "analytics" | "settings";

export function Admin() {
  const { demoMode } = useOutletContext<{ demoMode: boolean }>();
  const { currentUser, userProfile, isAdmin, loginWithGoogle, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoadingGoogle(false);
    }
  };

  if (loading && !demoMode) {
    return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-surface-200 dark:border-surface-700 border-t-primary-500 rounded-full animate-spin"></div></div>;
  }

  // Strict Admin Check: Google Login or DB-based role is required (unless demoMode)
  const isAuthorizedAdmin = demoMode || isAdmin;

  if (!isAuthorizedAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] animate-in fade-in duration-500">
        <div className="bg-white dark:bg-surface-800 p-8 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-2xl text-center max-w-md w-full space-y-5">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-surface-900 dark:text-white">Admin Access Restricted</h1>
            <p className="text-xs text-surface-500 leading-relaxed">
              GoldenGuard Command Center requires an authorized administrator account.
            </p>
          </div>
          
          {currentUser ? (
            <div className="space-y-3 pt-2">
              <div className="bg-surface-100 dark:bg-surface-700/50 p-3.5 rounded-2xl text-xs space-y-1 text-left border border-surface-200 dark:border-surface-700">
                <div className="font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Account: {currentUser.email}
                </div>
                <div className="text-[11px] text-surface-500">
                  Provider: <span className="font-semibold text-amber-600 capitalize">{userProfile?.provider || "password"}</span>
                </div>
                {!isAdmin && (
                  <div className="pt-2 text-red-500 font-bold text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> This account is not granted Admin privileges.
                  </div>
                )}
              </div>

              <button 
                onClick={logout}
                className="w-full py-3 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-900 dark:text-white rounded-2xl font-bold text-xs transition-colors shadow-sm"
              >
                Sign Out & Switch Account
              </button>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 text-left animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                onClick={handleGoogleLogin}
                disabled={loadingGoogle}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                </svg>
                {loadingGoogle ? "Processing..." : "Sign in with Authorized Google Account"}
              </button>
            </div>
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
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)] bg-surface-50 dark:bg-surface-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 animate-in fade-in duration-500 gap-6">
      
      {/* Mobile/Tablet Horizontal Tabs */}
      <div className="lg:hidden bg-white dark:bg-surface-800 p-3 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-x-auto flex items-center gap-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-amber-500 text-black shadow-md"
                : "text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-sm flex-col overflow-hidden shrink-0">
        <div className="p-6 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
          <h2 className="font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-primary-600" />
            Command Center
          </h2>
          <div className="text-xs text-surface-500 mt-1 truncate">{demoMode ? "demo@goldenguard.ai" : currentUser?.email}</div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-bold"
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
            onClick={demoMode ? () => {} : logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden flex flex-col relative hover:shadow-md transition-shadow min-w-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-amber-500 z-10"></div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
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
