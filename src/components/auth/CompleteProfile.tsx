import React, { useState, useRef } from "react";
import { 
  User, Shield, Building2, Car, BookOpen, 
  Phone, Mail, MapPin, Award, Check, AlertCircle, Camera, Loader2, Plus, Trash2
} from "lucide-react";
import { useAuth, AppRole } from "../../context/AuthContext";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function CompleteProfile() {
  const { currentUser, updateProfileData } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<AppRole>("citizen");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // USER specific fields
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalInfo, setMedicalInfo] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; phone: string; relation: string }>>([
    { name: "", phone: "", relation: "" }
  ]);

  // VOLUNTEER specific fields
  const [serviceArea, setServiceArea] = useState("");
  const [skills, setSkills] = useState("");
  const [volunteerAvailability, setVolunteerAvailability] = useState(false); // Default false (OFFLINE)

  // HOSPITAL specific fields
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalServices, setHospitalServices] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState("");

  // POLICE specific fields
  const [policeServiceArea, setPoliceServiceArea] = useState("");
  const [policeLocation, setPoliceLocation] = useState("");

  // TRAINER specific fields
  const [trainerQualifications, setTrainerQualifications] = useState("");
  const [trainerInfo, setTrainerInfo] = useState("");

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (file) {
      if (!file.type.startsWith("image/")) {
        setPhotoError("Only image files are allowed.");
        return;
      }
      const maxSizeBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setPhotoError(`The image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is 2MB.`);
        return;
      }
      setUploadingPhoto(true);
      try {
        const url = await uploadToCloudinary(file, "profiles");
        setPhotoURL(url);
      } catch (err: any) {
        console.error("Photo upload failed:", err);
        setPhotoError("Photo upload temporarily unavailable. " + (err.message || "Failed to upload photo."));
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleAddEmergencyContact = () => {
    if (emergencyContacts.length >= 5) return;
    setEmergencyContacts([...emergencyContacts, { name: "", phone: "", relation: "" }]);
  };

  const handleRemoveEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const handleEmergencyContactChange = (index: number, field: "name" | "phone" | "relation", value: string) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError("You must be logged in to complete your profile.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Role-specific validation
    if (selectedRole === "citizen" || selectedRole === "user") {
      if (!phone.trim()) {
        setError("Phone number is required.");
        return;
      }
      // Ensure at least one emergency contact is filled
      const hasFilledContact = emergencyContacts.some(c => c.name.trim() && c.phone.trim());
      if (!hasFilledContact) {
        setError("At least one complete emergency contact is required.");
        return;
      }
    } else if (selectedRole === "volunteer") {
      if (!phone.trim()) {
        setError("Phone number is required.");
        return;
      }
      if (!serviceArea.trim()) {
        setError("Service Area is required.");
        return;
      }
      if (!skills.trim()) {
        setError("Skills field is required.");
        return;
      }
    } else if (selectedRole === "hospital") {
      if (!hospitalAddress.trim()) {
        setError("Hospital Address is required.");
        return;
      }
      if (!phone.trim()) {
        setError("Official contact phone is required.");
        return;
      }
      if (!hospitalServices.trim()) {
        setError("Hospital Services details are required.");
        return;
      }
    } else if (selectedRole === "police") {
      if (!phone.trim()) {
        setError("Official contact phone is required.");
        return;
      }
      if (!policeServiceArea.trim()) {
        setError("Service Area is required.");
        return;
      }
    } else if (selectedRole === "trainer") {
      if (!trainerQualifications.trim()) {
        setError("Qualifications are required.");
        return;
      }
      if (!trainerInfo.trim()) {
        setError("Training Program Information is required.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const uid = currentUser.uid;
      const userRef = doc(db, "users", uid);

      // Construct base profile
      // CRITICAL RULE: Registration role is always "citizen" by default.
      // Specialized roles (volunteer, hospital, police, trainer) require admin verification (PENDING status).
      const isSpecializedRoleRequested = selectedRole !== "citizen" && selectedRole !== "user";

      const profileUpdates: any = {
        uid,
        name: name.trim(),
        email: currentUser.email || "",
        phone: phone.trim(),
        role: "citizen", // Default registration role is strictly "citizen"
        appliedRole: isSpecializedRoleRequested ? selectedRole : "citizen",
        verificationStatus: isSpecializedRoleRequested ? "PENDING" : "VERIFIED",
        provider: currentUser.providerData.some(p => p.providerId === "google.com") ? "google" : "password",
        photoURL,
        city: "",
        state: "",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isOnline: true,
        isProfileComplete: true // CRITICAL!
      };

      // Add role-specific data
      if (selectedRole === "citizen" || selectedRole === "user") {
        profileUpdates.bloodGroup = bloodGroup;
        profileUpdates.medicalInfo = medicalInfo;
        profileUpdates.emergencyContacts = emergencyContacts.filter(c => c.name.trim() && c.phone.trim());
      } else if (selectedRole === "volunteer") {
        profileUpdates.serviceArea = serviceArea.trim();
        profileUpdates.skills = skills.trim();
        profileUpdates.isOnline = false; // OFFLINE by default
        profileUpdates.availability = false; // Never auto mark online
        
        // Seed volunteers collection with PENDING verification status
        const volRef = doc(db, "volunteers", uid);
        await setDoc(volRef, {
          userId: uid,
          fullName: name.trim(),
          phone: phone.trim(),
          serviceArea: serviceArea.trim(),
          skills: skills.trim(),
          availability: false,
          status: "OFFLINE",
          trainingStatus: "Level 1",
          approvalStatus: "PENDING",
          verificationStatus: "PENDING",
          completedRescues: 0,
          rating: 5.0,
          createdAt: serverTimestamp()
        });
      } else if (selectedRole === "hospital") {
        profileUpdates.hospitalName = name.trim();
        profileUpdates.address = hospitalAddress.trim();
        profileUpdates.phone = phone.trim();
        profileUpdates.emergencyAvailability = "24/7 ER Active";
        profileUpdates.traumaCapacity = hospitalServices.trim();
        profileUpdates.location = hospitalLocation.trim();
        profileUpdates.verificationStatus = "PENDING";
      } else if (selectedRole === "police") {
        profileUpdates.stationName = name.trim();
        profileUpdates.officialContact = phone.trim();
        profileUpdates.jurisdiction = policeServiceArea.trim();
        profileUpdates.location = policeLocation.trim();
        profileUpdates.verificationStatus = "PENDING";
      } else if (selectedRole === "trainer") {
        profileUpdates.qualifications = trainerQualifications.trim();
        profileUpdates.trainerInfo = trainerInfo.trim();
        profileUpdates.verificationStatus = "PENDING";
      }

      // Write user profile document
      await setDoc(userRef, profileUpdates);

      // Force context state update by calling updateProfileData in the app (or let real-time listener reload)
      if (updateProfileData) {
        await updateProfileData(profileUpdates);
      }
    } catch (err: any) {
      console.error("Profile saving error:", err);
      setError(err.message || "Failed to save profile data.");
    } finally {
      setSubmitting(false);
    }
  };

  const rolesList = [
    { id: "citizen", title: "Citizen", desc: "Manage medical profile, register ICE contacts, and access automatic crash guardian.", icon: User },
    { id: "volunteer", title: "Good Samaritan (VOLUNTEER)", desc: "Register as a nearby first responder to receive emergency alerts.", icon: Shield },
    { id: "hospital", title: "Trauma Center (HOSPITAL)", desc: "Manage trauma beds, receive incoming crash notifications, and coordinate triage.", icon: Building2 },
    { id: "police", title: "Police / Responder (POLICE)", desc: "Coordinate green corridors and clear accident scenes rapidly.", icon: Car },
    { id: "trainer", title: "First Aid Trainer (TRAINER)", desc: "Conduct certified CPR workshops, audit quiz results, and issue credentials.", icon: BookOpen }
  ] as const;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight">Complete Your Profile</h1>
          <p className="text-sm text-surface-500 max-w-lg mx-auto">
            Please provide your authentic details. GoldenGuard uses role-based security to verify first responders, hospitals, and police units.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Select Role */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-surface-400 tracking-wider">Step 1: Choose Your System Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rolesList.map(roleItem => {
                const IconComponent = roleItem.icon;
                const isSelected = selectedRole === roleItem.id;
                return (
                  <button
                    type="button"
                    key={roleItem.id}
                    onClick={() => {
                      setSelectedRole(roleItem.id);
                      setError(null);
                    }}
                    className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-surface-900 dark:text-white ring-2 ring-amber-500/20"
                        : "bg-surface-50 dark:bg-surface-800/40 border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-700"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      isSelected ? "bg-amber-500 text-black border-amber-400" : "bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700"
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold text-xs sm:text-sm">{roleItem.title}</div>
                      <div className="text-[11px] leading-relaxed text-surface-500 truncate sm:whitespace-normal">{roleItem.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-surface-150 dark:border-surface-800" />

          {/* Step 2: Basic Credentials */}
          <div className="space-y-5">
            <h3 className="text-xs font-black uppercase text-surface-400 tracking-wider">Step 2: Basic Identity & Contact Info</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Upload */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-surface-300 dark:border-surface-700 flex items-center justify-center overflow-hidden bg-surface-50 dark:bg-surface-800/50 relative group">
                  {photoURL ? (
                    <img src={photoURL} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  ) : (
                    <Camera className="w-6 h-6 text-surface-400" />
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold"
                  >
                    Upload Photo
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                {photoError && <div className="text-[10px] text-red-500 font-bold mt-1 absolute">{photoError}</div>}
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                      {selectedRole === "hospital" ? "Official Hospital Name" : selectedRole === "police" ? "Station / Organization Name" : "Full Name"}
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={selectedRole === "hospital" ? "AIIMS Trauma Center" : selectedRole === "police" ? "Bandra Police Station" : "Enter your real name"}
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                      {selectedRole === "hospital" || selectedRole === "police" ? "Official Contact Phone" : "Personal Mobile Number"}
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Registered Email (Read-Only)</label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-100 dark:bg-surface-800 rounded-xl text-xs text-surface-500 font-semibold border border-surface-200 dark:border-surface-800">
                    <Mail className="w-4 h-4 text-surface-400" />
                    <span>{currentUser.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-surface-150 dark:border-surface-800" />

          {/* Step 3: Role-Specific Professional Details */}
          <div className="space-y-5">
            <h3 className="text-xs font-black uppercase text-surface-400 tracking-wider">Step 3: Role Verification Requirements</h3>

            {/* Citizen Fields */}
            {(selectedRole === "citizen" || selectedRole === "user") && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Blood Group (Optional)</label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Medical Information / Allergies (Optional)</label>
                    <input
                      type="text"
                      value={medicalInfo}
                      onChange={e => setMedicalInfo(e.target.value)}
                      placeholder="e.g. Asthmatic, Penicillin allergy"
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-surface-500 tracking-wider">Emergency Contacts (At least 1 Required)</label>
                    <button
                      type="button"
                      onClick={handleAddEmergencyContact}
                      disabled={emergencyContacts.length >= 5}
                      className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Contact
                    </button>
                  </div>

                  <div className="space-y-3">
                    {emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-surface-50 dark:bg-surface-800/20 border border-surface-200 dark:border-surface-800 rounded-2xl">
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            required={idx === 0}
                            type="text"
                            value={contact.name}
                            onChange={e => handleEmergencyContactChange(idx, "name", e.target.value)}
                            placeholder="Contact Name"
                            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                          <input
                            required={idx === 0}
                            type="tel"
                            value={contact.phone}
                            onChange={e => handleEmergencyContactChange(idx, "phone", e.target.value)}
                            placeholder="Phone Number"
                            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                          <input
                            required={idx === 0}
                            type="text"
                            value={contact.relation}
                            onChange={e => handleEmergencyContactChange(idx, "relation", e.target.value)}
                            placeholder="Relation (e.g. Spouse, Father)"
                            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                        {emergencyContacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEmergencyContact(idx)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VOLUNTEER Fields */}
            {selectedRole === "volunteer" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Service Area (Neighborhood/City)</label>
                  <input
                    required
                    type="text"
                    value={serviceArea}
                    onChange={e => setServiceArea(e.target.value)}
                    placeholder="e.g. Connaught Place, New Delhi"
                    className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Skills & Certifications</label>
                  <input
                    required
                    type="text"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder="e.g. Certified CPR, Red Cross First Aid"
                    className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                  />
                </div>
                <div className="sm:col-span-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold leading-normal">
                    Important Note: Your volunteer standby status is default set to OFFLINE. You must manually toggle your dispatcher availability to ONLINE under the Profile or Volunteer Hub to receive nearby live accident dispatch notifications.
                  </div>
                </div>
              </div>
            )}

            {/* HOSPITAL Fields */}
            {selectedRole === "hospital" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Hospital Address</label>
                  <input
                    required
                    type="text"
                    value={hospitalAddress}
                    onChange={e => setHospitalAddress(e.target.value)}
                    placeholder="Enter full physical address of the facility"
                    className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Specialist Emergency Services</label>
                    <input
                      required
                      type="text"
                      value={hospitalServices}
                      onChange={e => setHospitalServices(e.target.value)}
                      placeholder="e.g. 24/7 Level-1 Trauma ICU, Neuro-Triage"
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Geographic Dispatch Coordinates / Region</label>
                    <input
                      required
                      type="text"
                      value={hospitalLocation}
                      onChange={e => setHospitalLocation(e.target.value)}
                      placeholder="e.g. South Delhi District"
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                  <Award className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-700 dark:text-blue-400 font-bold leading-normal">
                    Verification Pending: Official hospital portals default to PENDING_VERIFICATION. Full trauma coordinator access is granted upon verification by GoldenGuard Command Center administrators.
                  </div>
                </div>
              </div>
            )}

            {/* POLICE Fields */}
            {selectedRole === "police" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Assigned Patrol Division / Service Area</label>
                    <input
                      required
                      type="text"
                      value={policeServiceArea}
                      onChange={e => setPoliceServiceArea(e.target.value)}
                      placeholder="e.g. Bandra-Kurla Corridor Division"
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">HQ Coordinates / Landmark</label>
                    <input
                      required
                      type="text"
                      value={policeLocation}
                      onChange={e => setPoliceLocation(e.target.value)}
                      placeholder="e.g. Bandra East, Sector 3"
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                  <Award className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-700 dark:text-blue-400 font-bold leading-normal">
                    Verification Required: Police responder access starts in PENDING_VERIFICATION and requires verification by the administrator.
                  </div>
                </div>
              </div>
            )}

            {/* TRAINER Fields */}
            {selectedRole === "trainer" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Professional CPR/BLS Qualifications</label>
                    <input
                      required
                      type="text"
                      value={trainerQualifications}
                      onChange={e => setTrainerQualifications(e.target.value)}
                      placeholder="e.g. Red Cross BLS Instructor, EMT-B"
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Proposed Training Program Details</label>
                    <input
                      required
                      type="text"
                      value={trainerInfo}
                      onChange={e => setTrainerInfo(e.target.value)}
                      placeholder="e.g. Bystander First Aid Academy Courses"
                      className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                  <Award className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-700 dark:text-blue-400 font-bold leading-normal">
                    Qualifications Audit: Trainers require admin audit verification before they can host official certified workshops.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || uploadingPhoto}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Registering Secure Profile...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Submit & Complete Profile Setup</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
