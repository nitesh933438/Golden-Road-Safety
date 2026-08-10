import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, AlertCircle, MapPin, Edit3, ShieldAlert, HeartPulse, 
  Flame, Shield, Wrench, Info, CheckCircle2, Clock, Map, Activity, Phone, FileText, Download, User, Volume2, VolumeX, BookOpen
} from "lucide-react";
import { addDoc, collection, onSnapshot, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Components for different views
import { LiveEmergencyMap } from "./LiveEmergencyMap";
import { EmergencyCallBanner } from "./EmergencyCallBanner";
import { triggerEmergencyCall, triggerEmergencySMS, generateSOSMessage, TEST_EMERGENCY_NUMBER } from "../lib/emergencyCall";
import { useAuth } from "../context/AuthContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { getApiUrl } from "../lib/api";

export function EmergencySheet({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [step, setStep] = useState<"setup" | "active" | "summary">("setup");
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  
  // Setup State
  const [type, setType] = useState("Road Accident");
  const [severity, setSeverity] = useState("Critical");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("Locating...");
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sosError, setSosError] = useState<string | null>(null);

  // Active State
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timelineProgress, setTimelineProgress] = useState(0);

  const handleSpeakGuidance = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingSpeech) {
        window.speechSynthesis.cancel();
        setIsPlayingSpeech(false);
        return;
      }
      const text = `Emergency guidance active for ${type}. Ensure your safety first. Call 911 if not already connected. Check for responsiveness, apply direct pressure for bleeding, and stay on scene until first responders arrive.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingSpeech(false);
      utterance.onerror = () => setIsPlayingSpeech(false);
      setIsPlayingSpeech(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Voice Guidance: Based on ${type}, ensure scene safety first. If there is severe bleeding, apply direct pressure immediately.`);
    }
  };

  useEffect(() => {
    if (isOpen && step === "setup") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lng: longitude });
            setLocationError(null);
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Approximate Location)`);
          },
          (err) => {
            console.error("GPS Error:", err);
            setLocationError("Location permission is unavailable.");
            setLocation("Location permission is unavailable.");
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setLocationError("Location permission is unavailable.");
        setLocation("Location permission is unavailable.");
      }
    }
  }, [isOpen, step]);

  useEffect(() => {
    let interval: any;
    if (step === "active") {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        if (timelineProgress < 8) {
          // Simulate timeline progression every 3 seconds
          setTimelineProgress(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timelineProgress]);

  const handleSendSOS = async () => {
    const sosMsg = generateSOSMessage({
      userName: userProfile?.name || "GoldenGuard Test User",
      coords,
    });

    let smsStatus = "PENDING";
    let backendResult: any = null;

    try {
      const response = await fetch(getApiUrl("/api/emergency/sos"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: TEST_EMERGENCY_NUMBER,
          latitude: coords ? coords.lat : "Location unavailable",
          longitude: coords ? coords.lng : "Location unavailable",
          timestamp: new Date().toISOString(),
          message: sosMsg,
        }),
      });
      const text = await response.text();
      if (text) {
        try {
          backendResult = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse SOS response:", text);
        }
      }
      smsStatus = response.ok && backendResult?.success ? "SENT" : "FAILED";
    } catch (err) {
      console.error("Backend SOS request failed:", err);
      smsStatus = "FAILED";
    }

    try {
      const uniqueSosId = "sos_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
      const record = {
        id: uniqueSosId,
        userId: userProfile?.uid || "anonymous",
        type,
        severity,
        priority: severity || "CRITICAL",
        notes,
        location: coords || "Location unavailable",
        latitude: coords ? coords.lat : null,
        longitude: coords ? coords.lng : null,
        accuracy: coords ? (coords as any).accuracy || null : null,
        locationSource: "GPS",
        address: location,
        emergencyContact: TEST_EMERGENCY_NUMBER,
        status: "CREATED",
        smsStatus,
        emergencyType: type,
        timeline: [
          "Location Captured", 
          "Emergency Incident Created", 
          `Backend SOS SMS Status: ${smsStatus}`
        ],
      };

      await setDoc(doc(db, "emergencies", uniqueSosId), {
        ...record,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setEmergencyId(uniqueSosId);
      setStep("active");
      setTimelineProgress(2);
    } catch (error) {
      console.error("Error creating emergency in Firestore:", error);
      setSosError("SOS failed to synchronize. Network or permissions error.");
    }
  };

  const handleEndEmergency = () => {
    setStep("summary");
  };

  const downloadPDF = () => {
    const element = document.getElementById("summary-report");
    if (element) {
      html2canvas(element, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Rescue_Summary_${emergencyId}.pdf`);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-4xl bg-surface-50 dark:bg-surface-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 border border-surface-200 dark:border-surface-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-surface-200 dark:border-surface-800 bg-white/50 dark:bg-surface-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                {step === "setup" && "Emergency SOS"}
                {step === "active" && "Active Emergency"}
                {step === "summary" && "Rescue Summary"}
              </h2>
              {step === "active" && emergencyId && (
                <p className="text-xs font-mono text-surface-500">ID: {emergencyId}</p>
              )}
            </div>
          </div>
          {step !== "active" && (
            <button onClick={onClose} className="p-2 text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          
          {/* STEP 1: SETUP */}
          {step === "setup" && (
            <div className="space-y-8 max-w-2xl mx-auto">
              
              {/* Location */}
              <div className="bg-white dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm flex gap-4 items-start">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white mb-1">Current Location</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400">{location}</p>
                </div>
              </div>

              {/* Emergency Type */}
              <div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-white mb-3">Emergency Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Road Accident", icon: AlertCircle },
                    { label: "Medical", icon: HeartPulse },
                    { label: "Fire", icon: Flame },
                    { label: "Women Safety", icon: Shield },
                    { label: "Vehicle Breakdown", icon: Wrench },
                    { label: "Other", icon: Info },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setType(t.label)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        type === t.label 
                          ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400" 
                          : "border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:border-red-200 dark:hover:border-red-900"
                      }`}
                    >
                      <t.icon className="w-6 h-6" />
                      <span className="text-xs font-bold text-center">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-white mb-3">Severity Level</h3>
                <div className="flex gap-2 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
                  {["Critical", "High", "Medium", "Low"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSeverity(level)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                        severity === level 
                          ? level === "Critical" ? "bg-red-600 text-white shadow-md"
                          : level === "High" ? "bg-amber-500 text-white shadow-md"
                          : level === "Medium" ? "bg-blue-500 text-white shadow-md"
                          : "bg-emerald-500 text-white shadow-md"
                          : "text-surface-500 hover:text-surface-900 dark:hover:text-white"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Additional Notes (Optional)
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., 2 people injured, severe bleeding..."
                  className="w-full p-4 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl resize-none h-24 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>

            </div>
          )}

          {/* STEP 2: ACTIVE EMERGENCY */}
          {step === "active" && (
            <div className="space-y-6">
              {/* Prominent Emergency Call Action Banner */}
              <EmergencyCallBanner 
                coords={coords} 
                locationError={locationError} 
                userName={userProfile?.name || "GoldenGuard Test User"}
                onCancel={() => setStep("setup")} 
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Timeline & Status */}
                <div className="lg:col-span-1 space-y-6 flex flex-col">
                
                {/* Stats */}
                <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 shadow-sm grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">Time Elapsed</div>
                    <div className="text-2xl font-bold text-surface-900 dark:text-white font-mono">
                      {Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:
                      {(timeElapsed % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Golden Hour</div>
                    <div className="text-2xl font-bold text-amber-500 font-mono">
                      {Math.floor((3600 - timeElapsed) / 60).toString().padStart(2, '0')}:
                      {((3600 - timeElapsed) % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Responders */}
                <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">Live Response</h3>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500"/> Volunteers</div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">ETA: 4 mins</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-red-500"/> Ambulance</div>
                    <span className="font-bold text-red-600 dark:text-red-400">ETA: 9 mins</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500"/> Police</div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">ETA: 12 mins</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 shadow-sm flex-1 overflow-y-auto">
                   <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-4">Emergency Timeline</h3>
                   <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2.5 before:w-0.5 before:bg-surface-200 dark:before:bg-surface-700">
                     {[
                       "Location Captured",
                       "Emergency Created",
                       "Nearby Volunteers Notified",
                       "Nearby Hospitals Notified",
                       "Police Alert Sent",
                       "Emergency Contacts Notified",
                       "AI First Aid Started",
                       "Waiting for Response"
                     ].map((item, idx) => (
                       <div key={idx} className={`relative pl-8 transition-opacity duration-500 ${idx <= timelineProgress ? 'opacity-100' : 'opacity-30'}`}>
                         <div className={`absolute left-0 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                           idx < timelineProgress ? 'bg-green-500 text-white' : 
                           idx === timelineProgress ? 'bg-blue-500 text-white animate-pulse' : 'bg-surface-200 dark:bg-surface-700 text-transparent'
                         }`}>
                           {idx < timelineProgress && <CheckCircle2 className="w-3 h-3" />}
                         </div>
                         <div className={`text-sm ${idx === timelineProgress ? 'font-bold text-surface-900 dark:text-white' : 'font-medium text-surface-600 dark:text-surface-400'}`}>
                           {item}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

              </div>

              {/* Right Side: Map & AI */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Live Map */}
                <div className="h-64 sm:h-80 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-sm relative">
                  <LiveEmergencyMap userCoords={coords} />
                </div>

                {/* AI First Aid & Contacts & Good Samaritan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  
                  {/* AI First Aid */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-5 text-white shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <HeartPulse className="w-5 h-5 text-blue-200" />
                      <h3 className="font-bold">AI First Aid</h3>
                    </div>
                    <p className="text-sm text-blue-100 mb-4 flex-1">
                      Based on "{type}", please ensure scene safety first. If there is severe bleeding, apply direct pressure immediately.
                    </p>
                    <div className="space-y-2 mt-auto">
                      <button 
                        onClick={handleSpeakGuidance}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between px-3"
                      >
                        <span className="flex items-center gap-2">
                          {isPlayingSpeech ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-white" />}
                          {isPlayingSpeech ? "Stop Voice Guidance" : "Play Voice Guidance"}
                        </span>
                      </button>
                      <button 
                        onClick={() => {
                          onClose();
                          navigate("/first-aid");
                        }}
                        className="w-full py-2 bg-white text-indigo-900 hover:bg-blue-50 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        View Step-by-Step Guide
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Emergency Contacts */}
                    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Phone className="w-4 h-4 text-surface-500" />
                        <h3 className="text-sm font-bold text-surface-900 dark:text-white">Emergency Contacts</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-surface-600 dark:text-surface-400">Wife (Sarah)</span>
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">Viewed</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-surface-600 dark:text-surface-400">Brother (Mike)</span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Good Samaritan */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-4 shadow-sm flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Good Samaritan Law</h3>
                        </div>
                        <p className="text-xs text-emerald-800 dark:text-emerald-200/80 leading-relaxed">
                          You are legally protected when providing reasonable emergency assistance.
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowRightsModal(true)}
                        className="mt-3 py-1.5 w-full bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800/40 dark:hover:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        Know Your Rights
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
          )}

          {/* STEP 3: POST EMERGENCY SUMMARY */}
          {step === "summary" && (
            <div className="max-w-3xl mx-auto py-8">
              <div id="summary-report" className="bg-white dark:bg-surface-800 p-8 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-xl space-y-8">
                
                <div className="text-center border-b border-surface-200 dark:border-surface-700 pb-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Emergency Resolved</h1>
                  <p className="text-surface-500">ID: {emergencyId}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-wider text-surface-500 mb-1">Time & Duration</h4>
                    <p className="font-semibold text-surface-900 dark:text-white">
                      {Math.floor(timeElapsed / 60)} mins {timeElapsed % 60} secs
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-bold mt-1">
                      Golden Hour Saved!
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-wider text-surface-500 mb-1">Location</h4>
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">
                      {location}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-wider text-surface-500 mb-1">Type</h4>
                    <p className="font-semibold text-surface-900 dark:text-white">
                      {type} ({severity})
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-wider text-surface-500 mb-1">Responders</h4>
                    <p className="font-semibold text-surface-900 dark:text-white">
                      2 Volunteers, 1 Ambulance
                    </p>
                  </div>
                </div>

                <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                   <h4 className="text-xs uppercase font-bold tracking-wider text-surface-500 mb-2">AI Post-Analysis</h4>
                   <p className="text-sm text-surface-700 dark:text-surface-300">
                     Response time was 42% faster than regional average. Immediate compression application suggested by AI First Aid prevented severe blood loss.
                   </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-surface-200 dark:border-surface-800 bg-white/50 dark:bg-surface-900/50 backdrop-blur-md flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          {step === "setup" && (
            <>
              {sosError && (
                <div className="flex-1 text-red-500 text-sm font-bold flex items-center mb-2 sm:mb-0">
                  {sosError}
                </div>
              )}
              <button
                onClick={handleSendSOS}
                className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-6 h-6" />
                SEND SOS NOW
              </button>
            </>
          )}

          {step === "active" && (
            <button
              onClick={handleEndEmergency}
              className="w-full sm:w-auto px-8 py-3 bg-surface-900 dark:bg-white text-white dark:text-surface-900 hover:bg-surface-800 dark:hover:bg-surface-100 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark as Resolved
            </button>
          )}

          {step === "summary" && (
            <>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-surface-200 dark:bg-surface-800 text-surface-900 dark:text-white hover:bg-surface-300 dark:hover:bg-surface-700 rounded-xl font-bold transition-all"
              >
                Close
              </button>
              <button
                onClick={downloadPDF}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </>
          )}
        </div>

      </div>

      {/* Good Samaritan Legal Rights Modal */}
      {showRightsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-surface-900 dark:text-white">Good Samaritan Protection</h3>
                  <p className="text-xs text-surface-500">Legal immunity under Supreme Court Guidelines & Road Safety Act</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRightsModal(false)}
                className="p-2 text-surface-400 hover:text-surface-900 dark:hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-surface-600 dark:text-surface-300">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed font-medium">
                <strong>Key Provision:</strong> Any bystander who renders emergency medical or non-medical care at the scene of an accident shall not be liable for civil or criminal proceedings.
              </div>
              <ul className="space-y-2 list-disc list-inside text-xs">
                <li><strong>No Police Harassment:</strong> Police cannot compel a Good Samaritan to disclose identity or testify.</li>
                <li><strong>Hospital Duty:</strong> Hospitals are mandated to provide immediate trauma care without delaying for payment or police registration.</li>
                <li><strong>Voluntary Witness:</strong> Giving statements to law enforcement remains entirely voluntary.</li>
                <li><strong>Golden Hour Reward:</strong> Qualified assistance is eligible for civic awards and responder certification.</li>
              </ul>
            </div>

            <button
              onClick={() => setShowRightsModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20"
            >
              Understand & Return to Rescue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
