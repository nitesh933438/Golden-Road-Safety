import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle, LayerGroup, LayersControl, ScaleControl, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  ShieldAlert, Activity, Shield, MapPin, 
  Search, Loader2, Navigation, PhoneCall, AlertTriangle, X, Building2, AlertCircle, RefreshCw, LocateFixed, Maximize
} from "lucide-react";
import { useTheme } from "./theme/ThemeProvider";

// Default India Center Coordinates
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const INDIA_ZOOM = 5;
const USER_ZOOM = 14;

export interface Place {
  id: string;
  name: string;
  type: "hospital" | "police" | "hazard" | "user" | "search";
  lat: number;
  lng: number;
  vicinity: string;
  phone?: string;
  isOpen?: boolean;
}

// Sample Emergency Hub Services in India
const DEFAULT_INDIA_PLACES: Place[] = [
  { id: "h1", name: "AIIMS Trauma Center & Emergency", type: "hospital", lat: 28.5672, lng: 77.2100, vicinity: "Sri Aurobindo Marg, New Delhi", phone: "108", isOpen: true },
  { id: "h2", name: "Max Super Specialty Emergency Bay", type: "hospital", lat: 28.5283, lng: 77.2185, vicinity: "Press Enclave Marg, Saket", phone: "108", isOpen: true },
  { id: "h3", name: "KEM Hospital & Trauma Care", type: "hospital", lat: 19.0028, lng: 72.8425, vicinity: "Parel, Mumbai", phone: "108", isOpen: true },
  { id: "h4", name: "Apollo Hospitals Emergency Unit", type: "hospital", lat: 13.0604, lng: 80.2496, vicinity: "Greams Lane, Chennai", phone: "108", isOpen: true },
  { id: "p1", name: "Delhi Police Emergency Command Center", type: "police", lat: 28.6292, lng: 77.2197, vicinity: "Jai Singh Marg, Connaught Place", phone: "112", isOpen: true },
  { id: "p2", name: "Mumbai Police Control Room", type: "police", lat: 18.9438, lng: 72.8336, vicinity: "Crawford Market, Fort, Mumbai", phone: "112", isOpen: true },
  { id: "hz1", name: "High Risk Accident Blackspot - Fog Zone", type: "hazard", lat: 28.4595, lng: 77.0266, vicinity: "Delhi-Gurugram Expressway Km 14", isOpen: true },
  { id: "hz2", name: "Oil Spill & Skidding Danger", type: "hazard", lat: 19.0760, lng: 72.8777, vicinity: "Western Express Highway Flyover", isOpen: true },
];

const iconCache: Record<string, L.DivIcon> = {};

// Helper to create custom Leaflet HTML DivIcons to prevent missing marker icon asset bugs in Vite
const createCustomIcon = (type: Place["type"]) => {
  if (iconCache[type]) return iconCache[type];

  let colorBg = "bg-amber-500";
  let iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

  if (type === "user") {
    iconCache[type] = L.divIcon({
      className: "custom-leaflet-user-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-red-500/40 rounded-full animate-ping"></div>
          <div class="w-7 h-7 bg-red-600 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    return iconCache[type];
  }

  if (type === "hospital") {
    colorBg = "bg-red-600 border-red-100";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6"/></svg>`;
  } else if (type === "police") {
    colorBg = "bg-blue-600 border-blue-100";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;
  } else if (type === "search") {
    colorBg = "bg-purple-600 border-purple-100";
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
  }

  iconCache[type] = L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="p-2 rounded-2xl border-2 shadow-xl flex items-center justify-center transition-transform hover:scale-125 ${colorBg}">
        ${iconSvg}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  return iconCache[type];
};

// Component to programmatically re-center Leaflet Map safely without _leaflet_pos runtime errors
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map && (map as any)._loaded && map.getContainer() && center && center[0] && center[1]) {
      try {
        map.flyTo(center, zoom, { duration: 1.2 });
      } catch (err) {
        console.warn("flyTo safely handled:", err);
      }
    }
    return () => {
      try { if (map) map.stop(); } catch (err) {}
    };
  }, [center, zoom, map]);
  return null;
}

// Map Resizer to ensure map recalculates container dimensions on mount
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (map && map.getContainer()) {
        try {
          map.invalidateSize();
        } catch (err) {
          console.warn("invalidateSize safely handled:", err);
        }
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Component to handle user click on map
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
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
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlsRef.current) {
      // L.DomEvent.disableClickPropagation(controlsRef.current);
      L.DomEvent.disableScrollPropagation(controlsRef.current);
    }
  }, []);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const container = map.getContainer();
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen().catch(() => {});
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {}
  };

  const resetBearing = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if ((map as any).setBearing) {
        (map as any).setBearing(0);
      }
      map.setView(map.getCenter(), map.getZoom());
    } catch (err) {}
  };

  const handleLocateMe = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLocateMe();
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { 
      if (map.getZoom() < map.getMaxZoom()) map.zoomIn(); 
    } catch (err) {}
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { 
      if (map.getZoom() > map.getMinZoom()) map.zoomOut(); 
    } catch (err) {}
  };

  const isMaxZoom = map.getZoom() >= map.getMaxZoom();
  const isMinZoom = map.getZoom() <= map.getMinZoom();

  return (
    <div ref={controlsRef} className="leaflet-top leaflet-right mt-24 mr-2.5 flex flex-col gap-2 z-[1000] pointer-events-auto">
      <button
        type="button"
        onPointerDownCapture={handleZoomIn} onClickCapture={handleZoomIn}
        disabled={isMaxZoom}
        className={`w-[34px] h-[34px] bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded flex items-center justify-center shadow-md transition-colors ${
          isMaxZoom ? "opacity-40 cursor-not-allowed text-surface-400" : "hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300"
        }`}
        title="Zoom In"
      >
        <span className="text-lg font-bold leading-none">+</span>
      </button>

      <button
        type="button"
        onPointerDownCapture={handleZoomOut} onClickCapture={handleZoomOut}
        disabled={isMinZoom}
        className={`w-[34px] h-[34px] bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded flex items-center justify-center shadow-md transition-colors ${
          isMinZoom ? "opacity-40 cursor-not-allowed text-surface-400" : "hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300"
        }`}
        title="Zoom Out"
      >
        <span className="text-lg font-bold leading-none">-</span>
      </button>
      
      <div className="w-full h-[1px] bg-surface-200 dark:bg-surface-700 my-1" />

      <button
        type="button"
        onPointerDownCapture={toggleFullscreen} onClickCapture={toggleFullscreen}
        className="w-[34px] h-[34px] bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 shadow-md text-surface-700 dark:text-surface-300 transition-colors"
        title="Toggle Fullscreen"
      >
        <Maximize className="w-4 h-4" />
      </button>
      <button
        type="button"
        onPointerDownCapture={resetBearing} onClickCapture={resetBearing}
        className="w-[34px] h-[34px] bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 shadow-md text-surface-700 dark:text-surface-300 transition-colors"
        title="Reset Compass (North)"
      >
        <Navigation className="w-4 h-4" style={{ transform: 'rotate(45deg)' }} />
      </button>
      <button
        type="button"
        onPointerDownCapture={handleLocateMe} onClickCapture={handleLocateMe}
        className="w-[34px] h-[34px] bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 shadow-md text-blue-600 dark:text-blue-400 transition-colors"
        title="My Location"
      >
        <LocateFixed className="w-4 h-4" />
      </button>
    </div>
  );
}

export function InteractiveFallbackMap({ 
  userLocation,
  onMarkerSelect
}: { 
  userLocation?: { lat: number; lng: number } | null;
  onMarkerSelect?: (place: any) => void;
}) {
  const { theme } = useTheme();
  
  // States
  const [mapCenter, setMapCenter] = useState<[number, number]>(INDIA_CENTER);
  const [zoomLevel, setZoomLevel] = useState<number>(INDIA_ZOOM);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(userLocation || null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [places, setPlaces] = useState<Place[]>(DEFAULT_INDIA_PLACES);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch Real Places via Overpass API
  const fetchRealPlaces = async (lat: number, lng: number) => {
    try {
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
      
      const realPlaces: Place[] = overpassData.elements
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
            vicinity: el.tags?.["addr:full"] || el.tags?.["addr:street"] || el.tags?.["addr:city"] || "Local Area",
            phone: el.tags?.phone || "112",
            isOpen: true,
          };
      });

      if (realPlaces.length > 0) {
        setPlaces(prev => {
          const customPlaces = prev.filter(p => p.type !== "hospital" && p.type !== "police");
          const uniquePlaces = new Map();
          [...customPlaces, ...realPlaces].forEach(p => uniquePlaces.set(p.id, p));
          return Array.from(uniquePlaces.values());
        });
      }
    } catch (err) {
      console.warn("Failed to fetch real places from Overpass API", err);
    }
  };

  // Handle Geolocation Request
  const requestUserLocation = () => {
    setIsLoading(true);
    setGeoError(null);

    if (!navigator.onLine) {
      setGeoError("Offline mode: showing cached map.");
      setMapCenter(INDIA_CENTER);
      setZoomLevel(INDIA_ZOOM);
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError("Location access is disabled. You can still search places or enable location later.");
      setMapCenter(INDIA_CENTER);
      setZoomLevel(INDIA_ZOOM);
      setIsLoading(false);
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    let initialFetch = true;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocationAccuracy(pos.coords.accuracy);
        
        if (initialFetch) {
          setMapCenter([coords.lat, coords.lng]);
          setZoomLevel(USER_ZOOM);
          fetchRealPlaces(coords.lat, coords.lng);
          setIsLoading(false);
          initialFetch = false;
        }
      },
      (err) => {
        console.warn("Geolocation Error Code:", err.code, err.message);
        if (initialFetch) {
          if (!navigator.onLine) {
            setGeoError("Offline mode: showing cached map.");
          } else if (err.code === err.PERMISSION_DENIED) {
            setGeoError("Location access is disabled. You can still search places or enable location later.");
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            setGeoError("Position unavailable. You can still search places or enable location later.");
          } else if (err.code === err.TIMEOUT) {
            setGeoError("Location request timed out. You can still search places or enable location later.");
          } else {
            setGeoError("Location access is disabled. You can still search places or enable location later.");
          }
          setMapCenter(INDIA_CENTER);
          setZoomLevel(INDIA_ZOOM);
          setIsLoading(false);
          initialFetch = false;
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
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
  }, [geoError]);

  useEffect(() => {
    if (userLocation) {
      setUserCoords(userLocation);
      setMapCenter([userLocation.lat, userLocation.lng]);
      setZoomLevel(USER_ZOOM);
      fetchRealPlaces(userLocation.lat, userLocation.lng);
      setIsLoading(false);
    } else {
      requestUserLocation();
    }
  }, [userLocation]);

  // Handle Nominatim Location Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Failed to search OpenStreetMap:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    const newPlace: Place = {
      id: `search-${Date.now()}`,
      name: result.display_name.split(",")[0] || "Searched Location",
      type: "search",
      lat,
      lng,
      vicinity: result.display_name,
      isOpen: true
    };

    setPlaces(prev => [newPlace, ...prev]);
    setSelectedPlace(newPlace);
    setMapCenter([lat, lng]);
    setZoomLevel(13);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Map Click Handler to select location
  const handleMapClick = (lat: number, lng: number) => {
    const clickedPlace: Place = {
      id: `click-${Date.now()}`,
      name: `Pinned Emergency Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      type: "hazard",
      lat,
      lng,
      vicinity: "User Selected Point on Map",
      isOpen: true
    };
    setSelectedPlace(clickedPlace);
    if (onMarkerSelect) onMarkerSelect(clickedPlace);
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-surface-900 overflow-hidden rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xl flex flex-col select-none">
      
      {/* Search Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pointer-events-none">
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative pointer-events-auto flex-1 max-w-md">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search city, hospital, or street in India..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 dark:bg-surface-900/95 backdrop-blur-md text-surface-900 dark:text-white pl-10 pr-10 py-3 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <Search className="w-4 h-4 text-surface-400 absolute left-3.5" />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-amber-500 absolute right-3.5 animate-spin" />
            ) : searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                className="absolute right-3.5 text-surface-400 hover:text-surface-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Autocomplete Results */}
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

        {/* GPS Recenter & Status Action */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={requestUserLocation}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-900 dark:text-white text-xs font-bold rounded-2xl border border-surface-200 dark:border-surface-700 shadow-xl transition-all"
            title="Locate My GPS Position"
          >
            <Navigation className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">My GPS</span>
          </button>
        </div>
      </div>

      {/* Geolocation Error / Warning Banner */}
      {geoError && (
        <div className="absolute top-20 left-4 right-4 z-[1000] max-w-lg mx-auto bg-amber-500/95 backdrop-blur-md text-surface-950 px-4 py-3 rounded-2xl shadow-xl border border-amber-400 flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{geoError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setGeoError(null);
                requestUserLocation();
              }}
              className="px-2.5 py-1 bg-surface-950 text-white rounded-xl text-[11px] font-extrabold hover:bg-surface-800 transition-colors shadow-sm"
            >
              Enable Location
            </button>
            <button 
              onClick={() => setGeoError(null)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[1001] bg-surface-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-xs font-bold tracking-wider uppercase text-surface-300">Initializing OpenStreetMap Hub...</p>
        </div>
      )}

      {/* Locate Me Button */}
      <div className="absolute bottom-6 left-4 z-[1000] pointer-events-auto">
        <button
          onClick={requestUserLocation}
          className="bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl text-surface-900 dark:text-white p-3 rounded-2xl shadow-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          title="Go to Current Location"
        >
          <LocateFixed className="w-6 h-6 text-amber-500" />
        </button>
      </div>

      {/* Leaflet React Map Component */}
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={zoomLevel} />
        <MapResizer />
        <MapClickHandler onClick={handleMapClick} />
        <MapCustomControls onLocateMe={requestUserLocation} />

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

        <ScaleControl position="bottomleft" imperial={false} />

        {/* User GPS Location Marker */}
        {userCoords && (
          <LayerGroup>
            {locationAccuracy && (
              <Circle
                center={[userCoords.lat, userCoords.lng]}
                radius={locationAccuracy}
                pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 1 }}
              />
            )}
            <Marker 
              position={[userCoords.lat, userCoords.lng]} 
              icon={createCustomIcon("user")}
            >
              <Popup>
                <div className="p-1 text-center">
                  <span className="font-bold text-xs text-red-600 block">Your Current Location</span>
                  <span className="text-[10px] text-gray-500 block mb-1">Emergency Dispatch Ready</span>
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

        {/* Emergency Places Markers */}
        <LayerGroup>
          {places.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createCustomIcon(place.type)}
              eventHandlers={{
                click: () => {
                  setSelectedPlace(place);
                  if (onMarkerSelect) onMarkerSelect(place);
                }
              }}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="font-bold text-xs block text-surface-900">{place.name}</span>
                  <span className="text-[10px] text-surface-500 block">{place.vicinity}</span>
                  {place.phone && (
                    <a href={`tel:${place.phone}`} className="inline-block px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[10px] mt-1">
                      Call {place.phone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      </MapContainer>

      {/* Selected Marker Action Card */}
      {selectedPlace && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] max-w-md mx-auto bg-white/95 dark:bg-surface-900/95 backdrop-blur-md text-surface-900 dark:text-white p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                {selectedPlace.type}
              </span>
              <h3 className="font-extrabold text-base mt-1 leading-snug">{selectedPlace.name}</h3>
            </div>
            <button 
              onClick={() => setSelectedPlace(null)}
              className="text-surface-400 hover:text-surface-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-surface-500 dark:text-surface-300 mb-4">{selectedPlace.vicinity}</p>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                let url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=`;
                if (userCoords) {
                  url += `${userCoords.lat}%2C${userCoords.lng}%3B`;
                }
                url += `${selectedPlace.lat}%2C${selectedPlace.lng}`;
                window.open(url, "_blank");
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Navigate Route
            </button>
            {selectedPlace.phone && (
              <a 
                href={`tel:${selectedPlace.phone}`}
                className="px-4 py-2.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-surface-200 dark:border-surface-700 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                Call Emergency
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
