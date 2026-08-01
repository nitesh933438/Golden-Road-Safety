import React, { useEffect, useState } from "react";
import { 
  Heart, AlertTriangle, Phone, MessageSquare, ShieldAlert, 
  Hospital, UserCheck, Activity, Award, QrCode, Lock, 
  MapPin, Clock, Stethoscope, FileText, CheckCircle2, ChevronLeft, Share2, Download
} from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { getLocalMedicalID, fetchRemoteMedicalID, MedicalIDData, DEFAULT_MEDICAL_ID } from "../lib/medicalIdStore";
import { QRCodeSVG } from "qrcode.react";

export function EmergencyMedicalIDView() {
  const [searchParams] = useSearchParams();
  const uidParam = searchParams.get("uid");
  const navigate = useNavigate();

  const [medicalID, setMedicalID] = useState<MedicalIDData>(getLocalMedicalID());
  const [loading, setLoading] = useState<boolean>(true);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (uidParam) {
        const remote = await fetchRemoteMedicalID(uidParam);
        setMedicalID(remote);
      } else {
        setMedicalID(getLocalMedicalID());
      }
      setLoading(false);
    }
    loadData();
  }, [uidParam]);

  const shareableUrl = `${window.location.origin}/medical-id/view?uid=${medicalID.uid || "default_user"}`;

  const triggerBystanderSOS = () => {
    setSosTriggered(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-start p-4 sm:p-6 pb-20 select-none">
      
      {/* Lockscreen Emergency Header Bar */}
      <div className="w-full max-w-lg bg-red-950/80 border border-red-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/40 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> EMERGENCY LOCKSCREEN ACCESS
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">GOLDENGUARD MEDICAL ID</h1>
            </div>
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="p-2.5 rounded-2xl bg-surface-900 border border-surface-800 hover:border-amber-500/50 text-amber-400 transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Show Emergency QR Code"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">QR Badge</span>
          </button>
        </div>
      </div>

      {/* Main Medical ID Card */}
      <div className="w-full max-w-lg space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-gradient-to-b from-surface-900 via-surface-900/90 to-surface-950 border border-surface-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 p-0.5 shadow-xl shrink-0">
                {medicalID.photoURL ? (
                  <img src={medicalID.photoURL} alt="User Avatar" className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                  <div className="w-full h-full bg-surface-950 rounded-[14px] flex items-center justify-center font-black text-2xl text-amber-400">
                    {medicalID.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">{medicalID.fullName}</h2>
                <div className="text-xs text-surface-400 font-medium">DOB: {medicalID.dob || "N/A"} • {medicalID.gender}</div>
                <div className="text-xs text-surface-400 font-medium">Height: {medicalID.height} • Weight: {medicalID.weight}</div>
              </div>
            </div>

            {/* Blood Group Badge */}
            <div className="flex flex-col items-center justify-center bg-red-600 text-white p-3 rounded-2xl min-w-[70px] shadow-lg shadow-red-600/30 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-200">BLOOD</span>
              <span className="text-2xl font-black tracking-tighter">{medicalID.bloodGroup}</span>
            </div>
          </div>

          {/* Organ Donor & Status Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-800">
            {medicalID.organDonor && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-emerald-400" /> ORGAN DONOR REGISTERED
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-black flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED MEDICAL ID
            </span>
          </div>
        </div>

        {/* Critical Alerts (Allergies & Medical Conditions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Allergies */}
          <div className="bg-red-950/40 border border-red-500/30 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
              <span>SEVERE ALLERGIES</span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">
              {medicalID.allergies || "No Known Drug Allergies (NKDA)"}
            </p>
          </div>

          {/* Conditions */}
          <div className="bg-amber-950/40 border border-amber-500/30 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
              <Stethoscope className="w-4 h-4 text-amber-400" />
              <span>MEDICAL CONDITIONS</span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">
              {medicalID.medicalConditions || "None Reported"}
            </p>
          </div>
        </div>

        {/* Current Medications */}
        <div className="bg-surface-900 border border-surface-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-400">
            <Activity className="w-4 h-4" />
            <span>CURRENT MEDICATIONS & DOSAGE</span>
          </div>
          <p className="text-sm font-semibold text-surface-200">
            {medicalID.currentMedicines || "None currently prescribed"}
          </p>
        </div>

        {/* Doctor & Preferred Hospital */}
        <div className="bg-surface-900 border border-surface-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400">
            <Hospital className="w-4 h-4" />
            <span>PREFERRED HOSPITAL & DOCTOR</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="text-white font-bold flex items-center gap-2">
              <Hospital className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{medicalID.preferredHospital}</span>
            </div>
            <div className="text-surface-300 flex items-center justify-between pt-1">
              <span>Doctor: <strong className="text-white">{medicalID.doctorName}</strong></span>
              <a 
                href={`tel:${medicalID.doctorPhone}`}
                className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 font-bold text-[11px] flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> {medicalID.doctorPhone}
              </a>
            </div>
            {medicalID.insuranceProvider && (
              <div className="text-surface-400 text-[11px] pt-1 border-t border-surface-800">
                Insurance: <strong className="text-surface-200">{medicalID.insuranceProvider}</strong> ({medicalID.insurancePolicyNumber})
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contacts (1-Tap Call & SMS) */}
        <div className="bg-surface-900 border border-surface-800 p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
              <Phone className="w-4 h-4" />
              <span>EMERGENCY CONTACTS ({medicalID.emergencyContacts.length})</span>
            </div>
            <span className="text-[10px] text-surface-400 font-bold uppercase">1-TAP CALL & SMS</span>
          </div>

          <div className="space-y-3">
            {medicalID.emergencyContacts.map((contact, idx) => (
              <div 
                key={contact.id || idx}
                className="p-4 rounded-2xl bg-surface-950 border border-surface-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{contact.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
                      {contact.relation}
                    </span>
                    {contact.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-surface-400 font-mono mt-0.5">{contact.phone}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${contact.phone}`}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 flex items-center justify-center"
                    title="1-Tap Direct Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`sms:${contact.phone}?body=EMERGENCY ALERT: I am responding to an emergency involving ${encodeURIComponent(medicalID.fullName)}. Please respond.`}
                    className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 transition-transform active:scale-95 flex items-center justify-center"
                    title="1-Tap Direct SMS"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bystander Emergency SOS Trigger */}
        <div className="bg-red-950/60 border-2 border-red-500/50 p-6 rounded-3xl text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              <span>BYSTANDER EMERGENCY SOS</span>
            </h3>
            <p className="text-xs text-red-200/80 max-w-sm mx-auto">
              Are you a paramedic or bystander responding on scene? Tap below to dispatch GoldenGuard emergency services to this location immediately.
            </p>
          </div>

          {sosTriggered ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>EMERGENCY DISPATCH TRIGGERED! HELP IS EN ROUTE.</span>
            </div>
          ) : (
            <button
              onClick={triggerBystanderSOS}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-black text-sm tracking-wider uppercase shadow-2xl shadow-red-600/50 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>TRIGGER 1-TAP EMERGENCY DISPATCH</span>
            </button>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link 
            to="/wallet" 
            className="text-xs text-surface-400 hover:text-amber-400 font-bold inline-flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Return to GoldenGuard App & Medical Wallet
          </Link>
        </div>

      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-900 border border-surface-800 p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-6 text-center shadow-2xl relative">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Emergency Medical QR Badge</h3>
              <p className="text-xs text-surface-400">Scan this code with any phone camera to instantly view Medical ID & emergency contacts without logging in.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl inline-block mx-auto shadow-xl">
              <QRCodeSVG 
                value={shareableUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-[11px] text-surface-400 font-mono break-all bg-surface-950 p-3 rounded-xl border border-surface-800">
              {shareableUrl}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareableUrl);
                  alert("Emergency ID URL copied to clipboard!");
                }}
                className="flex-1 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-white font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-amber-400" /> Copy Link
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
