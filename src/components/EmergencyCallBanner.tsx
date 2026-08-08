import React, { useState } from "react";
import { Phone, PhoneCall, MessageSquare, Copy, Check, AlertTriangle, MapPin, X, ShieldAlert, Monitor, ExternalLink, Loader2 } from "lucide-react";
import { 
  TEST_EMERGENCY_NUMBER, 
  TEST_EMERGENCY_LABEL, 
  triggerEmergencyCall, 
  triggerEmergencySMS,
  generateSOSMessage, 
  copyTextToClipboard, 
  isMobileDevice 
} from "../lib/emergencyCall";
import { getApiUrl } from "../lib/api";

interface EmergencyCallBannerProps {
  onCancel?: () => void;
  coords?: { lat: number; lng: number } | null;
  locationError?: string | null;
  userName?: string;
  className?: string;
}

export function EmergencyCallBanner({ 
  onCancel, 
  coords, 
  locationError, 
  userName = "GoldenGuard Test User", 
  className = "" 
}: EmergencyCallBannerProps) {
  const [copiedNum, setCopiedNum] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [cooldown, setCooldown] = useState(false);
  const isMobile = isMobileDevice();

  const sosMessage = generateSOSMessage({
    userName,
    coords,
  });

  const handleCopyNumber = async () => {
    const success = await copyTextToClipboard(TEST_EMERGENCY_NUMBER);
    if (success) {
      setCopiedNum(true);
      setTimeout(() => setCopiedNum(false), 2500);
    }
  };

  const handleCopyMessage = async () => {
    const success = await copyTextToClipboard(sosMessage);
    if (success) {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    }
  };

  const handleSendAutomaticSMS = async () => {
    if (cooldown || sendingStatus === "sending") return;

    setSendingStatus("sending");
    setStatusMessage("Sending emergency alert...");

    try {
      const response = await fetch(getApiUrl("/api/emergency/sos"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: TEST_EMERGENCY_NUMBER,
          latitude: coords ? coords.lat : "Location unavailable",
          longitude: coords ? coords.lng : "Location unavailable",
          timestamp: new Date().toISOString(),
          message: sosMessage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSendingStatus("sent");
        setStatusMessage("✓ Emergency alert sent successfully");
      } else {
        setSendingStatus("failed");
        setStatusMessage(`✕ ${data.message || "Emergency alert could not be sent. Please call emergency services."}`);
      }
    } catch (error: any) {
      console.error("Automatic SOS Dispatch Error:", error);
      setSendingStatus("failed");
      setStatusMessage(`✕ Emergency alert could not be sent: ${error?.message || "Network error"}`);
    } finally {
      // Apply anti-spam cooldown (15 seconds)
      setCooldown(true);
      setTimeout(() => setCooldown(false), 15000);
    }
  };

  const handleCallNow = () => {
    triggerEmergencyCall(TEST_EMERGENCY_NUMBER);
  };

  return (
    <div className={`w-full bg-gradient-to-br from-red-950 via-surface-900 to-red-900 border-2 border-red-500 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 ${className}`}>
      
      {/* Background Pulse Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg ring-4 ring-red-500/30 animate-pulse shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-red-400">
                🚨 EMERGENCY ACTIVATED
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Automatic Backend SOS Dispatch Ready
            </h3>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-surface-800/90 hover:bg-surface-700 text-xs font-bold text-surface-300 hover:text-white border border-surface-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Status Alert Banner */}
      {sendingStatus !== "idle" && (
        <div className={`mt-4 p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          sendingStatus === "sending" 
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : sendingStatus === "sent"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          {sendingStatus === "sending" && <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
          {sendingStatus === "sent" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
          {sendingStatus === "failed" && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
          <div>
            <span className="text-sm font-black">{statusMessage}</span>
            {sendingStatus === "sent" && (
              <span className="block text-[11px] font-normal text-emerald-200/90">
                Backend API confirmed SMS transmission to {TEST_EMERGENCY_NUMBER}.
              </span>
            )}
            {sendingStatus === "failed" && (
              <div className="space-y-2 mt-1.5">
                <span className="block text-[11px] font-normal text-red-200/90">
                  Automatic dispatch encountered an issue (such as Twilio trial/template restrictions). You can trigger sending via your device's native SMS app instead.
                </span>
                <button
                  onClick={() => triggerEmergencySMS(TEST_EMERGENCY_NUMBER, sosMessage)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send SMS via Device (Manual Backup)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Recipient, Location & Message Preview */}
      <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Recipient & Phone Box */}
        <div className="bg-surface-950/80 border border-red-500/40 rounded-2xl p-4 space-y-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            Recipient: {TEST_EMERGENCY_LABEL}
          </div>
          
          <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center gap-3">
            <span>{TEST_EMERGENCY_NUMBER}</span>
          </div>

          <div className="pt-1 text-[11px] text-surface-300 font-medium">
            Secure backend automatic dispatch via <code className="text-amber-300 font-mono">POST /api/emergency/sos</code>
          </div>
        </div>

        {/* GPS Coordinates & Map Link Box */}
        <div className="bg-surface-950/80 border border-surface-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="text-[11px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            Location: {coords ? "Available" : "Location unavailable"}
          </div>

          {coords ? (
            <div className="space-y-1 font-mono">
              <div className="flex justify-between items-center text-surface-300">
                <span>Latitude:</span>
                <span className="font-bold text-white">{coords.lat.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between items-center text-surface-300">
                <span>Longitude:</span>
                <span className="font-bold text-white">{coords.lng.toFixed(6)}°</span>
              </div>
              <a 
                href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`}
                target="_blank"
                rel="noreferrer"
                className="pt-1 text-[11px] text-blue-400 hover:text-blue-300 underline font-sans font-bold flex items-center gap-1"
              >
                <span>OpenStreetMap Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Location unavailable</span>
            </div>
          )}
        </div>

      </div>

      {/* Generated SOS Message Preview Card */}
      <div className="bg-surface-950/90 border border-surface-800 rounded-2xl p-3.5 text-xs font-mono whitespace-pre-wrap text-surface-300 leading-relaxed max-h-36 overflow-y-auto">
        <div className="text-[10px] font-black font-sans uppercase tracking-widest text-surface-500 pb-1 border-b border-surface-800 mb-2">
          SOS Message Payload:
        </div>
        {sosMessage}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-wrap items-center gap-2.5">
        
        {/* Send Automatic SOS Button with Cooldown */}
        <button
          onClick={handleSendAutomaticSMS}
          disabled={sendingStatus === "sending" || cooldown}
          className={`flex-1 min-w-[200px] px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 group ${
            cooldown 
              ? "bg-surface-800 text-surface-400 cursor-not-allowed border border-surface-700"
              : "bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {sendingStatus === "sending" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending emergency alert...</span>
            </>
          ) : cooldown ? (
            <>
              <span>Cooldown Active (Anti-Spam)</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5 group-hover:animate-bounce" />
              <span>SEND AUTOMATIC SOS</span>
            </>
          )}
        </button>

        {/* Call Now Button */}
        <button
          onClick={handleCallNow}
          className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Now</span>
        </button>

        {/* Copy SOS Message Button */}
        <button
          onClick={handleCopyMessage}
          className="px-3.5 py-3 bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          {copiedMsg ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied Msg!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Copy Message</span>
            </>
          )}
        </button>

        {/* Copy Number Button */}
        <button
          onClick={handleCopyNumber}
          className="px-3.5 py-3 bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          {copiedNum ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied Number!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Copy Number</span>
            </>
          )}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-2xl font-bold text-xs transition-all shrink-0"
          >
            Cancel
          </button>
        )}
      </div>

    </div>
  );
}
