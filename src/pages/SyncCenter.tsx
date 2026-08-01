import React from "react";
import { 
  Wifi, WifiOff, RefreshCw, Trash2, ShieldAlert, CheckCircle2, 
  AlertTriangle, Clock, ArrowUpRight, Database, FileText, Activity, Heart,
  Smartphone, BookOpen, User, PhoneCall, Award
} from "lucide-react";
import { useOfflineSync } from "../context/OfflineSyncContext";
import { OFFLINE_AI_GUIDES } from "../lib/offlineStore";

export function SyncCenter() {
  const { 
    isOnline, 
    pendingCount, 
    syncQueue, 
    isSyncing, 
    lastSyncedTime, 
    triggerSync, 
    cancelSyncItem 
  } = useOfflineSync();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
        isOnline 
          ? "bg-gradient-to-r from-emerald-950 via-surface-900 to-emerald-900 border-emerald-500/30 text-white" 
          : "bg-gradient-to-r from-red-950 via-surface-900 to-amber-950 border-red-500/30 text-white"
      }`}>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                isOnline ? "bg-emerald-500 text-black" : "bg-red-500 text-white animate-pulse"
              }`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {isOnline ? "🟢 ONLINE MODE" : "🔴 OFFLINE MODE ACTIVE"}
              </span>
              <span className="text-xs text-surface-400 font-semibold">
                {lastSyncedTime ? `Last Synced: ${new Date(lastSyncedTime).toLocaleTimeString()}` : "Never synced in this session"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">GoldenGuard Sync Center</h1>
            <p className="text-xs sm:text-sm text-surface-300 max-w-xl">
              {isOnline 
                ? "Your app is connected. All emergency SOS alerts, hazard reports, and ride telemetry will sync automatically to Firestore."
                : "Internet is currently unavailable. All emergency actions are securely queued in IndexedDB and will transmit immediately upon reconnection."}
            </p>
          </div>

          <button
            onClick={() => triggerSync()}
            disabled={isSyncing || !isOnline}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-surface-800 disabled:text-surface-500 text-black font-black text-xs flex items-center gap-2 shadow-xl transition-all active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-amber-500" : ""}`} />
            <span>{isSyncing ? "Syncing..." : isOnline ? "Sync Now" : "Waiting for Network"}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">{pendingCount}</div>
            <div className="text-xs text-surface-500 font-bold">Pending Offline Uploads</div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">{isOnline ? "Active" : "IndexedDB"}</div>
            <div className="text-xs text-surface-500 font-bold">Local Queue Status</div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">{OFFLINE_AI_GUIDES.length}</div>
            <div className="text-xs text-surface-500 font-bold">Offline AI Medical Guides Ready</div>
          </div>
        </div>
      </div>

      {/* Sync Queue List */}
      <div className="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-surface-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Pending Offline Queue</span>
          </h2>
          {pendingCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black">
              {pendingCount} Items Queued
            </span>
          )}
        </div>

        {syncQueue.length === 0 ? (
          <div className="p-8 text-center bg-surface-50 dark:bg-surface-900/40 rounded-2xl border border-dashed border-surface-200 dark:border-surface-700 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-black text-surface-900 dark:text-white">All Data Synced & Up to Date</h3>
            <p className="text-xs text-surface-500 max-w-sm mx-auto">
              There are no pending offline items. Emergency SOS triggers and hazard reports will automatically add to this queue if internet drops.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {syncQueue.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    item.type === "sos" ? "bg-red-500/10 text-red-500" :
                    item.type === "hazard" ? "bg-amber-500/10 text-amber-500" :
                    item.type === "community" ? "bg-indigo-500/10 text-indigo-500" :
                    "bg-blue-500/10 text-blue-500"
                  }`}>
                    {item.type === "sos" ? <ShieldAlert className="w-5 h-5" /> :
                     item.type === "hazard" ? <AlertTriangle className="w-5 h-5" /> :
                     item.type === "community" ? <FileText className="w-5 h-5" /> :
                     <Activity className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-surface-900 dark:text-white capitalize">
                        {item.type.toUpperCase()} Record
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === "syncing" ? "bg-blue-500/10 text-blue-500 animate-pulse" :
                        item.status === "failed" ? "bg-red-500/10 text-red-500" :
                        "bg-amber-500/10 text-amber-500"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-surface-500 font-medium">
                      Queued: {new Date(item.createdAt).toLocaleTimeString()} • {item.data?.location || item.data?.type || "Emergency Event"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => cancelSyncItem(item.id)}
                    className="p-2 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Cancel & Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offline Capabilities Guide */}
      <div className="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-surface-900 dark:text-white">Offline Emergency Toolkit</h2>
          <p className="text-xs text-surface-500">The following features remain 100% operational without cellular data or Wi-Fi connection.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-surface-900 dark:text-white">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>1. Offline SOS Trigger</span>
            </div>
            <p className="text-[11px] text-surface-500">Captures GPS coordinates & photos locally and queues for instant broadcast upon network reconnect.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-surface-900 dark:text-white">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>2. AI CPR & First Aid Manual</span>
            </div>
            <p className="text-[11px] text-surface-500">Step-by-step CPR, severe bleeding, burn, and choking procedures saved in offline IndexedDB cache.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-surface-900 dark:text-white">
              <PhoneCall className="w-4 h-4 text-amber-500" />
              <span>3. Direct Emergency Dialing</span>
            </div>
            <p className="text-[11px] text-surface-500">One-touch direct phone dialer for 112 (National Emergency), 108 (Ambulance), and 100 (Police).</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-surface-900 dark:text-white">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>4. Good Samaritan Law Reference</span>
            </div>
            <p className="text-[11px] text-surface-500">Legal protection clause reference (Ministry of Road Transport & Highways) cached locally for responders.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-surface-900 dark:text-white">
              <User className="w-4 h-4 text-blue-500" />
              <span>5. User Profile & Certificates</span>
            </div>
            <p className="text-[11px] text-surface-500">Medical emergency contacts, blood group, avatar, and first aid training badges persist offline.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-surface-900 dark:text-white">
              <Smartphone className="w-4 h-4 text-purple-500" />
              <span>6. Offline SafeRide Telemetry</span>
            </div>
            <p className="text-[11px] text-surface-500">Speed and impact sensor monitoring continues offline and syncs ride logs later.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
