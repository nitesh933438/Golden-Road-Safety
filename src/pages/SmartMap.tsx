import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  MapContainer, TileLayer, Marker, Popup, Polyline, 
  Circle, LayersControl, ScaleControl, ZoomControl, useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { 
  ShieldAlert, Navigation, Info, X, MapPin, 
  PhoneCall, Search, Loader2, Users, Car,
  Sparkles, Stethoscope, RefreshCw, Radio, LocateFixed, Maximize,
  Compass, ZoomIn, ZoomOut, Target, HeartPulse, Shield, Filter, Plus,
  AlertTriangle
} from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useTheme } from "../components/theme/ThemeProvider";
import { useOutletContext } from "react-router-dom";
import { SmartInput } from "../components/ui/SmartInput";
import { InteractiveFallbackMap } from "../components/InteractiveFallbackMap";

// --- Types ---
interface MapPlace {
  id: string;
  name: string;
  type: "hospital" | "police" | "volunteer" | "hazard" | "user" | "search" | "petrol" | "school";
  lat: number;
  lng: number;
  vicinity?: string;
  phone?: string;
  bedsAvailable?: number;
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
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

// --- Icon Generator ---
const iconCache: Record<string, L.DivIcon> = {};

const getCustomIcon = (type: MapPlace["type"]) => {
  if (iconCache[type]) return iconCache[type];

  if (type === "user") {
    iconCache[type] = L.divIcon({
      className: "custom-leaflet-user-marker",
      html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-red-500/40 rounded-full animate-ping"></div>
          <div class="w-8 h-8 bg-red-600 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
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
  } else if (type === "volunteer") {
    colorBg = "bg-emerald-500 border-emerald-200 shadow-emerald-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M16 21v-2a4 4 0 00-4-4H5c-1.1 0-2 .9-2 2v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`;
  } else if (type === "search") {
    colorBg = "bg-indigo-600 border-indigo-200 shadow-indigo-500/30";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }

  iconCache[type] = L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="p-2 rounded-2xl border-2 shadow-xl flex items-center justify-center transition-transform hover:scale-125 ${colorBg}">
        ${iconSvg}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
  return iconCache[type];
};

// --- Mock Data ---
const MOCK_PLACES: MapPlace[] = [
  { id: "h1", name: "AIIMS Hospital", type: "hospital", lat: 28.5672, lng: 77.2100, vicinity: "Ansari Nagar, New Delhi", phone: "102", bedsAvailable: 12 },
  { id: "p1", name: "Connaught Place Police Station", type: "police", lat: 28.6315, lng: 77.2167, vicinity: "Connaught Place, New Delhi", phone: "100" },
  { id: "v1", name: "Ravi (Volunteer)", type: "volunteer", lat: 28.6139, lng: 77.2090, vicinity: "Ready to help", phone: "+91 98765 43210" },
];

export default function SmartMap() {
  const { theme } = useTheme();
  const { hideSidebar } = useOutletContext<{ hideSidebar?: () => void }>() || {};

  // Refs & Map Instance
  const [map, setMap] = useState<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // States
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(INDIA_CENTER);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);
  const [address, setAddress] = useState<string>("Ready");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [places, setPlaces] = useState<MapPlace[]>(MOCK_PLACES);
  const [firebaseHazards, setFirebaseHazards] = useState<MapPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [travelMode, setTravelMode] = useState<"driving" | "bike" | "foot">("driving");
  
  const [isSOSMode, setIsSOSMode] = useState(false);
  const [showHazardDialog, setShowHazardDialog] = useState(false);
  const [reportType, setReportType] = useState("hazard");
  const [reportDesc, setReportDesc] = useState("");

  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);

  // Sync zoom state
  useEffect(() => {
    if (!map) return;
    const onZoom = () => setCurrentZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => { map.off('zoomend', onZoom); };
  }, [map]);

  // Request Location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    
    setAddress("Locating you...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setZoomLevel(15);
        setAddress("Location Active");
        if (map) {
          map.flyTo([latitude, longitude], 15, { duration: 1.5 });
        }
      },
      (err) => {
        setGeoError(err.message || "Location access denied");
        setAddress("Location disabled");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, [map]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Fetch Firebase Hazards
  useEffect(() => {
    try {
      const q = query(collection(db, "hazards"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const hazards: MapPlace[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: `fb-${doc.id}`,
            name: data.description || "Reported Road Hazard",
            type: "hazard",
            lat: data.lat,
            lng: data.lng,
            vicinity: `Reported on ${new Date(data.timestamp?.toDate()).toLocaleDateString()}`
          };
        });
        setFirebaseHazards(hazards);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase Hazards Sync Error:", err);
    }
  }, []);

  // Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const place: MapPlace = {
      id: `search-${item.place_id}`,
      name: item.name || item.display_name.split(",")[0],
      type: "search",
      lat,
      lng,
      vicinity: item.display_name
    };
    
    setPlaces(prev => {
      const filtered = prev.filter(p => p.type !== "search");
      return [...filtered, place];
    });
    
    setMapCenter([lat, lng]);
    setZoomLevel(16);
    setSelectedPlace(place);
    setSearchResults([]);
    setSearchQuery(place.name);
    
    if (map) {
      map.flyTo([lat, lng], 16, { duration: 1.5 });
    }
  };

  // Routing
  const fetchOSRMRoute = async (
    startLat: number, startLng: number, 
    endLat: number, endLng: number, 
    destName: string, mode: "driving" | "bike" | "foot"
  ) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/${mode}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        const leafletCoords: [number, number][] = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        const distKm = parseFloat((route.distance / 1000).toFixed(1));
        const durMins = Math.round(route.duration / 60);

        setActiveRoute({
          coords: leafletCoords,
          distanceKm: distKm,
          durationMins: durMins,
          destinationName: destName,
          endLat,
          endLng,
        });
        
        if (map) {
          const bounds = L.latLngBounds(leafletCoords);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (err) {
      console.error("Routing Error:", err);
    }
  };

  // SOS Mode
  const toggleSOS = () => {
    if (isSOSMode) {
      setIsSOSMode(false);
      setActiveRoute(null);
      return;
    }
    
    setIsSOSMode(true);
    const origin = userLocation || { lat: mapCenter[0], lng: mapCenter[1] };
    const hospital = places.find(p => p.type === "hospital") || MOCK_PLACES[0];
    setSelectedPlace(hospital);
    fetchOSRMRoute(origin.lat, origin.lng, hospital.lat, hospital.lng, hospital.name, "driving");
  };

  // Map Controls Handlers
  const handleZoomIn = () => {
    if (map && map.getZoom() < map.getMaxZoom()) map.zoomIn();
  };
  const handleZoomOut = () => {
    if (map && map.getZoom() > map.getMinZoom()) map.zoomOut();
  };
  const handleRecenter = () => {
    if (map && userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.2 });
    } else if (map) {
      map.flyTo(INDIA_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
    }
  };
  const handleResetView = () => {
    if (map) map.flyTo(INDIA_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
  };
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  const resetBearing = () => {
    if (map) map.setView(map.getCenter(), map.getZoom());
  };
  const handleMapClickForReport = (e: any) => {
    if (showHazardDialog) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const place: MapPlace = {
        id: `hazard-${Date.now()}`,
        name: "Reported Hazard",
        type: "hazard",
        lat,
        lng,
        vicinity: reportDesc || "Reported by you"
      };
      setPlaces(prev => [...prev, place]);
      setShowHazardDialog(false);
      setReportDesc("");
      try { addDoc(collection(db, "hazards"), { ...place, timestamp: new Date() }); } catch(err) {}
    }
  };

  const allMapPlaces = [...places, ...firebaseHazards];

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] min-h-[580px] bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden relative shadow-md" ref={mapContainerRef}>
      
      {/* Top Floating Header & Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        
        {/* Search */}
        <div className="flex-1 max-w-lg pointer-events-auto flex flex-col gap-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, hospital, pincode..."
              className="w-full bg-white/90 dark:bg-surface-900/95 backdrop-blur-xl border border-surface-200 dark:border-surface-700 shadow-xl rounded-2xl pl-10 pr-12 py-3.5 text-sm focus:border-emerald-500 outline-none text-surface-900 dark:text-white"
            />
            <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
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
                  className="w-full text-left px-4 py-3 border-b border-surface-100 dark:border-surface-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-start gap-3"
                >
                  <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-surface-900 dark:text-white line-clamp-1">{item.name || item.display_name.split(",")[0]}</div>
                    <div className="text-[10px] text-surface-500 line-clamp-1">{item.display_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto self-end md:self-auto">
          <button
            onClick={() => setShowHazardDialog(!showHazardDialog)}
            className="h-12 px-4 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-2xl flex items-center justify-center shadow-xl text-surface-700 dark:text-white hover:border-amber-500 transition-colors font-bold text-sm gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Report Hazard</span>
          </button>
          
          <button
            onClick={toggleSOS}
            className={`h-12 px-5 rounded-2xl flex items-center justify-center shadow-xl font-black text-sm gap-2 transition-all duration-300 ${
              isSOSMode 
                ? "bg-red-600 text-white animate-pulse shadow-red-500/50 scale-105" 
                : "bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/30"
            }`}
          >
            <HeartPulse className="w-5 h-5" />
            <span className="hidden sm:inline">{isSOSMode ? "CANCEL SOS" : "EMERGENCY SOS"}</span>
          </button>
        </div>
      </div>

      {/* Hazard Dialog Overlay */}
      {showHazardDialog && (
        <div className="absolute top-24 left-4 z-[1000] bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl p-4 rounded-3xl border border-amber-500/50 shadow-2xl w-72 pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-amber-500 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Drop Hazard Pin
            </h3>
            <button onClick={() => setShowHazardDialog(false)} className="text-surface-400 hover:text-surface-700 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-surface-600 dark:text-surface-400 mb-3">Click anywhere on the map to place a hazard marker.</p>
          <input 
            type="text" 
            placeholder="Description (e.g. Flooded road)" 
            value={reportDesc} 
            onChange={e => setReportDesc(e.target.value)}
            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs mb-2"
          />
        </div>
      )}

      {/* Custom Map Controls (Outside MapContainer to avoid Leaflet event stealing issues) */}
      <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <button onClick={handleZoomIn} disabled={map ? currentZoom >= map.getMaxZoom() : false} className="w-10 h-10 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"><ZoomIn className="w-4 h-4 text-surface-700 dark:text-surface-300" /></button>
        <button onClick={handleZoomOut} disabled={map ? currentZoom <= map.getMinZoom() : false} className="w-10 h-10 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"><ZoomOut className="w-4 h-4 text-surface-700 dark:text-surface-300" /></button>
        <div className="w-full h-[1px] bg-surface-200 dark:bg-surface-700 my-1" />
        <button onClick={requestLocation} className="w-10 h-10 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"><LocateFixed className="w-4 h-4 text-blue-500" /></button>
        <button onClick={handleRecenter} className="w-10 h-10 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"><Target className="w-4 h-4 text-emerald-500" /></button>
        <button onClick={resetBearing} className="w-10 h-10 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"><Compass className="w-4 h-4 text-surface-700 dark:text-surface-300" /></button>
        <div className="w-full h-[1px] bg-surface-200 dark:bg-surface-700 my-1" />
        <button onClick={handleResetView} className="w-10 h-10 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"><RefreshCw className="w-4 h-4 text-amber-500" /></button>
        <button onClick={toggleFullscreen} className="w-10 h-10 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-700 rounded-xl flex items-center justify-center shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"><Maximize className="w-4 h-4 text-surface-700 dark:text-surface-300" /></button>
      </div>

      {/* Leaflet OpenStreetMap Container */}
      <MapContainer
        ref={setMap}
        center={mapCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <LayersControl position="bottomleft">
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
        </LayersControl>

        <ScaleControl position="bottomleft" imperial={false} />
        
        {/* Click Handler */}
        <MapEventsHandler onClick={handleMapClickForReport} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={getCustomIcon("user")}>
            <Popup className="custom-popup">
              <div className="font-extrabold text-sm">You are here</div>
              <div className="text-[10px] text-surface-500">Live GPS Location</div>
            </Popup>
          </Marker>
        )}

        {/* Places Markers */}
        {allMapPlaces.map(place => (
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
              <div className="font-extrabold text-sm">{place.name}</div>
              <div className="text-[10px] text-surface-500">{place.vicinity}</div>
            </Popup>
          </Marker>
        ))}

        {/* Active Route Polyline */}
        {activeRoute && (
          <Polyline 
            positions={activeRoute.coords} 
            color={isSOSMode ? "#EF4444" : "#10B981"} 
            weight={6} 
            opacity={0.8}
            dashArray={isSOSMode ? "10, 10" : undefined}
          />
        )}
      </MapContainer>

      {/* Selected Place Sheet */}
      {selectedPlace && (
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[1000] bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl p-5 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-2xl pointer-events-auto">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500">
                {selectedPlace.type}
              </span>
              <h3 className="font-extrabold text-base mt-1">{selectedPlace.name}</h3>
            </div>
            <button onClick={() => setSelectedPlace(null)} className="p-1"><X className="w-5 h-5 text-surface-400 hover:text-surface-700 dark:hover:text-white" /></button>
          </div>
          <p className="text-xs text-surface-500 mb-4">{selectedPlace.vicinity}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const origin = userLocation || { lat: mapCenter[0], lng: mapCenter[1] };
                fetchOSRMRoute(origin.lat, origin.lng, selectedPlace.lat, selectedPlace.lng, selectedPlace.name, travelMode);
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Navigation className="w-4 h-4" /> Navigate
            </button>
            {selectedPlace.phone && (
              <a href={`tel:${selectedPlace.phone}`} className="px-4 py-3 bg-surface-100 dark:bg-surface-800 text-emerald-500 font-bold rounded-2xl border border-surface-200 dark:border-surface-700 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Active Route Info Panel */}
      {activeRoute && !selectedPlace && (
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[1000] bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl p-4 rounded-3xl border border-emerald-500/30 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm">
              <Navigation className="w-4 h-4" /> Navigating to {activeRoute.destinationName}
            </div>
            <button onClick={() => setActiveRoute(null)}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="flex-1 bg-emerald-500/10 p-3 rounded-2xl">
              <div className="text-[10px] text-surface-500 font-bold uppercase">Distance</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{activeRoute.distanceKm} km</div>
            </div>
            <div className="flex-1 bg-emerald-500/10 p-3 rounded-2xl">
              <div className="text-[10px] text-surface-500 font-bold uppercase">Est. Time</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{activeRoute.durationMins} min</div>
            </div>
          </div>
          <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
            <button onClick={() => setTravelMode("driving")} className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center ${travelMode === "driving" ? "bg-white dark:bg-surface-700 shadow" : "text-surface-500"}`}><Car className="w-4 h-4" /></button>
            <button onClick={() => setTravelMode("bike")} className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center ${travelMode === "bike" ? "bg-white dark:bg-surface-700 shadow" : "text-surface-500"}`}><Sparkles className="w-4 h-4" /></button>
            <button onClick={() => setTravelMode("foot")} className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center ${travelMode === "foot" ? "bg-white dark:bg-surface-700 shadow" : "text-surface-500"}`}><Users className="w-4 h-4" /></button>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper to handle map clicks
function MapEventsHandler({ onClick }: { onClick: (e: any) => void }) {
  useMapEvents({ click: onClick });
  return null;
}
