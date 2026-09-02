import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle, LayerGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { 
  ShieldAlert, Activity, Shield, MapPin, 
  Search, Loader2, Navigation, PhoneCall, AlertTriangle, X, Building2, AlertCircle, RefreshCw, LocateFixed, Maximize
} from "lucide-react";
import { useTheme } from "./theme/ThemeProvider";
import { getApiUrl, fetchWithRetry, RateLimitError } from "../lib/api";

// In-memory cache for Overpass places to prevent duplicate requests & 429 rate limit errors
const overpassPlacesCache = new Map<string, Place[]>();

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

// Empty initialization - no fake data
const DEFAULT_INDIA_PLACES: Place[] = [];

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

  // Fetch Real Places via Overpass API (with cache to prevent repeated 429 rate limit errors)
  const fetchRealPlaces = async (lat: number, lng: number) => {
    if (!lat || !lng) return;
    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    
    // Check in-memory cache first
    if (overpassPlacesCache.has(cacheKey)) {
      const cachedPlaces = overpassPlacesCache.get(cacheKey)!;
      setPlaces(prev => {
        const customPlaces = prev.filter(p => p.type !== "hospital" && p.type !== "police");
        const uniquePlaces = new Map();
        [...customPlaces, ...cachedPlaces].forEach(p => uniquePlaces.set(p.id, p));
        return Array.from(uniquePlaces.values());
      });
      return;
    }

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
      const overpassRes = await fetchWithRetry("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
        maxRetries: 1,
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
        overpassPlacesCache.set(cacheKey, realPlaces);
        setPlaces(prev => {
          const customPlaces = prev.filter(p => p.type !== "hospital" && p.type !== "police");
          const uniquePlaces = new Map();
          [...customPlaces, ...realPlaces].forEach(p => uniquePlaces.set(p.id, p));
          return Array.from(uniquePlaces.values());
        });
      }
    } catch (err: any) {
      console.warn("Overpass API notice (safely handled):", err?.message || err);
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
  }, [userLocation?.lat, userLocation?.lng]);

  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle Nominatim Location Search (Debounced & Rate-limit Safe)
  const searchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 450);

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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          signal: controller.signal,
          maxRetries: 1,
          cacheTtlMs: 300000 // Cache for 5 mins
        }
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (err instanceof RateLimitError || err?.status === 429) {
          setSearchError("Search rate limit reached. Please wait a moment before searching again.");
        } else {
          console.warn("Location search notice:", err?.message || err);
          setSearchError("Search service temporarily unavailable.");
        }
      }
    } finally {
      if (searchControllerRef.current === controller) {
        setIsSearching(false);
      }
    }
  };

  const selectSearchResult = (result: any) => {
    setHasSearched(false);
    setSearchError(null);
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
    setZoomLevel(15);
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


      {/* Leaflet React Map Component */}
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        minZoom={3}
        maxZoom={20}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={zoomLevel} />
        <MapResizer />
        <MapClickHandler onClick={handleMapClick} />

        <TileLayer
          attribution={theme === 'dark' ? '&copy; <a href="https://carto.com/">CARTO</a>' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
          url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          maxZoom={19}
        />

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

    </div>
  );
}
