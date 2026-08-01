import React, { useState, useEffect, useRef } from "react";
import { 
  User, Award, Shield, FileCheck, Clock, CheckCircle2, 
  Sparkles, Heart, MapPin, Phone, Mail, ChevronRight, 
  Download, ExternalLink, Share2, ToggleLeft, ToggleRight,
  TrendingUp, ShieldCheck, Camera, Edit2, Save, X, LogIn
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { uploadToCloudinary } from "../lib/cloudinary";

export function Profile() {
  const { currentUser, userProfile, updateProfileData, loginWithGoogle } = useAuth();
  const [isVolunteerActive, setIsVolunteerActive] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "certificates" | "history" | "achievements">("overview");
  
  // Local edit form fields
  const [name, setName] = useState(userProfile?.name || "Dr. Aarav Sharma");
  const [role, setRole] = useState(userProfile?.role === "admin" ? "GoldenGuard Administrator" : "Good Samaritan Lead Responder");
  const [phone, setPhone] = useState(userProfile?.phone || "+91 98765 43210");
  const [email, setEmail] = useState(userProfile?.email || "aarav.sharma@goldenguard.in");
  const [city, setCity] = useState(userProfile?.city || "New Delhi");
  const [bloodGroup, setBloodGroup] = useState(userProfile?.bloodGroup || "O+");

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "Dr. Aarav Sharma");
      setRole(userProfile.role === "admin" ? "GoldenGuard Administrator" : "Good Samaritan Lead Responder");
      setPhone(userProfile.phone || "+91 98765 43210");
      setEmail(userProfile.email || "aarav.sharma@goldenguard.in");
      setCity(userProfile.city || "New Delhi");
      setBloodGroup(userProfile.bloodGroup || "O+");
    }
  }, [userProfile]);

  // Save profile changes to Firestore & local state
  const handleSaveProfile = async () => {
    try {
      await updateProfileData({
        name,
        phone,
        email,
        city,
        bloodGroup
      });
      setIsEditing(false);
    } catch (e) {
      console.error("Save profile error:", e);
    }
  };

  // Photo upload handler (Uploads to Cloudinary)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingPhoto(true);
      try {
        const cloudinaryUrl = await uploadToCloudinary(file, "profiles");
        await updateProfileData({ photoURL: cloudinaryUrl }, file);
      } catch (err) {
        console.error("Photo upload failed:", err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const profileData = {
    name: "Dr. Aarav Sharma",
    role: "Good Samaritan Lead Responder",
    badge: "Level 3 Certified First Responder",
    location: "Mumbai Central, Maharashtra",
    phone: "+91 98765 43210",
    email: "aarav.sharma@goldenguard.in",
    completionPercentage: 92,
    stats: {
      rescuesConducted: 14,
      goldenHourHrs: 28.5,
      responseRating: 4.95,
      hazardsReported: 32
    },
    achievements: [
      { id: 1, title: "Golden Hour Savior", desc: "Rescued 5+ victims within 10 minutes of accident call", icon: ShieldCheck, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
      { id: 2, title: "CPR Master Responder", desc: "Completed Level 3 Advanced CPR Triage Certification", icon: Heart, color: "text-red-500 bg-red-500/10 border-red-500/30" },
      { id: 3, title: "Road Hazard Vigilant", desc: "Successfully reported and verified 30+ roadway blackspots", icon: Sparkles, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
      { id: 4, title: "Community Guardian", desc: "Mentored 100+ local citizens in emergency first-response", icon: Award, color: "text-purple-500 bg-purple-500/10 border-purple-500/30" }
    ],
    certificates: [
      { id: "CERT-BLS-2026", title: "Basic Life Support (BLS) & CPR Provider", issuer: "Indian Red Cross & GoldenGuard National Registry", issueDate: "Jan 15, 2026", expiryDate: "Jan 2028", status: "Active & Verified" },
      { id: "CERT-GOODSAM-2025", title: "Good Samaritan Law Legal Immunity", issuer: "Supreme Court Directive & Ministry of Road Transport", issueDate: "Nov 04, 2025", expiryDate: "Permanent", status: "Active & Verified" },
      { id: "CERT-TRAUMA-2026", title: "Advanced Road Incident Triage & Haemorrhage Control", issuer: "National Disaster Response Force (NDRF)", issueDate: "Mar 10, 2026", expiryDate: "Mar 2027", status: "Active & Verified" }
    ],
    history: [
      { id: "EMG-8921", date: "July 24, 2026", type: "Two-Wheeler Skidded", location: "Western Express Hwy, Bandra", role: "First Responder (CPR Applied)", status: "Victim Stable", responseTime: "3.2 mins" },
      { id: "EMG-7712", date: "June 11, 2026", type: "Car Collision Triage", location: "BKC Connector Signal", role: "Scene Traffic Security", status: "Handed over to 108 Ambulance", responseTime: "2.8 mins" },
      { id: "EMG-5401", date: "May 02, 2026", type: "Pedestrian Injury", location: "Andheri East Metro Underpass", role: "Haemorrhage Pressure Bandage", status: "Full Recovery", responseTime: "4.1 mins" }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Profile Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-900 via-surface-900 to-amber-950 text-white p-6 sm:p-10 border border-surface-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          
          {/* Hidden File Input for Image Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Avatar & Badge */}
          <div className="relative shrink-0 group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-500 via-red-500 to-indigo-600 p-1 shadow-2xl relative overflow-hidden">
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover rounded-[22px]"
                />
              ) : (
                <div className="w-full h-full bg-surface-900 rounded-[22px] flex items-center justify-center font-black text-3xl sm:text-4xl text-white">
                  {(userProfile?.name || name).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AS"}
                </div>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-black rounded-[22px]"
                title="Upload Profile Photo"
              >
                <Camera className="w-5 h-5 text-amber-400" />
                <span>Change Photo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-400 text-black p-2 rounded-xl border-2 border-surface-900 shadow-lg transition-transform hover:scale-110"
              title="Upload Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
                {profileData.badge}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Good Samaritan Protected
              </span>

              <button
                onClick={() => {
                  if (isEditing) handleSaveProfile();
                  else setIsEditing(true);
                }}
                className="px-3 py-1 rounded-full bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700 text-xs font-extrabold flex items-center gap-1.5 transition-colors ml-auto"
              >
                {isEditing ? <Save className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isEditing ? "Save Profile" : "Edit Profile"}</span>
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-2 pt-2 max-w-md">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-1.5 text-base font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-1.5 text-xs text-surface-300 outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Role / Profession"
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{name}</h1>
                <p className="text-sm text-surface-300 font-medium">{role}</p>
              </>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-surface-400 pt-2">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {profileData.location}</span>
              
              {isEditing ? (
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                </div>
              ) : (
                <>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-amber-500" /> {phone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-amber-500" /> {email}</span>
                </>
              )}
            </div>
          </div>

          {/* Volunteer Status Switch */}
          <div className="bg-surface-800/80 backdrop-blur-md border border-surface-700 p-4 rounded-2xl shrink-0 space-y-3 min-w-[220px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-surface-200">Proximity Dispatch</span>
              <button 
                onClick={() => setIsVolunteerActive(!isVolunteerActive)}
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                {isVolunteerActive ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-surface-500" />}
              </button>
            </div>
            <div className="text-[11px] text-surface-400">
              Status: <strong className={isVolunteerActive ? "text-emerald-400" : "text-amber-400"}>
                {isVolunteerActive ? "Active Volunteer (On-Duty)" : "Standby / Off-Duty"}
              </strong>
            </div>
          </div>

        </div>

        {/* Profile Completion Bar */}
        <div className="mt-8 pt-6 border-t border-surface-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-surface-300">Profile Completion Readiness</span>
              <span className="font-black text-amber-400">{profileData.completionPercentage}%</span>
            </div>
            <div className="w-full bg-surface-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-1000 rounded-full"
                style={{ width: `${profileData.completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right md:text-right text-xs text-surface-400">
            Next Action: <span className="text-white font-semibold">Upload Driving License Copy</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="text-xs font-bold text-surface-500 uppercase tracking-wider">Rescues Conducted</div>
          <div className="text-3xl font-black text-surface-900 dark:text-white">{profileData.stats.rescuesConducted}</div>
          <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 100% Golden Hour Adherence
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="text-xs font-bold text-surface-500 uppercase tracking-wider">Golden Hour Hours</div>
          <div className="text-3xl font-black text-surface-900 dark:text-white">{profileData.stats.goldenHourHrs} hrs</div>
          <div className="text-[11px] text-amber-500 font-bold">Active Patrol & Response</div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="text-xs font-bold text-surface-500 uppercase tracking-wider">Responder Rating</div>
          <div className="text-3xl font-black text-surface-900 dark:text-white">{profileData.stats.responseRating} / 5.0</div>
          <div className="text-[11px] text-blue-500 font-bold">Top 1% Citizen Responders</div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="text-xs font-bold text-surface-500 uppercase tracking-wider">Hazards Verified</div>
          <div className="text-3xl font-black text-surface-900 dark:text-white">{profileData.stats.hazardsReported}</div>
          <div className="text-[11px] text-purple-500 font-bold">Municipal Dispatches Triggered</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-6 text-sm font-bold">
        {[
          { id: "overview", label: "Achievements & Badges", icon: Award },
          { id: "certificates", label: "Government & BLS Certificates", icon: FileCheck },
          { id: "history", label: "Rescue & Emergency History", icon: Clock },
        ].map((tab) => {
          const IconC = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 flex items-center gap-2 border-b-2 transition-all ${
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white"
              }`}
            >
              <IconC className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.achievements.map((ach) => {
            const IconComp = ach.icon;
            return (
              <div key={ach.id} className="p-5 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                <div className={`p-3.5 rounded-2xl border ${ach.color} shrink-0`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-surface-900 dark:text-white">{ach.title}</h3>
                  <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "certificates" && (
        <div className="space-y-4">
          {profileData.certificates.map((cert) => (
            <div key={cert.id} className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-surface-900 dark:text-white">{cert.title}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      {cert.status}
                    </span>
                  </div>
                  <p className="text-xs text-surface-500">Issued by: <strong>{cert.issuer}</strong></p>
                  <p className="text-[11px] text-surface-400">ID: {cert.id} · Issued {cert.issueDate} (Valid through {cert.expiryDate})</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => alert(`Downloading official verified certificate ${cert.id}...`)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {profileData.history.map((item) => (
            <div key={item.id} className="p-5 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-surface-900 dark:text-white">{item.type}</span>
                  <span className="text-xs text-surface-400">• {item.date}</span>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> {item.location}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Action: {item.role}</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-surface-100 dark:border-surface-800">
                <div className="text-left md:text-right">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.status}</div>
                  <div className="text-[10px] text-surface-400">Arrival Time: {item.responseTime}</div>
                </div>
                <span className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
