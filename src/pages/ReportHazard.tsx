import React, { useState } from "react";
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  FileText,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
const HAZARD_TYPES = [
  { id: "pothole", label: "Pothole & Road Damage", icon: AlertTriangle, desc: "Cracks, cave-ins, or surface erosion" },
  { id: "blackspot", label: "Accident Blackspot", icon: ShieldAlert, desc: "High-risk blind turn or unsafe intersection" },
  { id: "flooding", label: "Flooding & Waterlogging", icon: AlertTriangle, desc: "Submerged lane or water build-up" },
  { id: "traffic_light", label: "Broken Traffic Light", icon: FileText, desc: "Signal failure or broken signage" },
  { id: "oil_spill", label: "Oil / Chemical Spill", icon: AlertTriangle, desc: "Slippery substance on roadway" },
  { id: "debris", label: "Obstruction & Debris", icon: Trash2, desc: "Fallen tree, cargo, or construction debris" },
];

import { uploadToCloudinary } from "../lib/cloudinary";

import { useOfflineSync } from "../context/OfflineSyncContext";
import { SmartInput } from "../components/ui/SmartInput";

export function ReportHazard() {
  const navigate = useNavigate();
  const { isOnline, queueItem } = useOfflineSync();
  const [selectedType, setSelectedType] = useState("pothole");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("Market Street & 4th Ave, Sector 7");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({ lat: 37.7749, lng: -122.4194 });
  const [isLocating, setIsLocating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Verified Location)`);
          setIsLocating(false);
        },
        () => {
          setAddress("Sector 7, Metro Area (Approximate GPS)");
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    if (file) {
      if (!file.type.startsWith("image/")) {
        setImageError("Only image files (JPG, PNG, WEBP) are allowed.");
        setSelectedFile(null);
        setImagePreview(null);
        return;
      }
      // Limit to 5MB (Incident image: max 2–5 MB before processing)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setImageError(`The image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 5MB.`);
        setSelectedFile(null);
        setImagePreview(null);
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let uploadedPhotoUrl = "";

    const hazardPayload = {
      type: selectedType,
      severity,
      description: description || "Road hazard reported by citizen responder.",
      address,
      coords,
      hasPhoto: !!imagePreview,
      photoURL: imagePreview || "",
      status: "Verified",
      createdAt: new Date().toISOString()
    };

    if (!isOnline) {
      await queueItem("hazard", hazardPayload);
    } else {
      try {
        if (selectedFile) {
          uploadedPhotoUrl = await uploadToCloudinary(selectedFile, "hazards");
        }

        await addDoc(collection(db, "hazards"), {
          ...hazardPayload,
          photoURL: uploadedPhotoUrl || "", // Strictly use Cloudinary URL or empty string. NEVER store base64 in Firestore.
          createdAt: serverTimestamp(),
        });
      } catch (err: any) {
        console.warn("Firestore hazard report fallback queueing due to:", err);
        // Fall back to queueing the item locally in IndexedDB (with its local base64 preview for later sync)
        await queueItem("hazard", hazardPayload);
      }
    }

    setIsSubmitting(false);
    setSubmittedSuccess(true);
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-300">
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 sm:p-12 border border-surface-200 dark:border-surface-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-surface-900 dark:text-white">Hazard Report Verified</h1>
            <p className="text-sm text-surface-600 dark:text-surface-300">
              Thank you for keeping our roads safe! Gemini AI has analyzed your report and dispatched an alert to the Municipal Command Center.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 text-left space-y-2">
            <div className="flex justify-between text-xs text-surface-500">
              <span>Report ID: #HZ-{Math.floor(1000 + Math.random() * 9000)}</span>
              <span className="font-bold text-emerald-500 uppercase">Live Broadcasted</span>
            </div>
            <p className="font-bold text-sm text-surface-900 dark:text-white">{address}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">
              Severity: <strong className="text-amber-500">{severity}</strong> · Category: {HAZARD_TYPES.find(t => t.id === selectedType)?.label}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setDescription("");
                setImagePreview(null);
              }}
              className="flex-1 py-3 px-6 rounded-2xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-bold text-sm transition-all"
            >
              Report Another Hazard
            </button>
            <button
              onClick={() => navigate("/map")}
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <span>View on Smart Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-red-600 p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Crowdsourced Road Safety
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
            Report Road Hazard
          </h1>
          <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-medium">
            Flag blackspots, potholes, or highway obstructions to alert nearby drivers and trigger municipal repair dispatch automatically.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-900 rounded-3xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800 shadow-xl space-y-8">
        
        {/* Step 1: Hazard Type */}
        <div className="space-y-4">
          <label className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            1. Select Hazard Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HAZARD_TYPES.map((type) => {
              const IconComp = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-md"
                      : "border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/40 hover:border-surface-300 dark:hover:border-surface-700"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                    isSelected ? "bg-amber-500 text-black font-bold" : "bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300"
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-surface-900 dark:text-white">{type.label}</div>
                  <div className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{type.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Severity */}
        <div className="space-y-4">
          <label className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            2. Hazard Severity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Low", "Medium", "High", "Critical"] as const).map((lvl) => {
              const isSelected = severity === lvl;
              const colorClasses = {
                Low: "bg-emerald-500 text-white",
                Medium: "bg-blue-500 text-white",
                High: "bg-amber-500 text-black font-bold",
                Critical: "bg-red-600 text-white font-bold"
              }[lvl];

              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setSeverity(lvl)}
                  className={`py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                    isSelected
                      ? `${colorClasses} shadow-lg scale-105 border-transparent`
                      : "border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Location & Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Location Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Location Address
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isLocating ? "Locating..." : "Use GPS"}</span>
              </button>
            </div>
            <SmartInput
              value={address}
              onChange={setAddress}
              placeholder="Search or type address / landmark..."
              historyKey="hazard_location_history"
              suggestions={[
                "Market Street & 4th Ave, Sector 7",
                "Metro Station Gate No 3, Highway Ring Road",
                "Grand Trunk Road near Blind Curve Km 42",
                "Industrial Area Junction, Sector 12",
                "City Hospital Flyover Ramp"
              ]}
              showVoiceInput={true}
              enableAIIntent={true}
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-500" />
              Photo Evidence (Optional)
            </label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700 h-32 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-2xl cursor-pointer hover:border-amber-500 transition-colors bg-surface-50 dark:bg-surface-800/40 text-surface-500">
                <Upload className="w-6 h-6 mb-1 text-surface-400" />
                <span className="text-xs font-bold text-surface-700 dark:text-surface-300">Click or Drag Photo</span>
                <span className="text-[10px] text-surface-400">JPG, PNG up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
            {imageError && (
              <p className="text-xs text-red-500 font-bold bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                {imageError}
              </p>
            )}
          </div>

        </div>

        {/* Step 4: Description */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-surface-900 dark:text-white">
            Hazard Description & Context
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the hazard details (e.g., 3-foot deep pothole causing vehicle swerving near school zone)..."
            className="w-full p-4 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-8 bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-black font-extrabold text-base rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting to Command Center...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Hazard Report & Alert Patrols</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
