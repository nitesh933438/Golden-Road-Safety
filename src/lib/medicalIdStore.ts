import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary?: boolean;
}

export interface MedicalIDData {
  uid: string;
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string;
  currentMedicines: string;
  medicalConditions: string;
  organDonor: boolean;
  emergencyContacts: EmergencyContact[];
  insuranceProvider: string;
  insurancePolicyNumber: string;
  doctorName: string;
  doctorPhone: string;
  preferredHospital: string;
  photoURL: string;
  updatedAt: string | number;
}

export const DEFAULT_MEDICAL_ID: MedicalIDData = {
  uid: "default_user",
  fullName: "Dr. Aarav Sharma",
  dob: "1992-05-14",
  gender: "Male",
  bloodGroup: "O+",
  height: "178 cm",
  weight: "72 kg",
  allergies: "Penicillin, Peanuts",
  currentMedicines: "Aspirin 75mg daily, Multivitamins",
  medicalConditions: "Mild Asthma, Type 1 Diabetes",
  organDonor: true,
  emergencyContacts: [
    { id: "c1", name: "Priya Sharma", phone: "+91 98765 00001", relation: "Spouse", isPrimary: true },
    { id: "c2", name: "Ramesh Sharma", phone: "+91 98765 00002", relation: "Father" },
    { id: "c3", name: "Dr. Vikram Sethi", phone: "+91 98765 00003", relation: "Personal Doctor" }
  ],
  insuranceProvider: "Star Health Emergency Care",
  insurancePolicyNumber: "SH-8821940-IND",
  doctorName: "Dr. K. S. Verma",
  doctorPhone: "+91 98111 22233",
  preferredHospital: "Max Super Speciality Hospital, Saket, New Delhi",
  photoURL: "",
  updatedAt: Date.now()
};

const LOCAL_STORAGE_KEY = "goldenguard_medical_id";

/**
 * Get Medical ID from Local Storage or Default fallback
 */
export function getLocalMedicalID(): MedicalIDData {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("Medical ID parse error:", e);
    }
  }
  return DEFAULT_MEDICAL_ID;
}

/**
 * Save Medical ID locally and sync to Firestore
 */
export async function saveMedicalID(data: MedicalIDData): Promise<void> {
  const updated = {
    ...data,
    updatedAt: Date.now()
  };

  // Save in LocalStorage for offline lockscreen access
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  // If online & valid UID, sync to Firestore
  if (navigator.onLine && data.uid && data.uid !== "default_user") {
    try {
      const docRef = doc(db, "medicalIDs", data.uid);
      await setDoc(docRef, {
        ...updated,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore Medical ID sync failed, saved locally:", err);
    }
  }
}

/**
 * Fetch Medical ID from Firestore with Local Fallback
 */
export async function fetchRemoteMedicalID(uid: string): Promise<MedicalIDData> {
  if (!uid || uid === "default_user") {
    return getLocalMedicalID();
  }

  try {
    if (navigator.onLine) {
      const docRef = doc(db, "medicalIDs", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const remoteData = snap.data() as MedicalIDData;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteData));
        return remoteData;
      }
    }
  } catch (err) {
    console.warn("Remote Medical ID fetch failed:", err);
  }

  return getLocalMedicalID();
}
