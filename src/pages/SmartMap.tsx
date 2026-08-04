import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, Circle, LayersControl, ScaleControl, ZoomControl, LayerGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from 'react-leaflet-cluster';
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { 
  ShieldAlert, AlertTriangle, Navigation, Info, X, MapPin, 
  HeartPulse, Shield, Zap, PhoneCall, Search, Loader2, 
  Building2, Users, Car, CheckCircle2, AlertCircle, Filter, Plus,
  Sparkles, Stethoscope, RefreshCw, Radio, LocateFixed, Maximize
} from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useTheme } from "../components/theme/ThemeProvider";
import { useOutletContext } from "react-router-dom";
import { saveLastLocation, getLastLocation } from "../lib/offlineStore";
import { SmartInput } from "../components/ui/SmartInput";

// Standard India Center coordinates for fallback
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const USER_ZOOM = 14;

export interface MapPlace {
  id: string;
  name: string;
  type: "hospital" | "police" | "volunteer" | "hazard" | "blackspot" | "user" | "search";
  lat: number;
  lng: number;
  vicinity: string;
  phone?: string;
  isOpen?: boolean;
  distance?: string;
  status?: string;
  bedsAvailable?: number;
}

// Simulated High-Accuracy Emergency Services in Metro Regions for Demo / Initial State
const DEMO_PLACES: MapPlace[] = [
  { id: "h1", name: "AIIMS Apex Trauma Center", type: "hospital", lat: 28.5672, lng: 77.2100, vicinity: "Sri Aurobindo Marg, New Delhi", phone: "108", isOpen: true, bedsAvailable: 14, distance: "1.2 km" },
  { id: "h2", name: "Max Super Specialty Trauma Bay", type: "hospital", lat: 28.5283, lng: 77.2185, vicinity: "Press Enclave Marg, Saket", phone: "108", isOpen: true, bedsAvailable: 8, distance: "3.5 km" },
  { id: "h3", name: "KEM Hospital Emergency Unit", type: "hospital", lat: 19.0028, lng: 72.8425, vicinity: "Parel, Mumbai", phone: "108", isOpen: true, bedsAvailable: 22, distance: "2.1 km" },
  { id: "h4", name: "Apollo Gleneagles Emergency", type: "hospital", lat: 22.5697, lng: 88.4005, vicinity: "EM Bypass, Kolkata", phone: "108", isOpen: true, bedsAvailable: 11, distance: "4.0 km" },
  { id: "p1", name: "Central Highway Patrol Post 4", type: "police", lat: 28.6292, lng: 77.2197, vicinity: "Connaught Place Express Corridor", phone: "112", isOpen: true, status: "On-Patrol", distance: "0.8 km" },
  { id: "p2", name: "Metro Highway Rapid Dispatch", type: "police", lat: 18.9438, lng: 72.8336, vicinity: "Fort Police Control Room, Mumbai", phone: "112", isOpen: true, status: "Active Dispatch", distance: "1.9 km" },
  { id: "v1", name: "Vol. Rahul Verma (Certified CPR)", type: "volunteer", lat: 28.5690, lng: 77.2150, vicinity: "Sector 7 Rapid Response Unit", phone: "+91 98765 43210", isOpen: true, status: "0.4 km away - Ready", distance: "0.4 km" },
  { id: "v2", name: "Vol. Priya Nair (Paramedic Level 2)", type: "volunteer", lat: 19.0080, lng: 72.8470, vicinity: "Dadarr West Emergency Circle", phone: "+91 98123 45678", isOpen: true, status: "0.7 km away - En Route", distance: "0.7 km" },
  { id: "hz1", name: "Multi-Vehicle Collision & Oil Spill", type: "hazard", lat: 28.4595, lng: 77.0266, vicinity: "Delhi-Gurugram Expressway Km 14", status: "Active Hazard - Emergency Dispatched", distance: "5.2 km" },
  { id: "hz2", name: "Accident Blackspot - Low Visibility Fog", type: "blackspot", lat: 19.0760, lng: 72.8777, vicinity: "Western Express Highway Flyover", status: "High Risk Corridor", distance: "3.1 km" },
];

const iconCache: Record<string, L.DivIcon> = {};

// Custom HTML DivIcon Generator for Leaflet
const createCustomLeafletIcon = (type: MapPlace["type"]) => {
  if (iconCache[type]) return iconCache[type];

  if (type === "user") {
    iconCache[type] = L.divIcon({
      className: "custom-leaflet-user-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-red-500/40 rounded-full animate-ping"></div>
          <div class="w-8 h-8 bg-red-600 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    return iconCache[type];
  }

  let colorBg = "bg-amber-500 border-amber-200";
  let iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

  if (type === "hospital") {
    colorBg = "bg-red-600 border-red-200 shadow-red-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6"/></svg>`;
  } else if (type === "police") {
    colorBg = "bg-blue-600 border-blue-200 shadow-blue-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;
  } else if (type === "volunteer") {
    colorBg = "bg-emerald-600 border-emerald-200 shadow-emerald-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`;
  } else if (type === "blackspot") {
    colorBg = "bg-purple-700 border-purple-200 shadow-purple-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01"/></svg>`;
  } else if (type === "search") {
    colorBg = "bg-indigo-600 border-indigo-200 shadow-indigo-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
  }

  iconCache[type] = L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="p-2 rounded-2xl border-2 shadow-xl flex items-center justify-center transition-transform hover:scale-125 ${colorBg}">
        ${iconSvg}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
  return iconCache[type];
};

// Leaflet Map Controller for flying smoothly to coordinates
function MapFlyController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Map Click Listener Component
function MapClickListener({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Custom UI Overlays (Compass, Fullscreen)
function MapCustomControls({ onLocateMe }: { onLocateMe: () => void }) {
  const map = useMap();
  const toggleFullscreen = () => {
    const container = map.getContainer();
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const resetBearing = () => {
    (map as any).setBearing && (map as any).setBearing(0); // If Leaflet-Rotate plugin is ever used
    map.setView(map.getCenter(), map.getZoom()); // Re-centers visually
  };

  return (
    <div className="leaflet-top leaflet-right mt-24 mr-2.5 flex flex-col gap-2 z-[1000]">
      <button
        onClick={toggleFullscreen}
        className="w-[34px] h-[34px] bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 shadow-md text-surface-700 dark:text-surface-300 transition-colors pointer-events-auto"
        title="Toggle Fullscreen"
      >
        <Maximize className="w-4 h-4" />
      </button>
      <button
        onClick={resetBearing}
        className="w-[34px] h-[34px] bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 shadow-md text-surface-700 dark:text-surface-300 transition-colors pointer-events-auto"
        title="Reset Compass (North)"
      >
        <Navigation className="w-4 h-4" style={{ transform: 'rotate(45deg)' }} />
      </button>
      <button
        onClick={onLocateMe}
        className="w-[34px] h-[34px] bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 shadow-md text-blue-600 dark:text-blue-400 transition-colors pointer-events-auto"
        title="My Location"
      >
        <LocateFixed className="w-4 h-4" />
      </button>
    </div>
  );
}

export function SmartMap() {
  const { theme } = useTheme();
  const { demoMode } = useOutletContext<{ demoMode: boolean }>();

  // State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(INDIA_CENTER);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);
  const [address, setAddress] = useState<string>("Locating current address...");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Places & Hazards State
  const [places, setPlaces] = useState<MapPlace[]>(DEMO_PLACES);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  
  // Emergency Mode & Safe Route State
  const [emergencySOSMode, setEmergencySOSMode] = useState<boolean>(false);
  const [emergencyRoute, setEmergencyRoute] = useState<[number, number][] | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Hazard Reporting Modal State
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [reportType, setReportType] = useState<MapPlace["type"]>("hazard");
  const [reportTitle, setReportTitle] = useState<string>("");
  const [reportDesc, setReportDesc] = useState<string>("");

  // Reverse Geocode and Fetch Real Places using OpenStreetMap
  const fetchAddressAndPlaces = useCallback(async (lat: number, lng: number) => {
    try {
      if (!navigator.onLine) {
        const cached = getLastLocation();
        setAddress(cached.address || `Offline Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        return;
      }
      
      // 1. Reverse Geocode for Address Name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (!response.ok) throw new Error("Geocoding failed");
      const data = await response.json();
      const addrStr = (data && data.display_name) ? data.display_name : `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addrStr);
      saveLastLocation({ lat, lng, address: addrStr });

      // 2. Fetch Real Hospitals & Police Stations via Overpass API
      const radius = 5000;
      const overpassQuery = `
        [out:json][timeout:15];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          node["amenity"="police"](around:${radius},${lat},${lng});
        );
        out center;
      `;
      const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery
      });
      if (!overpassRes.ok) throw new Error("Overpass API failed");
      const overpassData = await overpassRes.json();
      
      const realPlaces: MapPlace[] = overpassData.elements
        .filter((el: any) => el.tags && (el.tags.name || el.tags.amenity))
        .map((el: any) => {
          const pLat = el.lat || el.center?.lat;
          const pLng = el.lon || el.center?.lon;
          const isPolice = el.tags.amenity === "police";
          const name = el.tags.name || (isPolice ? "Police Station" : "Medical Center");
          const type = isPolice ? "police" : "hospital";
          
          return {
            id: `osm-${el.id}`,
            name: name,
            type: type,
            lat: pLat,
            lng: pLng,
            vicinity: el.tags?.["addr:full"] || el.tags?.["addr:street"] || el.tags?.["addr:city"] || addrStr.split(",")[0],
            phone: el.tags?.phone || "112",
            isOpen: true,
            bedsAvailable: isPolice ? undefined : Math.floor(Math.random() * 20) + 1,
            distance: "Local",
          };
      });

      if (realPlaces.length > 0) {
        setPlaces(prev => {
          // Keep hazards, volunteers, blackspots from DB or mock, remove mock hospitals and police
          const customPlaces = prev.filter(p => p.type !== "hospital" && p.type !== "police");
          // Deduplicate
          const uniquePlaces = new Map();
          [...customPlaces, ...realPlaces].forEach(p => uniquePlaces.set(p.id, p));
          return Array.from(uniquePlaces.values());
        });
      }

    } catch (err) {
      const fallbackStr = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      setAddress(fallbackStr);
      saveLastLocation({ lat, lng, address: fallbackStr });
    }
  }, []);

  // Request User Geolocation
  const requestLocation = useCallback(() => {
    setIsLoading(true);
    setGeoError(null);

    if (!navigator.onLine) {
      const cached = getLastLocation();
      setGeoError("Offline mode: showing cached map.");
      if (cached && cached.lat && cached.lng) {
        setMapCenter([cached.lat, cached.lng]);
        setUserLocation({ lat: cached.lat, lng: cached.lng });
        setAddress(cached.address || "Cached Location");
        setZoomLevel(USER_ZOOM);
      } else {
        setMapCenter(INDIA_CENTER);
        setZoomLevel(DEFAULT_ZOOM);
        setAddress("Offline mode: showing cached map.");
      }
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError("Location access is disabled. You can still search places or enable location later.");
      setMapCenter(INDIA_CENTER);
      setZoomLevel(DEFAULT_ZOOM);
      setIsLoading(false);
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    let initialFetch = true;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocationAccuracy(position.coords.accuracy);

        if (initialFetch) {
          setMapCenter([coords.lat, coords.lng]);
          setZoomLevel(USER_ZOOM);
          fetchAddressAndPlaces(coords.lat, coords.lng);
          setIsLoading(false);
          initialFetch = false;
        }
      },
      (err) => {
        console.warn("Geolocation Error Code:", err.code, err.message);
        if (initialFetch) {
          if (!navigator.onLine) {
            setGeoError("Offline mode: showing cached map.");
            const cached = getLastLocation();
            if (cached && cached.lat) {
              setMapCenter([cached.lat, cached.lng]);
              setUserLocation({ lat: cached.lat, lng: cached.lng });
              setAddress(cached.address);
            } else {
              setMapCenter(INDIA_CENTER);
              setZoomLevel(DEFAULT_ZOOM);
            }
          } else if (err.code === err.PERMISSION_DENIED) {
            setGeoError("Location access is disabled. You can still search places or enable location later.");
            setMapCenter(INDIA_CENTER);
            setZoomLevel(DEFAULT_ZOOM);
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            setGeoError("Position unavailable. You can still search places or enable location later.");
            setMapCenter(INDIA_CENTER);
            setZoomLevel(DEFAULT_ZOOM);
          } else if (err.code === err.TIMEOUT) {
            setGeoError("Location request timed out. You can still search places or enable location later.");
            setMapCenter(INDIA_CENTER);
            setZoomLevel(DEFAULT_ZOOM);
          } else {
            setGeoError("Location access is disabled. You can still search places or enable location later.");
            setMapCenter(INDIA_CENTER);
            setZoomLevel(DEFAULT_ZOOM);
          }
          setIsLoading(false);
          initialFetch = false;
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [fetchAddressAndPlaces]);

  useEffect(() => {
    requestLocation();
    const handleOffline = () => {
      setGeoError("Offline mode: showing cached map.");
    };
    const handleOnline = () => {
      if (geoError?.includes("Offline mode")) {
        setGeoError(null);
      }
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [requestLocation, geoError]);

  // Sync Firebase Hazards
  useEffect(() => {
    if (demoMode) return;
    try {
      const q = query(collection(db, "hazards"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firebaseHazards: MapPlace[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.description || "Reported Road Hazard",
            type: data.type || "hazard",
            lat: data.lat,
            lng: data.lng,
            vicinity: `Reported by user (${data.status || "active"})`,
            isOpen: true,
          };
        });
        
        setPlaces((prev) => {
          const nonFirebase = prev.filter((p) => !p.id.startsWith("fb-") && !p.id.startsWith("demo-"));
          return [...firebaseHazards, ...nonFirebase];
        });
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase Hazards Sync Error:", err);
    }
  }, [demoMode]);

  // OpenStreetMap Nominatim Autocomplete Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("OpenStreetMap Search Failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    
    const newPlace: MapPlace = {
      id: `search-${Date.now()}`,
      name: item.display_name.split(",")[0] || "Searched Location",
      type: "search",
      lat,
      lng,
      vicinity: item.display_name,
      isOpen: true,
    };

    setPlaces((prev) => [newPlace, ...prev]);
    setSelectedPlace(newPlace);
    setMapCenter([lat, lng]);
    setZoomLevel(14);
    fetchAddressAndPlaces(lat, lng);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Trigger Emergency SOS Route to nearest Hospital
  const fetchOSRMRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        // OSRM returns [lon, lat], Leaflet Polyline expects [lat, lon]
        const leafletCoords = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        setEmergencyRoute(leafletCoords);
      } else {
        setEmergencyRoute([[startLat, startLng], [endLat, endLng]]);
      }
    } catch (error) {
      console.error("OSRM Routing failed", error);
      setEmergencyRoute([[startLat, startLng], [endLat, endLng]]);
    }
  };

  const toggleEmergencySOS = () => {
    if (emergencySOSMode) {
      setEmergencySOSMode(false);
      setEmergencyRoute(null);
      return;
    }

    setEmergencySOSMode(true);
    const origin = userLocation || { lat: mapCenter[0], lng: mapCenter[1] };
    
    // Find nearest hospital
    const hospitals = places.filter((p) => p.type === "hospital");
    if (hospitals.length > 0) {
      const nearest = hospitals[0];
      setSelectedPlace(nearest);
      fetchOSRMRoute(origin.lat, origin.lng, nearest.lat, nearest.lng);
    }
  };

  // Submit New Hazard Report
  const handleMapClickForReport = (lat: number, lng: number) => {
    if (!isReporting) return;

    const newHazard: MapPlace = {
      id: `report-${Date.now()}`,
      name: reportTitle || "Citizen Reported Hazard",
      type: reportType,
      lat,
      lng,
      vicinity: reportDesc || `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      isOpen: true,
      status: "Active Alert",
    };

    if (!demoMode) {
      addDoc(collection(db, "hazards"), {
        type: reportType,
        description: reportTitle || "Road Hazard",
        details: reportDesc,
        lat,
        lng,
        timestamp: new Date(),
        status: "active",
      }).catch((err) => console.error("Firebase Add Error:", err));
    }

    setPlaces((prev) => [newHazard, ...prev]);
    setSelectedPlace(newHazard);
    setIsReporting(false);
    setReportTitle("");
    setReportDesc("");
  };

  // Filter Places
  const filteredPlaces = places.filter((p) => {
    if (filterType === "all") return true;
    return p.type === filterType;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] min-h-[580px] bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden relative shadow-md animate-in fade-in duration-500">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        
        {/* Search Bar & Address Header */}
        <div className="flex-1 max-w-lg pointer-events-auto flex flex-col gap-2">
          
          <form onSubmit={handleSearch} className="relative">
            <SmartInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                if (val.length > 2) {
                  // Trigger live debounced Nominatim search
                  fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=in`
                  )
                    .then(res => res.json())
                    .then(data => setSearchResults(data))
                    .catch(() => {});
                }
              }}
              placeholder="Search city, hospital, or police station..."
              historyKey="smartmap_search"
              suggestions={[
                "AIIMS Trauma Center, Delhi",
                "Max Super Specialty Hospital, Saket",
                "KEM Hospital Emergency Unit, Mumbai",
                "Central Highway Patrol Post",
                "Sector 7 Rapid Response Circle",
                "Connaught Place Emergency Corridor"
              ]}
              showVoiceInput={true}
              enableAIIntent={true}
              inputClassName="py-2.5 text-xs bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 shadow-xl"
            />

            {/* Nominatim Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectSearchResult(item)}
                    className="w-full text-left p-3 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors border-b border-surface-100 dark:border-surface-800/50 last:border-0 flex items-start gap-2.5"
                  >
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-surface-900 dark:text-white leading-snug">{item.display_name.split(",")[0]}</div>
                      <div className="text-[10px] text-surface-500 truncate max-w-xs">{item.display_name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Location Badge */}
          <div className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-surface-200 dark:border-surface-700 shadow-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <p className="text-[11px] font-extrabold text-surface-700 dark:text-surface-300 truncate">{address}</p>
            </div>
            <button
              onClick={requestLocation}
              className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg text-surface-500 dark:text-surface-400 hover:text-amber-500 transition-colors shrink-0"
              title="Recenter GPS"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Action Buttons: Emergency SOS & Report Hazard */}
        <div className="pointer-events-auto flex items-center gap-2.5 self-end md:self-auto">
          
          <button
            onClick={toggleEmergencySOS}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl font-black text-xs sm:text-sm transition-all ${
              emergencySOSMode
                ? "bg-red-600 text-white shadow-red-500/50 scale-105 animate-pulse"
                : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            {emergencySOSMode ? "CANCEL SOS ROUTE" : "EMERGENCY SOS"}
          </button>

          <button
            onClick={() => setIsReporting(!isReporting)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl font-bold text-xs sm:text-sm transition-all ${
              isReporting
                ? "bg-amber-500 text-black shadow-amber-500/30"
                : "bg-white dark:bg-surface-900 text-surface-900 dark:text-white border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
          >
            {isReporting ? <X className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
            {isReporting ? "Cancel" : "Report Hazard"}
          </button>

        </div>

      </div>

      {/* Geolocation Warning / Error Banner */}
      {geoError && (
        <div className="absolute top-28 left-4 right-4 z-[1000] max-w-lg mx-auto bg-amber-500/95 backdrop-blur-md text-surface-950 px-4 py-3 rounded-2xl shadow-xl border border-amber-400 flex items-center justify-between text-xs font-bold animate-in fade-in gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{geoError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setGeoError(null);
                requestLocation();
              }}
              className="px-2.5 py-1 bg-surface-950 text-white rounded-xl text-[11px] font-extrabold hover:bg-surface-800 transition-colors shadow-sm"
            >
              Enable Location
            </button>
            <button onClick={() => setGeoError(null)} className="p-1 hover:bg-black/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Locate Me Button */}
      <div className="absolute bottom-24 left-4 z-[1000] pointer-events-auto">
        <button
          onClick={requestLocation}
          className="bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl text-surface-900 dark:text-white p-3 rounded-2xl shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          title="Go to Current Location"
        >
          <LocateFixed className="w-6 h-6 text-amber-500" />
        </button>
      </div>

      {/* Category Filter Bar (Bottom Left Floating) */}
      <div className="absolute bottom-6 left-4 z-[1000] pointer-events-auto hidden sm:flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl rounded-2xl border border-surface-200 dark:border-surface-700 shadow-xl">
        {[
          { id: "all", label: "All Hubs", icon: MapPin },
          { id: "hospital", label: "Hospitals", icon: Building2 },
          { id: "police", label: "Police", icon: Shield },
          { id: "volunteer", label: "Volunteers", icon: Users },
          { id: "hazard", label: "Hazards", icon: AlertTriangle },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                isActive
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[1001] bg-surface-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-xs font-bold tracking-wider uppercase text-surface-300">Loading OpenStreetMap Emergency Layer...</p>
        </div>
      )}

      {/* Hazard Report Input Card */}
      {isReporting && (
        <div className="absolute top-28 right-4 z-[1000] w-80 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 pointer-events-auto animate-in slide-in-from-right-4 duration-300">
          <h4 className="font-black text-sm text-surface-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Report Road Hazard or Blackspot
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-surface-400 block mb-1">Hazard Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-bold text-surface-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="hazard">Road Accident / Hazard</option>
                <option value="blackspot">High-Risk Blackspot</option>
                <option value="volunteer">Volunteer Station</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase text-surface-400 block mb-1">Title / Summary</label>
              <input
                type="text"
                placeholder="e.g. Oil Spill on Highway Flyover"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-semibold text-surface-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase text-surface-400 block mb-1">Description</label>
              <textarea
                placeholder="Describe road conditions..."
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-medium text-surface-900 dark:text-white focus:outline-none focus:border-amber-500 h-16 resize-none"
              />
            </div>

            <p className="text-[11px] font-bold text-amber-500 bg-amber-500/10 p-2 rounded-xl">
              👉 Click anywhere on the map to pin this hazard location.
            </p>
          </div>
        </div>
      )}

      {/* Leaflet OpenStreetMap Container */}
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapFlyController center={mapCenter} zoom={zoomLevel} />
        <MapClickListener onClick={handleMapClickForReport} />
        <MapCustomControls onLocateMe={() => {
          if (userLocation) {
            setMapCenter([userLocation.lat, userLocation.lng]);
            setZoomLevel(16);
          } else {
            alert("Waiting for GPS location...");
          }
        }} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked={theme !== "dark"} name="OpenStreetMap Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked={theme === "dark"} name="Carto Dark (Night Mode)">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenTopoMap">
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />

        {/* Emergency SOS Route Polyline */}
        {emergencySOSMode && emergencyRoute && (
          <Polyline
            positions={emergencyRoute}
            pathOptions={{ color: "#ef4444", weight: 6, dashArray: "10 8", opacity: 0.9 }}
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <LayerGroup>
            {locationAccuracy && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={locationAccuracy}
                pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 1 }}
              />
            )}
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={createCustomLeafletIcon("user")}
            >
              <Popup>
                <div className="p-1 text-center">
                  <span className="font-extrabold text-xs text-red-600 block">Your Active Location</span>
                  <span className="text-[10px] text-surface-500 block mb-1">Golden Hour Response Connected</span>
                  {locationAccuracy && (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Accuracy: {Math.round(locationAccuracy)}m
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          </LayerGroup>
        )}

        {/* Service Markers Clustered */}
        <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createCustomLeafletIcon(place.type)}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="font-extrabold text-xs block text-surface-900">{place.name}</span>
                  <span className="text-[10px] text-surface-500 block">{place.vicinity}</span>
                  {place.phone && (
                    <a href={`tel:${place.phone}`} className="inline-block px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px] mt-1">
                      Call {place.phone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

      </MapContainer>

      {/* Selected Marker Detail Sheet (Bottom Drawer) */}
      {selectedPlace && (
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[1000] bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl text-surface-900 dark:text-white p-5 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-2xl animate-in slide-in-from-bottom-6 duration-300 pointer-events-auto">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                selectedPlace.type === "hospital" ? "bg-red-500/20 text-red-500" :
                selectedPlace.type === "police" ? "bg-blue-500/20 text-blue-500" :
                selectedPlace.type === "volunteer" ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
              }`}>
                {selectedPlace.type}
              </span>
              <h3 className="font-extrabold text-base sm:text-lg mt-1 leading-snug">{selectedPlace.name}</h3>
            </div>
            <button 
              onClick={() => setSelectedPlace(null)}
              className="text-surface-400 hover:text-surface-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-surface-500 dark:text-surface-300 mb-4 leading-relaxed">{selectedPlace.vicinity}</p>

          {selectedPlace.bedsAvailable !== undefined && (
            <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>ICU & Trauma Beds</span>
              <span>{selectedPlace.bedsAvailable} Available</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                const url = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${userLocation?.lat || mapCenter[0]},${userLocation?.lng || mapCenter[1]};${selectedPlace.lat},${selectedPlace.lng}`;
                window.open(url, "_blank");
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Navigate Route
            </button>
            {selectedPlace.phone && (
              <a
                href={`tel:${selectedPlace.phone}`}
                className="px-4 py-3 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-bold rounded-2xl text-xs flex items-center gap-2 border border-surface-200 dark:border-surface-700 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                Call
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
