import React, { useState, useEffect } from "react";
import { Users, Heart, Building2, Shield, AlertTriangle, AlertCircle, Clock, CheckCircle2, UserPlus, Radio, Activity } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, where, orderBy, limit } from "firebase/firestore";

interface RealMetrics {
  registeredCitizens: number;
  verifiedVolunteers: number;
  pendingApplications: number;
  activeEmergencies: number;
  availableHospitals: number;
  policeStations: number;
  openRoadReports: number;
  resolvedEmergencies: number;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: "user" | "volunteer" | "hospital" | "police" | "sos" | "hazard";
}

export function AdminDashboardTab() {
  const [metrics, setMetrics] = useState<RealMetrics>({
    registeredCitizens: 0,
    verifiedVolunteers: 0,
    pendingApplications: 0,
    activeEmergencies: 0,
    availableHospitals: 0,
    policeStations: 0,
    openRoadReports: 0,
    resolvedEmergencies: 0
  });

  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Real-time Users query listener (bounded to 150 items)
    const usersUnsub = onSnapshot(query(collection(db, "users"), limit(150)), (snapshot) => {
      let citizens = 0;
      let verifiedVols = 0;
      let pendingApps = 0;
      let hospitals = 0;
      let police = 0;

      const userActivities: ActivityItem[] = [];

      snapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        const role = d.role || "user";
        const vStatus = d.verificationStatus || "PENDING";
        const appRole = d.appliedRole;

        if (role === "user") citizens++;
        if (role === "volunteer" && (vStatus === "VERIFIED" || d.approvalStatus === "Approved")) verifiedVols++;
        if (role === "hospital" && (vStatus === "VERIFIED" || d.approvalStatus === "Approved")) hospitals++;
        if (role === "police" && (vStatus === "VERIFIED" || d.approvalStatus === "Approved")) police++;

        if (vStatus === "PENDING" || (appRole && vStatus !== "VERIFIED" && vStatus !== "REJECTED")) {
          pendingApps++;
        }

        // Build activity entry for recent users
        if (d.createdAt) {
          let timeStr = "Recently";
          if (d.createdAt?.seconds) {
            timeStr = new Date(d.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          let actType: ActivityItem["type"] = "user";
          let title = `New Citizen Registered: ${d.name || "Anonymous"}`;
          let subtitle = `Role: ${role.toUpperCase()}`;

          if (appRole === "volunteer" || role === "volunteer") {
            actType = "volunteer";
            title = `Volunteer Application: ${d.name || "Applicant"}`;
            subtitle = `Status: ${vStatus}`;
          } else if (appRole === "hospital" || role === "hospital") {
            actType = "hospital";
            title = `Hospital Verification Request: ${d.hospitalName || d.name || "Medical Center"}`;
            subtitle = `Status: ${vStatus}`;
          } else if (appRole === "police" || role === "police") {
            actType = "police";
            title = `Police Station Request: ${d.stationName || d.name || "Police Unit"}`;
            subtitle = `Status: ${vStatus}`;
          }

          userActivities.push({
            id: docSnap.id,
            title,
            subtitle,
            time: timeStr,
            type: actType
          });
        }
      });

      setMetrics((prev) => ({
        ...prev,
        registeredCitizens: citizens,
        verifiedVolunteers: verifiedVols,
        pendingApplications: pendingApps,
        availableHospitals: hospitals,
        policeStations: police
      }));

      setIsLoading(false);
    }, (err) => console.warn("Admin Dashboard users sync:", err));

    // 2. Real-time sosRequests query listener (bounded)
    const sosUnsub = onSnapshot(query(collection(db, "sosRequests"), limit(100)), (snapshot) => {
      let active = 0;
      let resolved = 0;

      snapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        const st = (d.status || "CREATED").toUpperCase();
        if (["CREATED", "TRIAGING", "DISPATCHING", "ASSIGNED", "RESPONDER_EN_ROUTE", "ARRIVED"].includes(st)) {
          active++;
        } else if (["RESOLVED", "CANCELLED"].includes(st)) {
          resolved++;
        }
      });

      setMetrics((prev) => ({
        ...prev,
        activeEmergencies: active,
        resolvedEmergencies: resolved
      }));
    }, (err) => console.warn("Admin Dashboard SOS sync:", err));

    // 3. Real-time Hazards query listener (bounded)
    const hazardsUnsub = onSnapshot(query(collection(db, "hazards"), limit(100)), (snapshot) => {
      let openReports = 0;

      snapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        const st = (d.status || "pending").toLowerCase();
        if (st === "pending" || st === "active" || st === "open") {
          openReports++;
        }
      });

      setMetrics((prev) => ({
        ...prev,
        openRoadReports: openReports
      }));
    }, (err) => console.warn("Admin Dashboard hazards sync:", err));

    return () => {
      usersUnsub();
      sosUnsub();
      hazardsUnsub();
    };
  }, []);

  const statsList = [
    { label: "Registered Citizens", value: metrics.registeredCitizens, icon: Users, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Verified Volunteers", value: metrics.verifiedVolunteers, icon: Heart, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { label: "Pending Applications", value: metrics.pendingApplications, icon: Clock, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", alert: metrics.pendingApplications > 0 },
    { label: "Active Emergencies", value: metrics.activeEmergencies, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", alert: metrics.activeEmergencies > 0 },
    { label: "Available Hospitals", value: metrics.availableHospitals, icon: Building2, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
    { label: "Police Stations", value: metrics.policeStations, icon: Shield, color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-900/30" },
    { label: "Open Road Reports", value: metrics.openRoadReports, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { label: "Resolved Emergencies", value: metrics.resolvedEmergencies, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">System Overview</h2>
          <p className="text-xs text-surface-500">Live command center metrics computed strictly from Firestore database queries.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-surface-600 dark:text-surface-400">Database Synced</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsList.map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-surface-800 p-5 rounded-2xl border ${stat.alert ? 'border-red-300 dark:border-red-900/60 shadow-md shadow-red-500/10' : 'border-surface-200 dark:border-surface-700 shadow-sm'} flex items-start gap-4`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-surface-500 dark:text-surface-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-surface-900 dark:text-white">{isLoading ? "..." : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-700 pb-3">
            <h3 className="font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Live Operational State
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">Real-Time</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-700/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-surface-900 dark:text-white">Active Emergency Dispatches</div>
                <div className="text-[11px] text-surface-500">In-progress Golden Hour SOS signals</div>
              </div>
              <span className={`text-base font-black px-3 py-1 rounded-lg ${metrics.activeEmergencies > 0 ? "bg-red-500/20 text-red-500" : "bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300"}`}>
                {metrics.activeEmergencies}
              </span>
            </div>

            <div className="p-3.5 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-700/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-surface-900 dark:text-white">Pending Role Verification Requests</div>
                <div className="text-[11px] text-surface-500">Volunteers, Hospitals & Police stations pending review</div>
              </div>
              <span className={`text-base font-black px-3 py-1 rounded-lg ${metrics.pendingApplications > 0 ? "bg-amber-500/20 text-amber-500" : "bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300"}`}>
                {metrics.pendingApplications}
              </span>
            </div>

            <div className="p-3.5 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-700/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-surface-900 dark:text-white">Open Road Hazard Reports</div>
                <div className="text-[11px] text-surface-500">Crowdsourced blackspots and road issues</div>
              </div>
              <span className="text-base font-black px-3 py-1 rounded-lg bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-200">
                {metrics.openRoadReports}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-700 pb-3">
            <h3 className="font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Verified Infrastructure
            </h3>
            <span className="text-xs font-bold text-surface-500">Command Center Authority</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700/50">
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-surface-900 dark:text-white">Verified Volunteers</span>
              </div>
              <span className="text-sm font-black text-emerald-500">{metrics.verifiedVolunteers}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700/50">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-surface-900 dark:text-white">Verified Medical Facilities</span>
              </div>
              <span className="text-sm font-black text-indigo-500">{metrics.availableHospitals}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700/50">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-bold text-surface-900 dark:text-white">Verified Police Units</span>
              </div>
              <span className="text-sm font-black text-violet-500">{metrics.policeStations}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

