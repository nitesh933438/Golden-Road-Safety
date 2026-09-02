import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Search as SearchIcon, Hospital, Shield, User, MapPin, 
  AlertTriangle, Loader2, ChevronLeft, ChevronRight, Eye, 
  Phone, Mail, ShieldAlert, BadgeInfo, EyeOff, BookOpen,
  FileText, ExternalLink, Compass, Heart
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";

interface SearchResult {
  id: string;
  category: "hospital" | "police" | "volunteer" | "user" | "incident" | "page" | "guide";
  title: string;
  subtitle: string;
  locationDetails?: string;
  phone?: string;
  email?: string;
  isVerified?: boolean;
  role?: string;
  status?: string;
  severity?: string;
  unconscious?: boolean;
  exactLocation?: string;
  linkUrl?: string;
  tags?: string[];
  raw?: any;
}

const STATIC_APP_CATALOG: SearchResult[] = [
  {
    id: "app-sos-dispatch",
    category: "page",
    title: "1-Tap Golden Hour Emergency SOS",
    subtitle: "Trigger immediate 1-Tap or Voice SOS dispatch to nearby hospitals, police, and verified Good Samaritans.",
    locationDetails: "Instant GPS Emergency Dispatch Hub",
    linkUrl: "/sos",
    tags: ["sos", "emergency", "dispatch", "1-tap", "voice", "help", "crash", "ambulance", "golden hour", "trauma"]
  },
  {
    id: "app-first-aid-cpr",
    category: "guide",
    title: "Cardiopulmonary Resuscitation (CPR) 30:2 Protocol",
    subtitle: "Step-by-step 30 chest compressions to 2 rescue breaths guide for cardiac arrest emergencies.",
    locationDetails: "Interactive First Aid & CPR Guide",
    linkUrl: "/first-aid",
    tags: ["cpr", "first aid", "cardiac", "heart attack", "resuscitation", "breathing", "chest compression", "aed"]
  },
  {
    id: "app-bleeding-control",
    category: "guide",
    title: "Severe Bleeding & Pressure Bandage Protocol",
    subtitle: "Emergency arterial pressure control, tourniquet application, and wound elevation techniques.",
    locationDetails: "Trauma Management Protocol",
    linkUrl: "/first-aid",
    tags: ["bleeding", "hemorrhage", "wound", "tourniquet", "pressure", "first aid", "trauma", "cut"]
  },
  {
    id: "app-report-hazard",
    category: "page",
    title: "Report Road Hazards & Traffic Accidents",
    subtitle: "Submit geotagged reports for road obstacles, oil spills, crash scenes, broken streetlights, or potholes.",
    locationDetails: "Community Incident & Road Hazard Reporter",
    linkUrl: "/report",
    tags: ["report", "road", "hazard", "pothole", "oil spill", "crash", "accident", "incident", "traffic", "obstacle"]
  },
  {
    id: "app-smart-map",
    category: "page",
    title: "Smart Safety Map & Nearby Help Finder",
    subtitle: "Explore live GPS locations of trauma centers, police booths, ambulance hubs, and active responders.",
    locationDetails: "Live Interactive GIS Safety Map",
    linkUrl: "/map",
    tags: ["map", "hospital", "police", "responder", "gps", "location", "find", "trauma center", "booth"]
  },
  {
    id: "app-medical-id",
    category: "page",
    title: "Emergency Medical Wallet & QR ID Card",
    subtitle: "Configure blood group, emergency contacts, allergies, organ donor status, and medical QR code.",
    locationDetails: "Personal Medical Wallet Profile",
    linkUrl: "/profile",
    tags: ["medical", "id", "profile", "contacts", "blood", "allergies", "donor", "qr", "wallet", "emergency contact"]
  },
  {
    id: "app-good-samaritan-training",
    category: "page",
    title: "Good Samaritan Legal Rights & Lifesaver Training",
    subtitle: "Section 134A legal protection details, certified responder modules, and CPR refresher courses.",
    locationDetails: "Lifesaver Training & Legal Protection Hub",
    linkUrl: "/training",
    tags: ["good samaritan", "legal", "law", "training", "certificate", "course", "cpr training", "volunteer"]
  },
  {
    id: "app-impact-analytics",
    category: "page",
    title: "Golden Hour Rescue Impact Analytics",
    subtitle: "View community rescue metrics, average dispatch response times, and volunteer leaderboard.",
    locationDetails: "System Impact & Analytics Hub",
    linkUrl: "/impact",
    tags: ["impact", "analytics", "stats", "metrics", "rescues", "leaderboard", "response time"]
  },
  {
    id: "app-offline-sync",
    category: "page",
    title: "Offline Emergency Sync & P2P Mesh Settings",
    subtitle: "Configure offline emergency guides, cached maps, and peer-to-peer mesh alert relay settings.",
    locationDetails: "Offline & Connectivity Control",
    linkUrl: "/sync",
    tags: ["offline", "sync", "mesh", "cache", "connectivity", "bluetooth", "p2p"]
  },
  {
    id: "app-heimlich-choking",
    category: "guide",
    title: "Choking & Heimlich Maneuver Action Plan",
    subtitle: "Abdominal thrust instructions for choking adults and back blows for infants.",
    locationDetails: "Emergency Airway Guide",
    linkUrl: "/first-aid",
    tags: ["choking", "heimlich", "airway", "infant", "suffocation", "throat", "first aid"]
  }
];

export function Search() {
  const { currentUser, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // UI state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "hospital" | "police" | "volunteer" | "user" | "incident" | "page" | "guide">("all");
  
  // Loading, success, error, pagination states
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // reset to page 1 on query change
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Sync URL search params
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
    } else {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  // Perform secure, real Firestore queries + static app knowledge search
  useEffect(() => {
    let active = true;
    
    // We only trigger searches when query is at least 2 chars to avoid excessive database reads
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const lowerQuery = debouncedQuery.toLowerCase().trim();
        const tempResults: SearchResult[] = [];
        const userRole = userProfile?.role || "user";

        // Query limits per search block to ensure "Do NOT read entire Firestore collections into the browser."
        const queryLimitVal = 40; 

        // ==========================================
        // 0. STATIC APP PAGES, GUIDES & REPORTS SEARCH
        // ==========================================
        if (selectedCategory === "all" || selectedCategory === "page" || selectedCategory === "guide") {
          STATIC_APP_CATALOG.forEach(item => {
            if (selectedCategory !== "all" && item.category !== selectedCategory) return;
            const matches = 
              item.title.toLowerCase().includes(lowerQuery) ||
              item.subtitle.toLowerCase().includes(lowerQuery) ||
              (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));

            if (matches && active) {
              tempResults.push(item);
            }
          });
        }

        // ==========================================
        // 1. HOSPITAL SEARCH
        // ==========================================
        if (selectedCategory === "all" || selectedCategory === "hospital") {
          const hospQuery = query(
            collection(db, "users"),
            where("role", "==", "hospital"),
            where("verificationStatus", "==", "VERIFIED"),
            limit(queryLimitVal)
          );
          const snapshot = await getDocs(hospQuery);
          
          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const name = data.name || data.stationName || "Verified Hospital";
            const city = data.city || "";
            const state = data.state || "";
            const address = data.address || "";
            const matches = name.toLowerCase().includes(lowerQuery) || 
                            city.toLowerCase().includes(lowerQuery) || 
                            state.toLowerCase().includes(lowerQuery) || 
                            address.toLowerCase().includes(lowerQuery);
            if (matches && active) {
              tempResults.push({
                id: docSnap.id,
                category: "hospital",
                title: name,
                subtitle: `${data.services || "Emergency & Trauma Care"}`,
                locationDetails: address || `${city}, ${state}`,
                phone: data.phone || data.officialContact || "108",
                email: data.email,
                isVerified: true,
                role: "hospital",
                exactLocation: data.location,
                raw: data
              });
            }
          });
        }

        // ==========================================
        // 2. POLICE SEARCH
        // ==========================================
        if (selectedCategory === "all" || selectedCategory === "police") {
          const policeQuery = query(
            collection(db, "users"),
            where("role", "==", "police"),
            where("verificationStatus", "==", "VERIFIED"),
            limit(queryLimitVal)
          );
          const snapshot = await getDocs(policeQuery);

          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const stationName = data.stationName || data.name || "Verified Police Station";
            const city = data.city || "";
            const state = data.state || "";
            const address = data.address || "";
            const matches = stationName.toLowerCase().includes(lowerQuery) || 
                            city.toLowerCase().includes(lowerQuery) || 
                            state.toLowerCase().includes(lowerQuery) || 
                            address.toLowerCase().includes(lowerQuery);
            if (matches && active) {
              tempResults.push({
                id: docSnap.id,
                category: "police",
                title: stationName,
                subtitle: `Service Area: ${data.serviceArea || "Local Jurisdiction"}`,
                locationDetails: address || `${city}, ${state}`,
                phone: data.phone || data.officialContact || "100",
                email: data.email,
                isVerified: true,
                role: "police",
                exactLocation: data.location,
                raw: data
              });
            }
          });
        }

        // ==========================================
        // 3. VOLUNTEER SEARCH
        // ==========================================
        if (selectedCategory === "all" || selectedCategory === "volunteer") {
          const volQuery = query(
            collection(db, "users"),
            where("role", "==", "volunteer"),
            limit(queryLimitVal)
          );
          const snapshot = await getDocs(volQuery);

          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            // FILTER ONLY VOLUNTEERS WHO HAVE OPTED INTO DISCOVERABILITY
            // isVolunteerActive (on duty) or explicitly isDiscoverable !== false
            const isDiscoverable = data.isVolunteerActive === true || data.isDiscoverable === true || (data.settings && data.settings.isDiscoverable !== false);
            if (!isDiscoverable) return;

            const name = data.name || "Volunteer Samaritan";
            const city = data.city || "";
            const state = data.state || "";
            const qualifications = data.qualifications || "";
            const matches = name.toLowerCase().includes(lowerQuery) || 
                            city.toLowerCase().includes(lowerQuery) || 
                            state.toLowerCase().includes(lowerQuery) || 
                            qualifications.toLowerCase().includes(lowerQuery);
            if (matches && active) {
              tempResults.push({
                id: docSnap.id,
                category: "volunteer",
                title: name,
                subtitle: qualifications ? `Qualifications: ${qualifications}` : "Certified Good Samaritan Responder",
                locationDetails: `${city}, ${state}`,
                phone: data.phone,
                email: data.email,
                isVerified: data.verificationStatus === "VERIFIED",
                role: "volunteer",
                exactLocation: data.location,
                raw: data
              });
            }
          });
        }

        // ==========================================
        // 4. INCIDENT SEARCH
        // ==========================================
        if (selectedCategory === "all" || selectedCategory === "incident") {
          const incidentQuery = query(
            collection(db, "emergencies"),
            limit(queryLimitVal)
          );
          const snapshot = await getDocs(incidentQuery);

          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const reportedById = data.userId || "";
            const assignedVolunteerId = data.volunteer || "";
            
            // AUTHORIZATION CHECK FOR INCIDENTS
            // Admin, police, and hospital roles can search all incidents
            // Volunteers can see incidents assigned to them
            // Normal citizens can only see incidents they reported
            const isAuthorized = 
              ["admin", "police", "hospital", "responder"].includes(userRole) || 
              (currentUser && currentUser.uid === reportedById) ||
              (currentUser && currentUser.uid === assignedVolunteerId);

            if (!isAuthorized) return;

            const type = data.type || "Automated SOS";
            const location = data.location || "";
            const address = data.address || "";
            const id = data.id || docSnap.id;
            
            const matches = type.toLowerCase().includes(lowerQuery) || 
                            location.toLowerCase().includes(lowerQuery) || 
                            address.toLowerCase().includes(lowerQuery) ||
                            id.toLowerCase().includes(lowerQuery);
            if (matches && active) {
              tempResults.push({
                id: docSnap.id,
                category: "incident",
                title: `🚨 Incident: ${type}`,
                subtitle: `Status: ${data.status || "Active"} | Severity: ${data.severity || "Unknown"}`,
                locationDetails: address || location || "No location coordinates provided",
                status: data.status,
                severity: data.severity,
                unconscious: data.unconscious,
                raw: data
              });
            }
          });
        }

        // ==========================================
        // 5. USER SEARCH
        // ==========================================
        if (selectedCategory === "all" || selectedCategory === "user") {
          const userQuery = query(
            collection(db, "users"),
            limit(queryLimitVal)
          );
          const snapshot = await getDocs(userQuery);

          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const name = data.name || "GoldenGuard User";
            const city = data.city || "";
            const state = data.state || "";
            const role = data.role || "user";

            // Only searchable public profile fields matches
            const matches = name.toLowerCase().includes(lowerQuery) || 
                            city.toLowerCase().includes(lowerQuery) || 
                            state.toLowerCase().includes(lowerQuery);

            if (matches && active) {
              tempResults.push({
                id: docSnap.id,
                category: "user",
                title: name,
                subtitle: `Role: ${role.toUpperCase()}`,
                locationDetails: city && state ? `${city}, ${state}` : "Location not specified",
                phone: data.phone,
                email: data.email,
                role: role,
                raw: data
              });
            }
          });
        }

        if (active) {
          setResults(tempResults);
        }
      } catch (err: any) {
        console.error("Firestore secure search failure:", err);
        if (active) {
          setError("An error occurred while scanning the database. Please verify authorization rules.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      active = false;
    };
  }, [debouncedQuery, selectedCategory, currentUser, userProfile]);

  // Authorized user view helper
  const canViewSensitiveData = (result: SearchResult) => {
    if (!currentUser) return false;
    // Admins can see everything
    if (userProfile?.role === "admin") return true;
    // You can see your own data
    if (currentUser.uid === result.id || (result.raw && result.raw.uid === currentUser.uid)) return true;
    // Authorized police/hospitals can see volunteer details/incident contacts during dispatch
    if (["police", "hospital"].includes(userProfile?.role || "") && ["volunteer", "incident"].includes(result.category)) return true;
    return false;
  };

  // Pagination slice
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" id="goldenguard-search-hub">
      {/* Search Header Banner */}
      <div className="text-center space-y-2.5">
        <h1 className="text-3xl md:text-4xl font-black text-surface-900 dark:text-white tracking-tight flex items-center justify-center gap-3">
          <SearchIcon className="w-8 h-8 text-amber-500 animate-pulse" />
          <span>Real-time Secure Search Hub</span>
        </h1>
        <p className="text-sm text-surface-500 max-w-xl mx-auto">
          Query authorized, verified real-time directories, responders, and incidents. All data is protected by active security layers.
        </p>
      </div>

      {/* Main Search Input & Controls */}
      <div className="bg-surface-50 dark:bg-surface-850 p-6 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-lg space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type verified name, station, location, credentials..."
            className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-750 shadow-inner rounded-2xl pl-12 pr-12 py-4 text-sm font-bold focus:border-amber-500 outline-none text-surface-900 dark:text-white"
          />
          <SearchIcon className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          {isLoading && (
            <div className="absolute right-4.5 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: "all", label: "All Records", icon: SearchIcon },
            { id: "page", label: "App Pages", icon: Compass },
            { id: "guide", label: "First Aid & Guides", icon: BookOpen },
            { id: "hospital", label: "Hospitals", icon: Hospital },
            { id: "police", label: "Police Stations", icon: Shield },
            { id: "volunteer", label: "Volunteers", icon: User },
            { id: "incident", label: "Incidents & Reports", icon: ShieldAlert },
            { id: "user", label: "Users Directory", icon: User },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-black border-amber-500 shadow-md scale-105"
                  : "bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      <div className="space-y-4">
        {isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-sm font-bold text-surface-500">Scanning real-time collections securely...</p>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-red-500 mx-auto animate-bounce" />
            <h3 className="font-bold text-red-500">Authorization Failure</h3>
            <p className="text-xs text-red-400 max-w-md mx-auto">{error}</p>
            <button 
              onClick={() => setSearchQuery(searchQuery)}
              className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-500"
            >
              Re-Authorize & Retry
            </button>
          </div>
        )}

        {!isLoading && debouncedQuery.trim().length >= 2 && results.length === 0 && !error && (
          <div className="p-12 text-center rounded-3xl border-2 border-dashed border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/10 space-y-2">
            <BadgeInfo className="w-10 h-10 text-surface-400 mx-auto" />
            <h3 className="font-bold text-surface-800 dark:text-surface-200 text-base">No authorized matching records found</h3>
            <p className="text-xs text-surface-500 max-w-sm mx-auto">
              We couldn't locate any matching verified entities or authorized events. Verify spelling or check your security permissions.
            </p>
          </div>
        )}

        {!isLoading && searchQuery.trim().length < 2 && (
          <div className="p-12 text-center rounded-3xl border border-surface-100 dark:border-surface-800 bg-surface-50/20 dark:bg-surface-900/5 space-y-2">
            <SearchIcon className="w-10 h-10 text-amber-500 mx-auto opacity-40" />
            <h3 className="font-bold text-surface-700 dark:text-surface-300 text-sm">Enter search term above</h3>
            <p className="text-xs text-surface-500 max-w-sm mx-auto">
              Provide a query (minimum 2 characters) to scan verified rescue nodes, emergency guides, road hazard reports, and hospitals.
            </p>
          </div>
        )}

        {/* Search Results Cards Grid */}
        {paginatedResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs px-2 text-surface-500">
              <span>Showing <b>{(currentPage - 1) * resultsPerPage + 1}-{Math.min(currentPage * resultsPerPage, results.length)}</b> of <b>{results.length}</b> matches</span>
              <span>Secure Session Verified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedResults.map((result) => {
                const isAuth = canViewSensitiveData(result);
                return (
                  <div 
                    key={`${result.category}-${result.id}`}
                    className="p-5 bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Badge / Category Header */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          result.category === "hospital" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          result.category === "police" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                          result.category === "volunteer" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                          result.category === "incident" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse" :
                          result.category === "page" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" :
                          result.category === "guide" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                          "bg-surface-500/10 text-surface-600 border border-surface-500/20"
                        }`}>
                          {result.category === "hospital" && <Hospital className="w-3 h-3" />}
                          {result.category === "police" && <Shield className="w-3 h-3" />}
                          {result.category === "volunteer" && <User className="w-3 h-3" />}
                          {result.category === "incident" && <ShieldAlert className="w-3 h-3" />}
                          {result.category === "page" && <Compass className="w-3 h-3" />}
                          {result.category === "guide" && <BookOpen className="w-3 h-3" />}
                          {result.category === "user" && <User className="w-3 h-3" />}
                          <span>{result.category}</span>
                        </span>

                        {result.isVerified && (
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </div>

                      {/* Info block */}
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-surface-900 dark:text-white line-clamp-1">{result.title}</h3>
                        <p className="text-xs text-surface-500 line-clamp-2">{result.subtitle}</p>
                      </div>

                      {result.locationDetails && (
                        <div className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-surface-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="line-clamp-1">{result.locationDetails}</span>
                        </div>
                      )}

                      {/* Direct Navigation Button for App Pages & First Aid Guides */}
                      {result.linkUrl && (
                        <div className="pt-2 border-t border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                          <Link
                            to={result.linkUrl}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition-colors shadow-xs"
                          >
                            <span>Open Feature / Guide</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* Contact Info (Authorized Check) for users/hospitals/police/incidents */}
                      {!result.linkUrl && (
                        <div className="pt-2 border-t border-surface-100 dark:border-surface-700/50 space-y-1.5">
                          {isAuth ? (
                            <div className="space-y-1 text-xs">
                              {result.phone && (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{result.phone}</span>
                                </div>
                              )}
                              {result.email && (
                                <div className="flex items-center gap-2 text-surface-500">
                                  <Mail className="w-3.5 h-3.5" />
                                  <span className="font-medium">{result.email}</span>
                                </div>
                              )}
                              {result.exactLocation && (
                                <div className="text-[10px] text-surface-400 font-mono">
                                  GPS Coordinates: {result.exactLocation}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/60 flex items-center gap-2 text-[10px] text-surface-400 border border-surface-100 dark:border-surface-800">
                              <EyeOff className="w-3.5 h-3.5 text-surface-400" />
                              <span>Contact detail / GPS access restricted. Authorized personnel only.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-between border-t border-surface-200 dark:border-surface-800 text-xs text-surface-500">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl font-bold flex items-center gap-1 hover:bg-surface-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl font-bold flex items-center gap-1 hover:bg-surface-100 disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
