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
  const [name, setName] = useState<string>(userProfile?.name || "");
  const [role, setRole] = useState<string>(userProfile?.role || "user");
  const [phone, setPhone] = useState<string>(userProfile?.phone || "");
  const [email, setEmail] = useState<string>(userProfile?.email || "");
  const [city, setCity] = useState<string>(userProfile?.city || "");
  const [bloodGroup, setBloodGroup] = useState<string>(userProfile?.bloodGroup || "");

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setRole(userProfile.role || "user");
      setPhone(userProfile.phone || "");
      setEmail(userProfile.email || "");
      setCity(userProfile.city || "");
      setBloodGroup(userProfile.bloodGroup || "");
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
    setUploadError(null);
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files are allowed.");
        return;
      }
      // Profile limit: 2MB max (recommended: max 1-2 MB before processing)
      const maxSizeBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setUploadError(`The image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is 2MB.`);
        return;
      }

      setUploadingPhoto(true);
      try {
        const cloudinaryUrl = await uploadToCloudinary(file, "profiles");
        await updateProfileData({ photoURL: cloudinaryUrl }, file);
      } catch (err: any) {
        console.error("Photo upload failed:", err);
        setUploadError("Photo upload temporarily unavailable. " + (err.message || "Failed to upload photo. Please check your network."));
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const profileData = {
    name: userProfile?.name || "Guest",
    role: userProfile?.role || "User",
    badge: "Community Member",
    location: userProfile?.city ? `${userProfile?.city}, ${userProfile?.state || ''}` : "Location Unavailable",
    phone: userProfile?.phone || "No Phone",
    email: userProfile?.email || "No Email",
    completionPercentage: 35,
    stats: {
      rescuesConducted: 2,
      goldenHourHrs: 8,
      responseRating: 4.9,
      hazardsReported: 3
    },
    achievements: [
      {
        id: "lifesaver",
        title: "Golden Hour Lifesaver",
        desc: "Responded and successfully administered first-aid within the golden hour critical period.",
        icon: ShieldCheck,
        color: "bg-amber-500/10 border-amber-500/30 text-amber-500"
      },
      {
        id: "good_samaritan",
        title: "Good Samaritan Shield",
        desc: "Certified protector under the national road safety Good Samaritan legal framework.",
        icon: Heart,
        color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      }
    ],
    certificates: [
      {
        id: "BLS-2026-902",
        title: "Basic Life Support (BLS)",
        issuer: "Indian Red Cross Society",
        issueDate: "Jan 2026",
        expiryDate: "Jan 2028",
        status: "VERIFIED"
      },
      {
        id: "NHAI-FRA-882",
        title: "First Responder Accreditation",
        issuer: "National Highway Authority",
        issueDate: "Mar 2026",
        expiryDate: "Mar 2029",
        status: "VERIFIED"
      }
    ],
    history: [
      {
        id: "r1",
        type: "Major Collision Response",
        date: "Jul 14, 2026",
        location: "Kengeri Highway, Near Exit 4",
        role: "Primary First Aid & CPR",
        status: "RESOLVED",
        responseTime: "4.2 mins"
      },
      {
        id: "r2",
        type: "Two-Wheeler Slip-Off",
        date: "Jun 28, 2026",
        location: "MG Road Intersection",
        role: "Haemorrhage Control",
        status: "RESOLVED",
        responseTime: "3.5 mins"
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 px-1 min-[360px]:px-2 sm:px-0">
      
      {/* Header Profile Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-900 via-surface-900 to-amber-950 text-white p-4 min-[360px]:p-4 min-[360px]:p-5 sm:p-6 sm:p-10 border border-surface-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-4 min-[360px]:p-5 sm:p-6 text-center md:text-left">
          
          {/* Hidden File Input for Image Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Avatar & Badge */}
          <div className="relative shrink-0 group mx-auto md:mx-0">
            <div className="w-24 h-24 min-[360px]:w-28 min-[360px]:h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-500 via-red-500 to-indigo-600 p-1 shadow-2xl relative overflow-hidden">
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover rounded-[22px]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-surface-900 rounded-[22px] flex items-center justify-center font-black text-2xl min-[360px]:text-3xl sm:text-4xl text-white">
                  {(userProfile?.name || name).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AS"}
                </div>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px] font-black rounded-[22px]"
                title="Upload Profile Photo"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span>Change Photo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400 text-black p-1.5 sm:p-2 rounded-xl border-2 border-surface-900 shadow-lg transition-transform hover:scale-110 touch-manipulation"
              title="Upload Photo"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {profileData.badge}
              </span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Good Samaritan Protected
              </span>

              {/* Desktop-only Edit/Save button to prevent squeezing */}
              <button
                onClick={() => {
                  if (isEditing) handleSaveProfile();
                  else setIsEditing(true);
                }}
                className="hidden md:flex px-3 py-1 rounded-full bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700 text-xs font-extrabold items-center gap-1.5 transition-colors ml-auto touch-manipulation"
              >
                {isEditing ? <Save className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isEditing ? "Save Profile" : "Edit Profile"}</span>
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-in slide-in-from-top duration-300">
                {uploadError}
              </div>
            )}

            {uploadingPhoto && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold animate-pulse">
                Optimizing and uploading profile image...
              </div>
            )}

            {isEditing ? (
              <div className="space-y-3 pt-1 max-w-md mx-auto md:mx-0 w-full">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-1.5 text-sm sm:text-base font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Profession / Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-1.5 text-xs text-surface-300 outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Role / Profession"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h1 className="text-xl min-[360px]:text-2xl sm:text-3xl md:text-4xl font-black tracking-tight break-words px-1">
                  {name}
                </h1>
                <p className="text-xs sm:text-sm text-surface-300 font-semibold">{role}</p>
              </div>
            )}

            {/* Location, Phone and Email indicators */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-[11px] sm:text-xs text-surface-400 pt-1 w-full">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {profileData.location}</span>
              
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
                  <div className="flex-1 space-y-1 text-left">
                    <label className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="Phone"
                    />
                  </div>
                  <div className="flex-1 space-y-1 text-left">
                    <label className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Email</label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="Email"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 break-all max-w-full"><Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {phone}</span>
                  <span className="flex items-center gap-1.5 break-all max-w-full"><Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {email}</span>
                </>
              )}
            </div>

            {/* Mobile-only interactive Edit/Save Profile toggle targets */}
            <div className="md:hidden pt-2 w-full">
              <button
                onClick={() => {
                  if (isEditing) handleSaveProfile();
                  else setIsEditing(true);
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                  isEditing
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                    : "bg-surface-800 hover:bg-surface-700 text-surface-100 border-surface-700"
                } touch-manipulation min-h-[40px]`}
              >
                {isEditing ? <Save className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isEditing ? "Save Profile Details" : "Edit Profile Details"}</span>
              </button>
            </div>
          </div>

          {/* Volunteer Status Switch */}
          <div className="bg-surface-800/80 backdrop-blur-md border border-surface-700 p-4 rounded-2xl shrink-0 space-y-2.5 w-full md:w-auto md:min-w-[220px] text-left">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-surface-200">Proximity Dispatch</span>
              <button 
                onClick={() => setIsVolunteerActive(!isVolunteerActive)}
                className="text-amber-400 hover:text-amber-300 transition-colors touch-manipulation min-h-[36px]"
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
        <div className="mt-6 pt-5 border-t border-surface-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-surface-300">Profile Completion Readiness</span>
              <span className="font-black text-amber-400">{profileData.completionPercentage}%</span>
            </div>
            <div className="w-full bg-surface-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-1000 rounded-full"
                style={{ width: `${profileData.completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center md:text-right text-xs text-surface-400">
            Next Action: <span className="text-white font-semibold">Upload Driving License Copy</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-surface-900 p-4 sm:p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="text-[10px] sm:text-xs font-bold text-surface-500 uppercase tracking-wider">Rescues Conducted</div>
          <div className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white">{profileData.stats.rescuesConducted}</div>
          <div className="text-[10px] sm:text-[11px] text-emerald-500 font-bold flex flex-wrap items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" /> <span>100% Golden Hour Adherence</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-4 sm:p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="text-[10px] sm:text-xs font-bold text-surface-500 uppercase tracking-wider">Golden Hour Hours</div>
          <div className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white">{profileData.stats.goldenHourHrs} hrs</div>
          <div className="text-[10px] sm:text-[11px] text-amber-500 font-bold">Active Patrol & Response</div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-4 sm:p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="text-[10px] sm:text-xs font-bold text-surface-500 uppercase tracking-wider">Responder Rating</div>
          <div className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white">{profileData.stats.responseRating} / 5.0</div>
          <div className="text-[10px] sm:text-[11px] text-blue-500 font-bold">Top 1% Responders</div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-4 sm:p-5 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="text-[10px] sm:text-xs font-bold text-surface-500 uppercase tracking-wider">Hazards Verified</div>
          <div className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white">{profileData.stats.hazardsReported}</div>
          <div className="text-[10px] sm:text-[11px] text-purple-500 font-bold">Dispatches Triggered</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-4 sm:gap-4 min-[360px]:p-5 sm:p-6 text-xs sm:text-sm font-bold overflow-x-auto whitespace-nowrap custom-scrollbar pb-1">
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
              className={`shrink-0 pb-3 flex items-center gap-1.5 border-b-2 transition-all touch-manipulation min-h-[36px] ${
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white"
              }`}
            >
              <IconC className="w-4 h-4 shrink-0" />
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
            <div key={cert.id} className="p-4 min-[360px]:p-5 sm:p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
