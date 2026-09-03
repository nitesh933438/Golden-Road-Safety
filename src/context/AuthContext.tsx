import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserSessionPersistence,
  inMemoryPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { uploadToCloudinary } from "../lib/cloudinary";
import { safeLocalStorage } from "../lib/utils";

export type AppRole = "admin" | "trainer" | "citizen" | "user" | "volunteer" | "police" | "hospital" | "dispatcher";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: AppRole;
  appliedRole?: AppRole;
  verificationStatus?: VerificationStatus;
  provider: "google" | "password";
  photoURL: string;
  city: string;
  state: string;
  bloodGroup: string;
  createdAt: any;
  lastLogin: any;
  lastLoginAt?: any;
  updatedAt?: any;
  isOnline: boolean;
  emergencyContacts: Array<{ name: string; phone: string; relation: string }>;
  settings: {
    notifications: boolean;
    locationSharing: boolean;
    autoSOS: boolean;
  };
  profileCompleted?: boolean;
  isProfileComplete?: boolean;
  address?: string;
  services?: string;
  location?: string;
  stationName?: string;
  hospitalName?: string;
  officialContact?: string;
  serviceArea?: string;
  jurisdiction?: string;
  emergencyAvailability?: string;
  traumaCapacity?: string;
  qualifications?: string;
  trainerInfo?: string;
  skills?: string;
  medicalInfo?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  isVolunteer: boolean;
  isHospital: boolean;
  isPolice: boolean;
  isUser: boolean;
  isVerified: boolean;
  isGoogleAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>, photoFile?: File) => Promise<void>;
  setUserRole: (targetUid: string, newRole: AppRole, newVerificationStatus?: VerificationStatus) => Promise<void>;
  updateUserVerification: (targetUid: string, status: VerificationStatus, assignedRole?: AppRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "nitesh933438@gmail.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isGoogleProvider = (user: FirebaseUser | null): boolean => {
    if (!user) return false;
    return user.providerData.some((p) => p.providerId === "google.com") || user.providerId === "google.com";
  };

  const isAdminUser = (user: FirebaseUser | null, profile?: UserProfile | null): boolean => {
    const email = user?.email || user?.providerData?.[0]?.email || profile?.email || "";
    if (!email) return false;
    return email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() || email.trim().toLowerCase() === "nitesh933438@gmail.com";
  };

  // Sync profile to localStorage securely
  useEffect(() => {
    if (userProfile) {
      safeLocalStorage.setItem("goldenguard_user_profile", JSON.stringify(userProfile));
    } else {
      safeLocalStorage.removeItem("goldenguard_user_profile");
    }
  }, [userProfile]);

  // Handle OAuth Redirect Result on Mount
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Completed Google Login via redirect:", result.user.email);
        }
      })
      .catch((err) => {
        console.warn("Google redirect auth note:", err?.message || err);
      });
  }, []);

  // Centralized Auth state & Firestore user document listener
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Clean up previous user listener
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = undefined;
      }

      setCurrentUser(user);

      if (user) {
        const isGoogle = isGoogleProvider(user);
        const isAdmin = isAdminUser(user);
        const fallbackRole: AppRole = isAdmin ? "admin" : "citizen";

        // If we don't have a profile yet or it's a different user, set an instant fallback profile
        setUserProfile((prev) => {
          if (!prev || prev.uid !== user.uid) {
            return {
              uid: user.uid,
              name: user.displayName || user.email?.split("@")[0] || "GoldenGuard User",
              email: user.email || "",
              phone: "",
              role: fallbackRole,
              provider: isGoogle ? "google" : "password",
              photoURL: user.photoURL || "",
              city: "",
              state: "",
              bloodGroup: "",
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isOnline: true,
              emergencyContacts: [],
              settings: { notifications: true, locationSharing: true, autoSOS: true },
              profileCompleted: false,
              isProfileComplete: false
            } as UserProfile;
          }
          return prev;
        });

        setLoading(false);

        if (!db) return;
        const userRef = doc(db, "users", user.uid);

        try {
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            const initialRole: AppRole = isAdminUser(user) ? "admin" : "citizen";
            const newProfileData = {
              uid: user.uid,
              name: user.displayName || user.email?.split("@")[0] || "GoldenGuard User",
              email: user.email || "",
              phone: "",
              role: initialRole,
              provider: isGoogle ? "google" : "password",
              photoURL: user.photoURL || "",
              city: "",
              state: "",
              bloodGroup: "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
              accountStatus: "active",
              isOnline: true,
              emergencyContacts: [],
              settings: { notifications: true, locationSharing: true, autoSOS: true },
              profileCompleted: false,
              isProfileComplete: false
            };

            await setDoc(userRef, newProfileData, { merge: true });

            setUserProfile({
              ...newProfileData,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            } as UserProfile);
          } else {
            const existingData = snap.data();
            const isUserAdmin = isAdminUser(user, existingData as UserProfile);
            const rawRole = existingData.role || "citizen";
            const existingRole: AppRole = isUserAdmin ? "admin" : (rawRole === "admin" ? "citizen" : (rawRole === "user" ? "citizen" : rawRole));

            const updateData = {
              role: existingRole,
              provider: isGoogle ? "google" : (existingData.provider || "password"),
              photoURL: user.photoURL || existingData.photoURL || "",
              updatedAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
              isOnline: true
            };

            await setDoc(userRef, updateData, { merge: true });

            const isComplete = existingData.isProfileComplete !== false && existingData.profileCompleted !== false;

            setUserProfile({
              ...existingData,
              ...updateData,
              role: existingRole,
              uid: user.uid,
              email: user.email || existingData.email || "",
              name: existingData.name || user.displayName || user.email?.split("@")[0] || "GoldenGuard User",
              profileCompleted: isComplete,
              isProfileComplete: isComplete
            } as UserProfile);
          }
        } catch (firestoreErr: any) {
          console.warn("Firestore profile sync warning:", firestoreErr.message);
        }

        // Attach real-time snapshot listener for document updates
        unsubDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const isUserAdmin = isAdminUser(user, data as UserProfile);
            const rawRole = data.role || "citizen";
            const existingRole: AppRole = isUserAdmin ? "admin" : (rawRole === "admin" ? "citizen" : (rawRole === "user" ? "citizen" : rawRole));
            const isComplete = data.isProfileComplete !== false && data.profileCompleted !== false;

            setUserProfile((prev) => ({
              ...prev,
              ...data,
              uid: user.uid,
              role: existingRole,
              profileCompleted: isComplete,
              isProfileComplete: isComplete
            }) as UserProfile);
          }
        }, (err) => {
          console.warn("User profile snapshot listener note:", err.message);
        });

      } else {
        setUserProfile(null);
        safeLocalStorage.removeItem("goldenguard_user_profile");
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) {
        unsubDoc();
      }
    };
  }, []);

  // Google Login
  const loginWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase Auth is not configured. Please check your environment variables.");
    }
    try {
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        console.warn("signInWithPopup error/notice:", popupError);
        const errStr = (popupError?.message || popupError?.code || "").toLowerCase();

        if (
          errStr.includes("closing") || 
          errStr.includes("indexeddb") || 
          errStr.includes("database") ||
          popupError.code === "auth/internal-error"
        ) {
          try {
            await setPersistence(auth, browserSessionPersistence);
          } catch (pErr) {
            await setPersistence(auth, inMemoryPersistence).catch(() => {});
          }
          result = await signInWithPopup(auth, googleProvider);
        } else if (
          popupError.code === "auth/popup-blocked" ||
          popupError.code === "auth/cancelled-popup-request"
        ) {
          await signInWithRedirect(auth, googleProvider);
          return;
        } else {
          throw popupError;
        }
      }

      if (!result?.user) return;
    } catch (error: any) {
      console.error("Google login error:", error);
      throw error;
    }
  }, []);

  // Email/Password Login
  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not configured. Please check your environment variables.");
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login error:", error);
      throw error;
    }
  }, []);

  // Set User Role (Admin management action)
  const setUserRole = useCallback(async (targetUid: string, newRole: AppRole, newVerificationStatus?: VerificationStatus) => {
    if (!db) {
      throw new Error("Firebase Firestore is not configured. Please check your environment variables.");
    }
    try {
      const targetRef = doc(db, "users", targetUid);
      const updateData: any = {
        role: newRole,
        updatedAt: serverTimestamp()
      };
      if (newVerificationStatus) {
        updateData.verificationStatus = newVerificationStatus;
      } else if (newRole === "user" || newRole === "citizen") {
        updateData.verificationStatus = "VERIFIED";
      }
      await setDoc(targetRef, updateData, { merge: true });

      if (targetUid === currentUser?.uid) {
        setUserProfile((prev) => prev ? { 
          ...prev, 
          role: newRole, 
          verificationStatus: newVerificationStatus || prev.verificationStatus 
        } : null);
      }
    } catch (error) {
      console.error("Error setting user role:", error);
      throw error;
    }
  }, [currentUser?.uid]);

  // Update User Verification Status (Admin management action)
  const updateUserVerification = useCallback(async (targetUid: string, status: VerificationStatus, assignedRole?: AppRole) => {
    if (!db) {
      throw new Error("Firebase Firestore is not configured. Please check your environment variables.");
    }
    try {
      const targetRef = doc(db, "users", targetUid);
      const updateData: any = {
        verificationStatus: status,
        updatedAt: serverTimestamp()
      };

      if (status === "VERIFIED" && assignedRole) {
        updateData.role = assignedRole;
      }

      await setDoc(targetRef, updateData, { merge: true });

      if (targetUid === currentUser?.uid) {
        setUserProfile((prev) => prev ? {
          ...prev,
          verificationStatus: status,
          role: (status === "VERIFIED" && assignedRole) ? assignedRole : prev.role
        } : null);
      }
    } catch (error) {
      console.error("Error updating user verification:", error);
      throw error;
    }
  }, [currentUser?.uid]);

  // Email Signup
  const signupWithEmail = useCallback(async (email: string, pass: string, name: string) => {
    if (!auth || !db) {
      throw new Error("Firebase is not configured. Please check your environment variables.");
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;

      try {
        await updateProfile(user, { displayName: name });
      } catch (e) {}

      // SECURITY: Email/password signup can NEVER be admin
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name,
        email,
        phone: "",
        role: "citizen",
        verificationStatus: "VERIFIED",
        provider: "password",
        photoURL: "",
        city: "",
        state: "",
        bloodGroup: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        accountStatus: "active",
        isOnline: true,
        emergencyContacts: [],
        settings: { notifications: true, locationSharing: true, autoSOS: true },
        profileCompleted: false,
        isProfileComplete: false
      }, { merge: true });
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (!auth) return;
    if (currentUser && db) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, { isOnline: false, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {}
    }
    await signOut(auth);
    setUserProfile(null);
    safeLocalStorage.removeItem("goldenguard_user_profile");
  }, [currentUser]);

  // Update Profile Data
  const updateProfileData = useCallback(async (updates: Partial<UserProfile>, photoFile?: File) => {
    if (!currentUser || !db) return;

    let photoURL = updates.photoURL || userProfile?.photoURL || "";

    if (photoFile) {
      photoURL = await uploadToCloudinary(photoFile, "profiles");
    }

    const isCurrentUserAdmin = isAdminUser(currentUser);

    const computedRole: AppRole = isCurrentUserAdmin
      ? (updates.role || userProfile?.role || "admin")
      : (userProfile?.role || "citizen");

    const computedVerificationStatus: VerificationStatus | undefined = isCurrentUserAdmin
      ? (updates.verificationStatus || userProfile?.verificationStatus)
      : userProfile?.verificationStatus;

    const isComplete = updates.isProfileComplete !== undefined 
      ? updates.isProfileComplete 
      : (updates.profileCompleted !== undefined ? updates.profileCompleted : true);

    const finalUpdates = {
      ...updates,
      photoURL,
      role: computedRole,
      ...(computedVerificationStatus ? { verificationStatus: computedVerificationStatus } : {}),
      updatedAt: serverTimestamp(),
      profileCompleted: isComplete,
      isProfileComplete: isComplete
    };

    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, finalUpdates, { merge: true });

    setUserProfile((prev) => prev ? { 
      ...prev, 
      ...finalUpdates, 
      role: computedRole,
      profileCompleted: isComplete, 
      isProfileComplete: isComplete 
    } : null);
  }, [currentUser, userProfile]);

  const isAdmin = isAdminUser(currentUser, userProfile); 
  const isGoogleAdmin = isAdmin;

  const rawRole = userProfile?.role || "citizen";
  const currentRole = isAdmin ? "admin" : (rawRole === "user" ? "citizen" : rawRole);
  const isTrainer = currentRole === "trainer" || isAdmin;
  const isVolunteer = currentRole === "volunteer";
  const isHospital = currentRole === "hospital";
  const isPolice = currentRole === "police";
  const isUser = true;
  const isVerified = isAdmin || userProfile?.verificationStatus === "VERIFIED";

  // Enforce role in the exposed profile object to prevent any UI mismatch
  const exposedUserProfile = userProfile ? { ...userProfile, role: currentRole as AppRole } : null;

  const contextValue = React.useMemo(() => ({
    currentUser,
    userProfile: exposedUserProfile,
    loading,
    isAdmin,
    isTrainer,
    isVolunteer,
    isHospital,
    isPolice,
    isUser,
    isVerified,
    isGoogleAdmin,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    updateProfileData,
    setUserRole,
    updateUserVerification
  }), [
    currentUser,
    userProfile,
    loading,
    isAdmin,
    isTrainer,
    isVolunteer,
    isHospital,
    isPolice,
    isUser,
    isVerified,
    isGoogleAdmin,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    updateProfileData,
    setUserRole,
    updateUserVerification
  ]);

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
