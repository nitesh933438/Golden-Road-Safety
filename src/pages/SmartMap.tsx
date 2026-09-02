import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  MapContainer, TileLayer, Marker, Popup, Polyline, 
  Circle, LayersControl, ScaleControl, ZoomControl, useMapEvents
} from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { 
  ShieldAlert, Navigation, Info, X, MapPin, 
  PhoneCall, Search, Loader2, Users, Car,
  Sparkles, Stethoscope, RefreshCw, Radio, LocateFixed, Maximize,
  Compass, ZoomIn, ZoomOut, Target, HeartPulse, Shield, Filter, Plus,
  AlertTriangle, Flame, Building2, CheckCircle2, Phone, Award
} from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, getDocs, where, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useTheme } from "../components/theme/ThemeProvider";
import { useOutletContext } from "react-router-dom";
import { fetchWithRetry, RateLimitError } from "../lib/api";

const smartMapOverpassCache = new Map<string, any[]>();
const smartMapOSRMRouteCache = new Map<string, any>();

// --- Types ---
interface MapPlace {
  id: string;
  name: string;
  type: "hospital" | "police" | "volunteer" | "hazard" | "user" | "search" | "ambulance" | "fire" | "blood" | "pharmacy" | "emergency";
  lat: number;
  lng: number;
  vicinity?: string;
  phone?: string;
  rating?: number;
  isOpen?: boolean;
  bedsAvailable?: number;
  distanceKm?: number;
}

interface RouteData {
  coords: [number, number][];
  distanceKm: number;
  durationMins: number;
  destinationName: string;
  endLat: number;
  endLng: number;
}

// --- Constants ---
const DEFAULT_ZOOM = 13;

// --- Icon Generator ---
const iconCache: Record<string, L.DivIcon> = {};

const getCustomIcon = (type: MapPlace["type"]) => {
  if (iconCache[type]) return iconCache[type];

  if (type === "user") {
    iconCache[type] = L.divIcon({
      className: "custom-leaflet-user-marker",
      html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-14 h-14 bg-red-500/40 rounded-full animate-ping"></div>
          <div class="w-9 h-9 bg-red-600 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
    return iconCache[type];
  }

  let colorBg = "bg-amber-500 border-amber-200 shadow-amber-500/30";
  let iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`;

  if (type === "hospital") {
    colorBg = "bg-red-600 border-red-200 shadow-red-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
  } else if (type === "police") {
    colorBg = "bg-blue-600 border-blue-200 shadow-blue-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  } else if (type === "ambulance") {
    colorBg = "bg-orange-600 border-orange-200 shadow-orange-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
  } else if (type === "fire") {
    colorBg = "bg-red-700 border-red-300 shadow-red-600/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 4 6.5 1.5 1.5 2 3 2 4.5a6 6 0 11-12 0c0-1 .25-2 .75-3z"/></svg>`;
  } else if (type === "blood") {
    colorBg = "bg-pink-600 border-pink-200 shadow-pink-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`;
  } else if (type === "pharmacy") {
    colorBg = "bg-emerald-600 border-emerald-200 shadow-emerald-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M10.5 20H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v6"/><path d="M12 11h6"/><path d="M15 8v6"/><path d="M19 16l3 3-3 3"/><path d="M22 19h-6"/></svg>`;
  } else if (type === "hazard") {
    colorBg = "bg-amber-600 border-amber-200 shadow-amber-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else if (type === "volunteer") {
    colorBg = "bg-emerald-500 border-emerald-200 shadow-emerald-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M16 21v-2a4 4 0 00-4-4H5c-1.1 0-2 .9-2 2v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`;
  } else if (type === "search") {
    colorBg = "bg-indigo-600 border-indigo-200 shadow-indigo-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  } else if (type === "emergency") {
    colorBg = "bg-red-600 border-red-200 shadow-red-500/30 animate-pulse";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }

  iconCache[type] = L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="p-2.5 rounded-2xl border-2 shadow-xl flex items-center justify-center transition-transform hover:scale-125 ${colorBg}">
        ${iconSvg}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
  return iconCache[type];
};

// --- Initial Emergency Services Dataset ---
const INITIAL_PLACES: MapPlace[] = [];

export default function SmartMap() {
  const { theme } = useTheme();
  const context = useOutletContext<{ userRole?: string }>() || {};
  const userRole = context.userRole || "user"; // "admin", "trainer", "user", "responder"

  // Refs & Map Instance
  const [map, setMap] = useState<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // States
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [manualCityInput, setManualCityInput] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);
  const [addressStatus, setAddressStatus] = useState<string>("Locating GPS...");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<"granted" | "denied" | "prompt" | "timeout" | "unavailable" | "loading">("loading");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [places, setPlaces] = useState<MapPlace[]>(INITIAL_PLACES);
  const [firebaseHazards, setFirebaseHazards] = useState<MapPlace[]>([]);
  const [firebaseEntities, setFirebaseEntities] = useState<MapPlace[]>([]);
  const [firebaseEmergencies, setFirebaseEmergencies] = useState<MapPlace[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  
  const handleCategorySelect = async (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all" || catId === "hazard" || catId === "volunteer") return;
    
    const centerLat = userLocation?.lat;
    const centerLng = userLocation?.lng;
    if (!centerLat || !centerLng) return;

    const overpassMap: Record<string, string> = {
      hospital: '[amenity=hospital]',
      police: '[amenity=police]',
      fire: '[amenity=fire_station]',
      pharmacy: '[amenity=pharmacy]',
      blood: '[healthcare=blood_bank]',
      ambulance: '[emergency=ambulance_station]'
    };

    const tag = overpassMap[catId];
    if (!tag) return;

    const cacheKey = `${catId}-${centerLat.toFixed(2)},${centerLng.toFixed(2)}`;
    if (smartMapOverpassCache.has(cacheKey)) {
      const cachedElements = smartMapOverpassCache.get(cacheKey)!;
      const newPlaces: MapPlace[] = cachedElements.map((el: any) => {
        const pLat = el.lat || el.center?.lat;
        const pLon = el.lon || el.center?.lon;
        return {
          id: `osm-${el.id}`,
          name: el.tags?.name || `Unnamed ${catId}`,
          type: catId as any,
          lat: pLat,
          lng: pLon,
          vicinity: el.tags?.['addr:street'] || el.tags?.['addr:full'] || 'Unknown Address',
          isOpen: true
        };
      }).filter((p: any) => p.lat && p.lng);

      if (newPlaces.length > 0) {
        setPlaces(prev => {
          const filtered = prev.filter(p => !p.id.toString().startsWith("osm-") || p.type !== catId);
          return [...filtered, ...newPlaces];
        });
      }
      return;
    }

    setIsSearching(true);
    try {
      const query = `[out:json];(node${tag}(around:5000,${centerLat},${centerLng});way${tag}(around:5000,${centerLat},${centerLng}););out center 10;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const res = await fetchWithRetry(url, { maxRetries: 1 });
      const data = await res.json();

      if (data && data.elements) {
        smartMapOverpassCache.set(cacheKey, data.elements);

        const newPlaces: MapPlace[] = data.elements.map((el: any) => {
          const pLat = el.lat || el.center?.lat;
          const pLon = el.lon || el.center?.lon;
          return {
            id: `osm-${el.id}`,
            name: el.tags?.name || `Unnamed ${catId}`,
            type: catId as any,
            lat: pLat,
            lng: pLon,
            vicinity: el.tags?.['addr:street'] || el.tags?.['addr:full'] || 'Unknown Address',
            isOpen: true
          };
        }).filter((p: any) => p.lat && p.lng);

        if (newPlaces.length > 0) {
          setPlaces(prev => {
            const filtered = prev.filter(p => !p.id.toString().startsWith("osm-") || p.type !== catId);
            return [...filtered, ...newPlaces];
          });
        }
      }
    } catch (err: any) {
      console.warn("Overpass category search notice:", err?.message || err);
    } finally {
      setIsSearching(false);
    }
  };
  
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [travelMode, setTravelMode] = useState<"driving" | "bicycling" | "walking">("driving");
  
  const [isSOSMode, setIsSOSMode] = useState(false);
  const [showHazardDialog, setShowHazardDialog] = useState(false);
  const [reportType, setReportType] = useState<MapPlace["type"]>("hazard");
  const [reportDesc, setReportDesc] = useState("");
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);

  // Sync zoom state and handle resize invalidation for sidebar, theme, and window changes
  useEffect(() => {
    if (!map) return;
    const onZoom = () => setCurrentZoom(map.getZoom());
    map.on('zoomend', onZoom);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      map.off('zoomend', onZoom);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map, theme]);

  // Request Real GPS Location via Browser Geolocation API
  const requestLocation = useCallback(() => {
    setPermissionState("loading");
    setAddressStatus("Detecting real GPS location...");
    setGeoError(null);

    if (!navigator.geolocation) {
      setPermissionState("unavailable");
      setAddressStatus("Geolocation not supported");
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setZoomLevel(15);
        setAddressStatus("Live GPS active (High Accuracy)");
        setGeoError(null);
        setPermissionState("granted");
        if (map) {
          map.flyTo([latitude, longitude], 15, { duration: 1.5 });
        }
      },
      (err) => {
        let state: typeof permissionState = "unavailable";
        let message = "GPS unavailable.";
        if (err.code === err.PERMISSION_DENIED) {
          state = "denied";
          message = "Location permission denied. Please enable location access in your browser settings.";
        } else if (err.code === err.TIMEOUT) {
          state = "timeout";
          message = "Location request timed out. Please check your GPS signal and try again.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          state = "unavailable";
          message = "GPS signal unavailable. Please ensure device location/GPS services are turned on.";
        }
        setPermissionState(state);
        setGeoError(message);
        setAddressStatus("Live location unavailable");
        console.warn("Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, [map]);

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setPermissionState(result.state as any);
        result.onchange = () => {
          setPermissionState(result.state as any);
        };
      }).catch((err) => {
        console.warn("Permissions query failed:", err);
      });
    }
    requestLocation();

    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setPermissionState("granted");
        setGeoError(null);
      },
      (err) => {
        console.warn("GPS watch notice:", err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [requestLocation]);

  // Reverse Geocode user location using OpenStreetMap Nominatim (Cached & Rate-limit Safe)
  const reverseGeocodeCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!userLocation) return;
    let isMounted = true;
    const key = `${userLocation.lat.toFixed(4)},${userLocation.lng.toFixed(4)}`;

    if (reverseGeocodeCache.current.has(key)) {
      setAddressStatus(reverseGeocodeCache.current.get(key)!);
      return;
    }

    const fetchAddress = async () => {
      try {
        const res = await fetchWithRetry(
          `https://nominatim.openstreetmap.org/reverse?lat=${userLocation.lat}&lon=${userLocation.lng}&format=jsonv2`,
          {
            headers: { 'User-Agent': 'GoldenGuard-RoadSafetyApp' },
            maxRetries: 1,
            cacheTtlMs: 600000 // 10 minute cache
          }
        );
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          const displayStr = data?.display_name || `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`;
          reverseGeocodeCache.current.set(key, displayStr);
          setAddressStatus(displayStr);
        } else {
          setAddressStatus(`${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`);
        }
      } catch (e: any) {
        if (isMounted) {
          setAddressStatus(`${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`);
        }
      }
    };
    fetchAddress();
    return () => {
      isMounted = false;
    };
  }, [userLocation?.lat, userLocation?.lng]);

  // Fetch Firebase Verified Entities (Hospitals, Police, Responders)
  useEffect(() => {
    let active = true;
    try {
      if (!db) return;
      const q = query(
        collection(db, "users"),
        where("role", "in", ["hospital", "police", "volunteer", "responder", "trainer"]),
        limit(100)
      );
      getDocs(q).then((snapshot) => {
        if (!active) return;
        const entities: MapPlace[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.verificationStatus === "VERIFIED") {
            let parsedLat = 0;
            let parsedLng = 0;
            if (data.location && typeof data.location === "string") {
              const parts = data.location.split(",").map(Number);
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                parsedLat = parts[0];
                parsedLng = parts[1];
              }
            }
            if (parsedLat !== 0 && parsedLng !== 0) {
              entities.push({
                id: `user-entity-${docSnap.id}`,
                name: data.name || data.stationName || "Verified Unit",
                type: data.role === "hospital" ? "hospital" : data.role === "police" ? "police" : "volunteer",
                lat: parsedLat,
                lng: parsedLng,
                vicinity: data.address || "Verified responder unit",
                phone: data.phone || data.officialContact || "112",
                rating: 5.0,
                isOpen: true
              });
            }
          }
        });
        setFirebaseEntities(entities);
      }).catch((err) => {
        console.warn("Firestore users sync notice:", err);
      });
    } catch (err) {
      console.warn("Firebase users sync failed:", err);
    }
    return () => {
      active = false;
    };
  }, []);

  // Fetch Firebase Emergencies (Active alerts & incidents)
  useEffect(() => {
    try {
      if (!db) return;
      const q = query(
        collection(db, "emergencies"),
        where("status", "in", ["CREATED", "ACKNOWLEDGED", "RESPONDER_ASSIGNED", "DISPATCHED", "ARRIVED", "active"]),
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const emergencies: MapPlace[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const pLat = data.latitude;
          const pLng = data.longitude;
          if (typeof pLat === 'number' && !isNaN(pLat) && typeof pLng === 'number' && !isNaN(pLng)) {
            emergencies.push({
              id: `emergency-${docSnap.id}`,
              name: `Emergency Incident: ${data.type || "SOS Alert"}`,
              type: "emergency",
              lat: pLat,
              lng: pLng,
              vicinity: `Status: ${data.status || "Active"} | Severity: ${data.severity || "Unknown"} | Address: ${data.address || "N/A"}`,
              phone: data.phone || "112",
              rating: 4.0,
              isOpen: data.status !== "Resolved",
            });
          }
        });
        setFirebaseEmergencies(emergencies);
      }, (err) => {
        console.warn("Firestore emergencies sync notice:", err);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase emergencies sync failed:", err);
    }
  }, []);

  // Fetch Firebase Hazards & Incidents
  useEffect(() => {
    let active = true;
    try {
      if (!db) return;
      const q = query(collection(db, "hazards"), orderBy("timestamp", "desc"), limit(50));
      getDocs(q).then((snapshot) => {
        if (!active) return;
        const hazards: MapPlace[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: `fb-${doc.id}`,
            name: data.name || data.description || "Reported Road Hazard",
            type: (data.type as MapPlace["type"]) || "hazard",
            lat: data.lat,
            lng: data.lng,
            vicinity: data.vicinity || `Reported: ${data.description || "Road Alert"}`,
            phone: data.phone || "112",
            rating: 4.5,
            isOpen: true
          };
        });
        setFirebaseHazards(hazards);
      }).catch((err) => {
        console.warn("Firestore hazards sync notice:", err);
      });
    } catch (err) {
      console.warn("Firebase hazards sync failed:", err);
    }
    return () => {
      active = false;
    };
  }, []);

  // Calculate distance helper (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // Search places / Geocoding (Debounced)
  const isSelectingRef = useRef(false);
  const searchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }
    
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 3) return;

    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
    }
    const controller = new AbortController();
    searchControllerRef.current = controller;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const res = await fetchWithRetry(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          signal: controller.signal,
          maxRetries: 1,
          cacheTtlMs: 300000 // 5 minutes cache
        }
      );
      if (!res.ok) throw new Error("API error");
      const osmData = await res.json();

      // Filter local verified firebase entities by search term
      const term = searchQuery.toLowerCase().trim();
      const matchedFirebase = firebaseEntities.filter(entity => {
        return entity.name.toLowerCase().includes(term) || entity.vicinity.toLowerCase().includes(term);
      }).map(entity => ({
        place_id: `firebase-${entity.id}`,
        name: `🏥 [Verified] ${entity.name}`,
        display_name: `${entity.name} - ${entity.vicinity} (${entity.type.toUpperCase()})`,
        lat: entity.lat,
        lon: entity.lng,
        source: "firebase",
        originalPlace: entity
      }));

      // Filter local active emergencies/incidents by search term
      const matchedEmergencies = firebaseEmergencies.filter(e => {
        return e.name.toLowerCase().includes(term) || e.vicinity.toLowerCase().includes(term);
      }).map(e => ({
        place_id: `emergency-${e.id}`,
        name: `🚨 [Incident] ${e.name}`,
        display_name: `${e.name} - ${e.vicinity}`,
        lat: e.lat,
        lon: e.lng,
        source: "firebase",
        originalPlace: e
      }));

      const mappedOsm = osmData.map((item: any) => ({
        ...item,
        name: item.name || item.display_name.split(",")[0],
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        source: "osm"
      }));

      setSearchResults([...matchedFirebase, ...matchedEmergencies, ...mappedOsm]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Search failed", err);
        setSearchError("Search service temporarily unavailable.");
      }
    } finally {
      if (searchControllerRef.current === controller) {
        setIsSearching(false);
      }
    }
  };

  const selectSearchResult = (item: any) => {
    isSelectingRef.current = true;
    setHasSearched(false);
    setSearchError(null);
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon !== undefined ? item.lon : item.lng);
    const place: MapPlace = item.originalPlace ? item.originalPlace : {
      id: `search-${item.place_id || Date.now()}`,
      name: item.name || item.display_name.split(",")[0],
      type: "search",
      lat,
      lng,
      vicinity: item.display_name,
      rating: 4.7,
      isOpen: true
    };
    
    setPlaces(prev => {
      const filtered = prev.filter(p => p.type !== "search" && p.id !== place.id);
      return [...filtered, place];
    });
    
    setUserLocation({ lat, lng, accuracy: undefined });
    setZoomLevel(16);
    setSelectedPlace(place);
    setSearchResults([]);
    setSearchQuery(place.name);
    
    if (map) {
      map.flyTo([lat, lng], 16, { duration: 1.5 });
    }
  };

  // Routing via OSRM (Cached & Rate-limit Safe)
  const fetchOSRMRoute = async (
    startLat: number, startLng: number, 
    endLat: number, endLng: number, 
    destName: string, mode: "driving" | "bicycling" | "walking"
  ) => {
    const osrmMode = mode === "bicycling" ? "bike" : mode === "walking" ? "foot" : "driving";
    const routeKey = `${osrmMode}-${startLat.toFixed(3)},${startLng.toFixed(3)}->${endLat.toFixed(3)},${endLng.toFixed(3)}`;

    if (smartMapOSRMRouteCache.has(routeKey)) {
      const cached = smartMapOSRMRouteCache.get(routeKey);
      setActiveRoute(cached);
      if (map && cached.coords) {
        const bounds = L.latLngBounds(cached.coords);
        map.fitBounds(bounds, { padding: [60, 60] });
      }
      return;
    }

    try {
      const res = await fetchWithRetry(
        `https://router.project-osrm.org/route/v1/${osrmMode}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`,
        { maxRetries: 1, cacheTtlMs: 600000 }
      );
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        const leafletCoords: [number, number][] = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        const distKm = parseFloat((route.distance / 1000).toFixed(1));
        const durMins = Math.round(route.duration / 60);

        const routeObj = {
          coords: leafletCoords,
          distanceKm: distKm,
          durationMins: durMins,
          destinationName: destName,
          endLat,
          endLng,
        };

        smartMapOSRMRouteCache.set(routeKey, routeObj);
        setActiveRoute(routeObj);
        
        if (map) {
          const bounds = L.latLngBounds(leafletCoords);
          map.fitBounds(bounds, { padding: [60, 60] });
        }
      }
    } catch (err: any) {
      console.warn("Routing notice:", err?.message || err);
    }
  };

  // Nearest Hospital Quick Action
  const handleFindNearestHospital = () => {
    const origin = userLocation;
    if (!origin) return;
    const hospitals = allPlacesList.filter(p => p.type === "hospital");
    if (hospitals.length === 0) return;

    let nearest = hospitals[0];
    let minDistance = calculateDistance(origin.lat, origin.lng, nearest.lat, nearest.lng);

    hospitals.forEach(h => {
      const d = calculateDistance(origin.lat, origin.lng, h.lat, h.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = h;
      }
    });

    setSelectedPlace(nearest);
    fetchOSRMRoute(origin.lat, origin.lng, nearest.lat, nearest.lng, nearest.name, travelMode);
  };

  // SOS Mode Trigger
  const toggleSOS = () => {
    if (isSOSMode) {
      setIsSOSMode(false);
      setActiveRoute(null);
      return;
    }
    
    setIsSOSMode(true);
    const origin = userLocation;
    if (!origin) return;
    const hospitals = allPlacesList.filter(p => p.type === "hospital");
    const nearestHospital = hospitals[0];
    if (!nearestHospital) {
      if (map) {
        map.flyTo([origin.lat, origin.lng], 16, { duration: 1.5 });
      }
      return;
    }
    
    setSelectedPlace(nearestHospital);
    fetchOSRMRoute(origin.lat, origin.lng, nearestHospital.lat, nearestHospital.lng, nearestHospital.name, "driving");
    
    if (map) {
      map.flyTo([origin.lat, origin.lng], 16, { duration: 1.5 });
    }
  };

  // Hazard Reporting Handler
  const handleMapClickForReport = async (e: any) => {
    if (showHazardDialog) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const newHazard: MapPlace = {
        id: `hazard-report-${Date.now()}`,
        name: reportDesc || `${reportType.toUpperCase()} Reported`,
        type: reportType,
        lat,
        lng,
        vicinity: `User Reported Location (${reportType})`,
        phone: "112",
        rating: 5.0,
        isOpen: true
      };

      setPlaces(prev => [...prev, newHazard]);
      setShowHazardDialog(false);
      setReportDesc("");

      try {
        await addDoc(collection(db, "hazards"), {
          name: newHazard.name,
          type: reportType,
          lat,
          lng,
          vicinity: newHazard.vicinity,
          timestamp: new Date()
        });
      } catch (err) {
        console.warn("Firestore hazard write notice:", err);
      }
    }
  };

  // Map Controls Handlers
  const handleZoomIn = () => { if (map) map.zoomIn(); };
  const handleZoomOut = () => { if (map) map.zoomOut(); };
  const handleRecenter = () => {
    if (map && userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.2 });
    }
  };
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Filtered Places
  const allPlacesList = [
    ...places, 
    ...firebaseHazards, 
    ...firebaseEntities, 
    ...firebaseEmergencies
  ];
  const filteredPlaces = allPlacesList.filter(p => {
    if (selectedCategory === "all") return true;
    return p.type === selectedCategory;
  });

  return (
    <div className="flex flex-col h-[calc(100dvh-10rem)] md:h-[calc(100dvh-6rem)] min-h-[460px] md:min-h-[620px] bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden relative shadow-xl" ref={mapContainerRef}>
      
      {/* Top Floating Header & Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        
        {/* Search */}
        <div className="flex-1 max-w-lg pointer-events-auto flex flex-col gap-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals, police, address, hazards..."
              className="w-full bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 shadow-2xl rounded-2xl pl-11 pr-12 py-3.5 text-sm focus:border-amber-500 outline-none text-surface-900 dark:text-white font-medium"
            />
            <button 
              type="submit"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 focus:outline-none p-1 z-10"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
              </div>
            )}
          </form>

          {searchResults.length > 0 && (
            <div className="bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(item)}
                  className="w-full text-left px-4 py-3 border-b border-surface-100 dark:border-surface-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-start gap-3"
                >
                  <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-surface-900 dark:text-white line-clamp-1">{item.name || item.display_name.split(",")[0]}</div>
                    <div className="text-[10px] text-surface-500 line-clamp-1">{item.display_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchError && (
            <div className="bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-2xl shadow-2xl p-4 text-center">
              <div className="text-red-500 text-sm font-bold mb-2">{searchError}</div>
              <button 
                type="button" 
                onClick={handleSearch}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {!isSearching && hasSearched && searchResults.length === 0 && !searchError && searchQuery.trim().length >= 3 && (
            <div className="bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-2xl shadow-2xl p-4 text-center">
              <div className="text-surface-500 text-sm font-bold">No places found</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pointer-events-auto self-end md:self-auto">
          <button
            onClick={handleFindNearestHospital}
            className="h-12 px-4 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-2xl flex items-center justify-center shadow-xl text-surface-800 dark:text-white hover:border-red-500 transition-colors font-bold text-xs sm:text-sm gap-2"
          >
            <Stethoscope className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Nearest Hospital</span>
          </button>

          <button
            onClick={() => setShowHazardDialog(!showHazardDialog)}
            className="h-12 px-4 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-2xl flex items-center justify-center shadow-xl text-surface-800 dark:text-white hover:border-amber-500 transition-colors font-bold text-xs sm:text-sm gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Report Hazard</span>
          </button>
          
          <button
            onClick={toggleSOS}
            className={`h-12 px-5 rounded-2xl flex items-center justify-center shadow-xl font-black text-xs sm:text-sm gap-2 transition-all duration-300 ${
              isSOSMode 
                ? "bg-red-600 text-white animate-pulse shadow-red-500/50 scale-105" 
                : "bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/30"
            }`}
          >
            <HeartPulse className="w-5 h-5" />
            <span>{isSOSMode ? "CANCEL SOS" : "EMERGENCY SOS"}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="absolute top-32 md:top-20 left-3 right-3 md:left-4 md:right-auto z-[999] flex items-center gap-1.5 overflow-x-auto pb-2 pointer-events-auto no-scrollbar">
        {[
          { id: "all", label: "All Services", icon: Shield },
          { id: "hospital", label: "Hospitals", icon: Stethoscope },
          { id: "police", label: "Police", icon: Shield },
          { id: "ambulance", label: "Emergency Services", icon: Car },
          { id: "volunteer", label: "Verified Volunteers", icon: Users },
          { id: "pharmacy", label: "Pharmacy", icon: Building2 },
          { id: "hazard", label: "Road Problems", icon: AlertTriangle },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-md transition-all whitespace-nowrap ${
                isActive
                  ? "bg-amber-500 text-black shadow-amber-500/30 ring-2 ring-amber-400"
                  : "bg-white/90 dark:bg-surface-900/90 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:border-amber-500"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Hazard Dialog Overlay */}
      {showHazardDialog && (
        <div className="absolute top-36 left-3 right-3 sm:left-4 sm:right-auto z-[1000] bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-amber-500/50 shadow-2xl w-auto sm:w-80 max-w-[calc(100vw-24px)] pointer-events-auto animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-amber-500 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Report Emergency Hazard
            </h3>
            <button onClick={() => setShowHazardDialog(false)} className="text-surface-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-surface-600 dark:text-surface-400 mb-3">Select category & click anywhere on map to pin.</p>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { id: "hazard", label: "Road Hazard" },
              { id: "police", label: "Accident/Police" },
              { id: "ambulance", label: "Ambulance Req" },
              { id: "fire", label: "Fire Emergency" },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setReportType(t.id as MapPlace["type"])}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                  reportType === t.id ? "bg-amber-500 text-black border-amber-400" : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input 
            type="text" 
            placeholder="Details (e.g., Pothole on Ring Road)" 
            value={reportDesc} 
            onChange={e => setReportDesc(e.target.value)}
            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2.5 text-xs mb-3 text-surface-900 dark:text-white focus:border-amber-500 outline-none"
          />
          <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-3 py-2 rounded-xl text-center">
            📍 Now click map location to publish pin
          </div>
        </div>
      )}

      {/* Floating Map Controls */}
      {userLocation && (
        <div className="absolute top-36 right-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
          <button onClick={() => setShowLocationModal(true)} title="Set Location / Change City" className="w-10 h-10 bg-amber-500 hover:bg-amber-400 text-black font-black backdrop-blur-xl border border-amber-400 rounded-xl flex items-center justify-center shadow-xl transition-colors">📍</button>
          <button onClick={handleZoomIn} className="w-10 h-10 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:border-amber-500 transition-colors"><ZoomIn className="w-4 h-4 text-surface-700 dark:text-surface-300" /></button>
          <button onClick={handleZoomOut} className="w-10 h-10 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:border-amber-500 transition-colors"><ZoomOut className="w-4 h-4 text-surface-700 dark:text-surface-300" /></button>
          <div className="w-full h-[1px] bg-surface-200 dark:bg-surface-700 my-0.5" />
          <button onClick={requestLocation} title="My Location" className="w-10 h-10 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:border-blue-500 transition-colors"><LocateFixed className="w-4 h-4 text-blue-500" /></button>
          <button onClick={handleRecenter} title="Recenter" className="w-10 h-10 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:border-emerald-500 transition-colors"><Target className="w-4 h-4 text-emerald-500" /></button>
          <button onClick={() => setShowTrafficLayer(!showTrafficLayer)} title="Traffic Layer" className={`w-10 h-10 backdrop-blur-xl border rounded-xl flex items-center justify-center shadow-xl transition-colors ${showTrafficLayer ? "bg-red-500 text-white border-red-400" : "bg-white/95 dark:bg-surface-900/95 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300"}`}><Radio className="w-4 h-4" /></button>
          <button onClick={toggleFullscreen} title="Fullscreen" className="w-10 h-10 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:border-amber-500 transition-colors"><Maximize className="w-4 h-4 text-surface-700 dark:text-surface-300" /></button>
        </div>
      )}

      {/* Live Location Indicator Banner */}
      <div className="absolute bottom-20 left-4 z-[999] pointer-events-auto bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <div className="text-xs">
          <div className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            LIVE GPS ACTIVE
            {userLocation?.accuracy && (
              <span className="text-[10px] font-normal text-surface-500">
                (±{Math.round(userLocation.accuracy)}m)
              </span>
            )}
          </div>
          <div className="text-[10px] text-surface-500 truncate max-w-[200px] sm:max-w-xs">
            {addressStatus}
          </div>
        </div>
      </div>

      {/* Geolocation Error Alert Banner */}
      {geoError && (
        <div className="absolute top-36 left-4 right-4 sm:left-auto sm:right-4 max-w-md z-[1000] bg-red-500/10 dark:bg-red-950/90 backdrop-blur-xl border border-red-500/50 p-4 rounded-2xl shadow-xl flex flex-col gap-2 pointer-events-auto animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-black text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Location Error
            </span>
            <button onClick={() => setGeoError(null)} className="text-red-500 hover:text-red-700 text-xs font-bold">Dismiss</button>
          </div>
          <p className="text-xs text-surface-700 dark:text-surface-300 leading-relaxed">{geoError}</p>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={requestLocation} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md">
              Retry GPS
            </button>
            <button onClick={() => setShowLocationModal(true)} className="px-3 py-1.5 bg-surface-200 dark:bg-surface-800 text-surface-800 dark:text-white font-bold text-xs rounded-xl transition-colors">
              Set City Manually
            </button>
          </div>
        </div>
      )}

      {/* Leaflet Map / Real Google-like View */}
      <MapContainer
        ref={setMap}
        center={[userLocation?.lat || 28.6139, userLocation?.lng || 77.2090]}
        zoom={zoomLevel}
        minZoom={3}
        maxZoom={20}
        scrollWheelZoom={true}
        className="w-full h-full z-0 animate-in fade-in duration-500"
        zoomControl={false}
      >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked={theme !== "dark"} name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked={theme === "dark"} name="Dark Tactical Map">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Light Minimal">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite (ESRI)">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ScaleControl position="bottomleft" imperial={false} />
          
          {/* Click Handler */}
          <MapEventsHandler onClick={handleMapClickForReport} />

          {/* User Location Marker & Accuracy Circle */}
          {userLocation && typeof userLocation.lat === 'number' && !isNaN(userLocation.lat) && typeof userLocation.lng === 'number' && !isNaN(userLocation.lng) && (
            <>
              {userLocation.accuracy && (
                <Circle 
                  center={[userLocation.lat, userLocation.lng]} 
                  radius={userLocation.accuracy} 
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1 }}
                />
              )}
              <Marker position={[userLocation.lat, userLocation.lng]} icon={getCustomIcon("user")}>
                <Popup className="custom-popup">
                  <div className="font-black text-sm text-surface-900">Your Location</div>
                  <div className="text-[10px] text-surface-500">{addressStatus}</div>
                  {userLocation.accuracy && (
                    <div className="text-[10px] font-bold mt-1">
                      Accuracy: ±{Math.round(userLocation.accuracy)} m
                      {userLocation.accuracy > 50 ? (
                        <span className="text-amber-500 block">⚠️ Poor accuracy - exact coordinates may vary</span>
                      ) : (
                        <span className="text-emerald-600 block">✓ High accuracy GPS</span>
                      )}
                    </div>
                  )}
                </Popup>
              </Marker>
            </>
          )}

          {/* Legitimate clustered emergency markers */}
          <MarkerClusterGroup chunkedLoading>
            {filteredPlaces.filter(place => typeof place.lat === 'number' && !isNaN(place.lat) && typeof place.lng === 'number' && !isNaN(place.lng)).map(place => (
              <Marker 
                key={place.id} 
                position={[place.lat, place.lng]} 
                icon={getCustomIcon(place.type)}
                eventHandlers={{
                  click: () => {
                    setSelectedPlace(place);
                    if (map) map.flyTo([place.lat, place.lng], 16, { duration: 1.2 });
                  }
                }}
              >
                <Popup className="custom-popup">
                  <div className="font-black text-sm text-surface-900">{place.name}</div>
                  <div className="text-[10px] text-surface-500">{place.vicinity}</div>
                  {place.phone && <div className="text-xs font-bold text-red-500 mt-1">Tel: {place.phone}</div>}
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          {/* Active Route Polyline */}
          {activeRoute && (
            <Polyline 
              positions={activeRoute.coords} 
              color={isSOSMode ? "#EF4444" : "#F59E0B"} 
              weight={6} 
              opacity={0.85}
              dashArray={isSOSMode ? "10, 10" : undefined}
            />
          )}
        </MapContainer>

      {/* Selected Place Details Card (Bottom Sheet / Side Panel) */}
      {selectedPlace && (
        <div className="absolute bottom-4 sm:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-96 max-w-[calc(100vw-24px)] max-h-[calc(100vh-5rem)] md:max-h-[80vh] overflow-y-auto custom-scrollbar z-[1000] bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500">
                  {selectedPlace.type}
                </span>
                {selectedPlace.rating && (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    ★ {selectedPlace.rating}
                  </span>
                )}
              </div>
              <h3 className="font-black text-base mt-1 text-surface-900 dark:text-white break-words">{selectedPlace.name}</h3>
            </div>
            <button onClick={() => setSelectedPlace(null)} className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-white shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 break-words">{selectedPlace.vicinity}</p>

          {userLocation && (
            <div className="mb-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-xl">
              <Navigation className="w-3.5 h-3.5 shrink-0" /> 
              <span>Distance: {calculateDistance(userLocation.lat, userLocation.lng, selectedPlace.lat, selectedPlace.lng)} km away</span>
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              onClick={() => {
                if (!userLocation) return;
                fetchOSRMRoute(userLocation.lat, userLocation.lng, selectedPlace.lat, selectedPlace.lng, selectedPlace.name, travelMode);
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors min-h-[44px]"
            >
              <Navigation className="w-4 h-4" /> Get Route
            </button>
            {selectedPlace.phone && (
              <a 
                href={`tel:${selectedPlace.phone}`} 
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center shadow-lg transition-colors min-h-[44px]"
                title="Call Emergency"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Active Route Info Panel */}
      {activeRoute && !selectedPlace && (
        <div className="absolute bottom-4 sm:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-88 max-w-[calc(100vw-24px)] max-h-[calc(100vh-5rem)] md:max-h-[80vh] overflow-y-auto custom-scrollbar z-[1000] bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-amber-500/40 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-500 font-black text-sm break-words pr-2">
              <Navigation className="w-4 h-4 animate-pulse shrink-0" /> Route to {activeRoute.destinationName}
            </div>
            <button onClick={() => setActiveRoute(null)} className="text-surface-400 hover:text-white shrink-0"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-surface-50 dark:bg-surface-800 p-3 rounded-2xl border border-surface-200 dark:border-surface-700">
              <div className="text-[10px] text-surface-500 font-bold uppercase">Distance</div>
              <div className="text-lg font-black text-amber-500">{activeRoute.distanceKm} km</div>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800 p-3 rounded-2xl border border-surface-200 dark:border-surface-700">
              <div className="text-[10px] text-surface-500 font-bold uppercase">Est. Golden Hour Time</div>
              <div className="text-lg font-black text-emerald-500">{activeRoute.durationMins} mins</div>
            </div>
          </div>
          <div className="flex bg-surface-100 dark:bg-surface-800 p-1.5 rounded-2xl">
            <button onClick={() => setTravelMode("driving")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${travelMode === "driving" ? "bg-amber-500 text-black shadow" : "text-surface-500"}`}><Car className="w-3.5 h-3.5" /> Car</button>
            <button onClick={() => setTravelMode("bicycling")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${travelMode === "bicycling" ? "bg-amber-500 text-black shadow" : "text-surface-500"}`}><Sparkles className="w-3.5 h-3.5" /> Bike</button>
            <button onClick={() => setTravelMode("walking")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${travelMode === "walking" ? "bg-amber-500 text-black shadow" : "text-surface-500"}`}><Users className="w-3.5 h-3.5" /> Walk</button>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">📍</div>
                <div>
                  <h3 className="font-black text-base text-surface-900 dark:text-white">Set Your Location</h3>
                  <p className="text-xs text-surface-500">Fix inaccurate map location or select city</p>
                </div>
              </div>
              <button onClick={() => setShowLocationModal(false)} className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  requestLocation();
                  setShowLocationModal(false);
                }}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <LocateFixed className="w-4 h-4" /> Detect My Live GPS Location
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-200 dark:border-surface-800"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-surface-900 px-2 text-surface-400 font-bold text-surface-400">Or Select City</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {[
                  { name: "New Delhi", lat: 28.6139, lng: 77.2090 },
                  { name: "Patna", lat: 25.5941, lng: 85.1376 },
                  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
                  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
                  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
                  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
                  { name: "Pune", lat: 18.5204, lng: 73.8567 },
                  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
                  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
                  { name: "Jaipur", lat: 26.9124, lng: 75.7873 }
                ].map(city => (
                  <button
                    key={city.name}
                    onClick={() => {
                      setUserLocation({ lat: city.lat, lng: city.lng, accuracy: 10 });
                      if (map) map.flyTo([city.lat, city.lng], 15, { duration: 1.2 });
                      setShowLocationModal(false);
                    }}
                    className="p-3 bg-surface-50 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-800 dark:text-white rounded-2xl text-xs font-bold text-left border border-surface-200 dark:border-surface-700 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] text-amber-500 font-black">Select</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper to handle map clicks for reporting
function MapEventsHandler({ onClick }: { onClick: (e: any) => void }) {
  useMapEvents({ click: onClick });
  return null;
}
