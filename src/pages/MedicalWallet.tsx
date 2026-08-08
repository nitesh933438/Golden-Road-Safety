import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, Heart, AlertTriangle, Phone, MessageSquare, 
  Hospital, Activity, User, Calendar, Stethoscope, Save, 
  QrCode, Camera, Plus, Trash2, Edit3, Share2, Download, 
  Lock, CheckCircle2, Wifi, WifiOff, FileText, ArrowRight, Eye, ShieldAlert
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getLocalMedicalID, saveMedicalID, MedicalIDData, EmergencyContact } from "../lib/medicalIdStore";
import { uploadToCloudinary } from "../lib/cloudinary";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate } from "react-router-dom";
import { SmartInput } from "../components/ui/SmartInput";

export function MedicalWallet() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<MedicalIDData>(() => getLocalMedicalID());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"card" | "edit" | "contacts">("card");

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Sync user UID if available
  useEffect(() => {
    if (currentUser?.uid) {
      setFormData(prev => ({
        ...prev,
        uid: currentUser.uid,
        fullName: prev.fullName || userProfile?.name || currentUser.displayName || "Good Samaritan",
        photoURL: prev.photoURL || userProfile?.photoURL || currentUser.photoURL || ""
      }));
    }
  }, [currentUser, userProfile]);

  // Handle Input Changes
  const handleChange = (field: keyof MedicalIDData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Profile Photo Upload to Cloudinary
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingPhoto(true);
      try {
        const url = await uploadToCloudinary(file, "profiles");
        handleChange("photoURL", url);
      } catch (err) {
        console.error("Medical ID photo upload failed:", err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  // Manage Contacts (Up to 5)
  const handleContactChange = (index: number, key: keyof EmergencyContact, value: any) => {
    const updated = [...formData.emergencyContacts];
    updated[index] = { ...updated[index], [key]: value };
    handleChange("emergencyContacts", updated);
  };

  const addContact = () => {
    if (formData.emergencyContacts.length >= 5) {
      alert("Maximum 5 emergency contacts permitted.");
      return;
    }
    const newContact: EmergencyContact = {
      id: `c_${Date.now()}`,
      name: "",
      phone: "",
      relation: "Family",
      isPrimary: formData.emergencyContacts.length === 0
    };
    handleChange("emergencyContacts", [...formData.emergencyContacts, newContact]);
  };

  const removeContact = (index: number) => {
    const updated = formData.emergencyContacts.filter((_, i) => i !== index);
    handleChange("emergencyContacts", updated);
  };

  // Save Medical ID
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMedicalID(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Error saving Medical ID:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const emergencyViewUrl = `${window.location.origin}/medical-id/view?uid=${formData.uid || "default_user"}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-surface-900 to-amber-950 text-white p-6 sm:p-10 rounded-3xl border border-red-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Emergency Wallet System
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" /> Offline Sync Active
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Emergency Medical ID Wallet</h1>
            <p className="text-sm text-surface-300 font-medium leading-relaxed">
              Store critical health data, blood group, allergies, medications, and up to 5 emergency contacts. Accessible instantly offline and from the lockscreen without unlocking your phone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to={`/medical-id/view?uid=${formData.uid}`}
              target="_blank"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-2 shadow-xl transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" /> Lockscreen View
            </Link>
            
            <button
              onClick={() => setShowQRModal(true)}
              className="px-5 py-3 rounded-2xl bg-surface-800 hover:bg-surface-700 text-white font-black text-xs flex items-center gap-2 border border-surface-700 shadow-xl transition-all"
            >
              <QrCode className="w-4 h-4 text-amber-400" /> Share QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("card")}
          className={`pb-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "card"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Medical ID Badge</span>
        </button>

        <button
          onClick={() => setActiveTab("edit")}
          className={`pb-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "edit"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Medical Records</span>
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`pb-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "contacts"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white"
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Emergency Contacts ({formData.emergencyContacts.length})</span>
        </button>
      </div>

      {/* TAB 1: DIGITAL MEDICAL ID CARD VIEW */}
      {activeTab === "card" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Card Visual Badge */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-surface-900 via-surface-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 border border-surface-800 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-surface-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">OFFICIAL HEALTH EMBLEM</span>
                    <h2 className="text-xl font-black text-white tracking-tight">GOLDENGUARD MEDICAL ID</h2>
                  </div>
                </div>

                <div className="bg-red-600 text-white px-4 py-2 rounded-2xl text-center shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-wider block text-red-200">BLOOD</span>
                  <span className="text-2xl font-black">{formData.bloodGroup}</span>
                </div>
              </div>

              {/* Patient Profile */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 p-0.5 shrink-0 shadow-xl overflow-hidden">
                  {formData.photoURL ? (
                    <img src={formData.photoURL} alt="Medical ID" className="w-full h-full object-cover rounded-[14px]" />
                  ) : (
                    <div className="w-full h-full bg-surface-950 rounded-[14px] flex items-center justify-center font-black text-2xl text-amber-400">
                      {formData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-black text-white">{formData.fullName}</h3>
                  <p className="text-xs text-surface-400 font-medium">
                    DOB: <strong>{formData.dob}</strong> ({formData.gender}) • Height: <strong>{formData.height}</strong> • Weight: <strong>{formData.weight}</strong>
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                    {formData.organDonor && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center gap-1 border border-emerald-500/40">
                        <Heart className="w-3.5 h-3.5 fill-emerald-400" /> Organ Donor
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black border border-blue-500/40">
                      Emergency Wallet Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical Conditions & Allergies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-surface-800">
                <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Severe Allergies
                  </span>
                  <p className="text-xs font-bold text-white">{formData.allergies || "No Known Drug Allergies"}</p>
                </div>

                <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> Medical Conditions
                  </span>
                  <p className="text-xs font-bold text-white">{formData.medicalConditions || "None"}</p>
                </div>
              </div>

              {/* Current Medicines */}
              <div className="bg-surface-950/80 border border-surface-800 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Current Medications
                </span>
                <p className="text-xs font-semibold text-surface-200">{formData.currentMedicines || "None currently prescribed"}</p>
              </div>

              {/* Hospital & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-surface-300 border-t border-surface-800 pt-4">
                <div>
                  <span className="text-surface-500 block text-[10px] uppercase font-bold">Preferred Hospital</span>
                  <span className="text-white font-bold">{formData.preferredHospital}</span>
                </div>
                <div>
                  <span className="text-surface-500 block text-[10px] uppercase font-bold">Primary Doctor</span>
                  <span className="text-white font-bold">{formData.doctorName}</span> ({formData.doctorPhone})
                </div>
              </div>

            </div>
          </div>

          {/* Side Info & Quick Actions */}
          <div className="space-y-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-bold text-base text-surface-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" /> Emergency QR Badge
              </h3>
              <p className="text-xs text-surface-500 leading-relaxed">
                First responders and paramedics can scan this QR code directly from your printed badge or lockscreen to view your Medical ID instantly.
              </p>

              <div className="p-4 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 flex justify-center shadow-inner">
                <QRCodeSVG value={emergencyViewUrl} size={160} level="M" />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Share2 className="w-4 h-4" /> Expand & Export QR Badge
                </button>

                <button
                  onClick={() => {
                    setActiveTab("edit");
                  }}
                  className="w-full py-3 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-black text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-amber-500" /> Edit Health Data
                </button>
              </div>
            </div>

            {/* Offline & Security Status */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-3xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Local & Encrypted Storage
              </div>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                Your Medical ID is saved directly in your device’s local IndexedDB memory and synced with Firestore. It remains 100% operational even without cellular service or internet.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: EDIT MEDICAL RECORDS */}
      {activeTab === "edit" && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-10 rounded-3xl space-y-8 shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-6">
            <div>
              <h2 className="text-2xl font-black text-surface-900 dark:text-white">Edit Medical ID Details</h2>
              <p className="text-xs text-surface-500">Keep your health parameters updated for paramedics and responders.</p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Medical ID"}</span>
            </button>
          </div>

          {isSaved && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Medical ID saved locally & synced to Firestore successfully!
            </div>
          )}

          {/* Hidden File Input for Photo Upload */}
          <input
            type="file"
            ref={photoInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Photo Upload Section */}
          <div className="flex items-center gap-6 bg-surface-50 dark:bg-surface-950/50 p-5 rounded-2xl border border-surface-200 dark:border-surface-800">
            <div className="w-20 h-20 rounded-2xl bg-surface-200 dark:bg-surface-800 overflow-hidden relative group shrink-0">
              {formData.photoURL ? (
                <img src={formData.photoURL} alt="Medical ID Photo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-xl text-surface-500">
                  {formData.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-surface-900 dark:text-white">Profile & ID Photograph</h4>
              <p className="text-xs text-surface-500">Uploaded to secure Cloudinary storage for emergency verification.</p>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="px-3.5 py-1.5 rounded-xl bg-surface-200 dark:bg-surface-800 hover:bg-amber-500 hover:text-black text-surface-900 dark:text-white text-xs font-bold flex items-center gap-1.5 transition-colors mt-2"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
              </button>
            </div>
          </div>

          {/* Primary Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Full Name */}
            <div>
              <SmartInput
                label="Full Name"
                value={formData.fullName}
                onChange={(val) => handleChange("fullName", val)}
                validationType="name"
                placeholder="Enter patient full name..."
              />
            </div>

            {/* DOB */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange("bloodGroup", e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 outline-none focus:ring-2 focus:ring-amber-500"
              >
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Height */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Height</label>
              <input
                type="text"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
                placeholder="e.g. 178 cm"
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300">Weight</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="e.g. 72 kg"
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

          </div>

          {/* Detailed Clinical Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surface-200 dark:border-surface-800">
            
            {/* Allergies */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Severe Allergies
              </label>
              <textarea
                rows={3}
                value={formData.allergies}
                onChange={(e) => handleChange("allergies", e.target.value)}
                placeholder="List known drug, food, or insect allergies (e.g. Penicillin, Peanuts)"
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3 text-xs text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Medical Conditions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" /> Pre-existing Conditions
              </label>
              <textarea
                rows={3}
                value={formData.medicalConditions}
                onChange={(e) => handleChange("medicalConditions", e.target.value)}
                placeholder="e.g. Asthma, Hypertension, Diabetes, Pacemaker"
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3 text-xs text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Current Medications */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Current Medications & Dosage
              </label>
              <input
                type="text"
                value={formData.currentMedicines}
                onChange={(e) => handleChange("currentMedicines", e.target.value)}
                placeholder="e.g. Aspirin 75mg once daily, Insulin 10 units"
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-xs text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

          </div>

          {/* Organ Donor & Hospital Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surface-200 dark:border-surface-800">
            
            {/* Organ Donor Toggle */}
            <div className="bg-surface-50 dark:bg-surface-950 p-4 rounded-2xl border border-surface-200 dark:border-surface-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" /> Organ Donor Registry
                </span>
                <p className="text-[11px] text-surface-500">Pledge organ donation in emergency scenarios.</p>
              </div>

              <input
                type="checkbox"
                checked={formData.organDonor}
                onChange={(e) => handleChange("organDonor", e.target.checked)}
                className="w-6 h-6 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Hospital & Doctor */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => handleChange("doctorName", e.target.value)}
                  placeholder="Primary Doctor Name"
                  className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-white"
                />
                <input
                  type="text"
                  value={formData.doctorPhone}
                  onChange={(e) => handleChange("doctorPhone", e.target.value)}
                  placeholder="Doctor Phone Number"
                  className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-white"
                />
              </div>

              <input
                type="text"
                value={formData.preferredHospital}
                onChange={(e) => handleChange("preferredHospital", e.target.value)}
                placeholder="Preferred Hospital Name & Location"
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-white"
              />
            </div>

          </div>

          {/* Save Button Bar */}
          <div className="pt-6 border-t border-surface-200 dark:border-surface-800 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm flex items-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? "Syncing..." : "Save Medical ID Changes"}</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: EMERGENCY CONTACTS MANAGER */}
      {activeTab === "contacts" && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-10 rounded-3xl space-y-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-6">
            <div>
              <h2 className="text-2xl font-black text-surface-900 dark:text-white flex items-center gap-2">
                <Phone className="w-6 h-6 text-amber-500" /> Emergency Contacts
              </h2>
              <p className="text-xs text-surface-500">Configure up to 5 family or physician contacts for 1-tap call and SMS during SOS alerts.</p>
            </div>

            <button
              onClick={addContact}
              disabled={formData.emergencyContacts.length >= 5}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> Add Contact ({formData.emergencyContacts.length}/5)
            </button>
          </div>

          <div className="space-y-4">
            {formData.emergencyContacts.map((contact, index) => (
              <div 
                key={contact.id || index}
                className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Contact #{index + 1} {contact.isPrimary && "• PRIMARY CONTACT"}
                  </span>
                  
                  <button
                    onClick={() => removeContact(index)}
                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-surface-500 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, "name", e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-surface-500 block mb-1">Phone Number (With Country Code)</label>
                    <input
                      type="text"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-surface-500 block mb-1">Relationship</label>
                    <select
                      value={contact.relation}
                      onChange={(e) => handleContactChange(index, "relation", e.target.value)}
                      className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-white"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent / Guardian</option>
                      <option value="Child">Son / Daughter</option>
                      <option value="Sibling">Brother / Sister</option>
                      <option value="Doctor">Doctor / Physician</option>
                      <option value="Friend">Friend / Neighbour</option>
                    </select>
                  </div>
                </div>

                {/* 1-Tap Call/SMS Test Buttons */}
                <div className="flex items-center gap-3 pt-2 border-t border-surface-200 dark:border-surface-800">
                  <a
                    href={`tel:${contact.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/20"
                  >
                    <Phone className="w-3.5 h-3.5" /> Test Call
                  </a>
                  <a
                    href={`sms:${contact.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:bg-blue-500/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Test SMS
                  </a>
                </div>

              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-surface-200 dark:border-surface-800 flex justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-2 shadow-xl"
            >
              <Save className="w-4 h-4" /> Save Contacts
            </button>
          </div>

        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-6 text-center text-surface-900 dark:text-white shadow-2xl relative">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-surface-900 dark:text-white">Emergency QR Badge</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">Scan code with any standard smartphone camera to view medical parameters instantly.</p>
            </div>

            <div className="p-6 bg-white dark:bg-surface-800 rounded-2xl inline-block mx-auto shadow-xl border border-surface-200 dark:border-surface-700">
              <QRCodeSVG value={emergencyViewUrl} size={200} level="H" includeMargin={true} />
            </div>

            <div className="text-[11px] text-surface-400 font-mono break-all bg-surface-950 p-3 rounded-xl border border-surface-800">
              {emergencyViewUrl}
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
