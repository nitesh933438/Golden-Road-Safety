import React, { createContext, useContext, useState, useEffect } from "react";
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

export type AppRole = "admin" | "trainer" | "user" | "volunteer" | "police" | "hospital" | "responder";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: AppRole;
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
  verificationStatus?: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
  address?: string;
  services?: string;
  location?: string;
  stationName?: string;
  officialContact?: string;
  serviceArea?: string;
  qualifications?: string;
  trainerInfo?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  isUser: boolean;
  isGoogleAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>, photoFile?: File) => Promise<void>;
  setUserRole: (targetUid: string, newRole: AppRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "nitesh933438@gmail.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem("goldenguard_user_profile");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Sync profile to localStorage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("goldenguard_user_profile", JSON.stringify(userProfile));
    } else {
      localStorage.removeItem("goldenguard_user_profile");
    }
  }, [userProfile]);

  // Handle OAuth Redirect Result on Mount
  useEffect(() => {
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
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Clean up previous user listener
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = undefined;
      }

      setCurrentUser(user);

      if (user) {
        setLoading(true);
        const isGoogleProvider = user.providerData.some((p) => p.providerId === "google.com");
        const isAdminEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const userRef = doc(db, "users", user.uid);

        try {
          // Check if document exists in Firestore
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            // First time login: Create profile safely with setDoc merge: true
            const initialRole: AppRole = isAdminEmail ? "admin" : "user";
            const newProfileData = {
              uid: user.uid,
              name: user.displayName || user.email?.split("@")[0] || "GoldenGuard User",
              email: user.email || "",
              phone: "",
              role: initialRole,
              provider: isGoogleProvider ? "google" : "password",
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
            // Existing user: PRESERVE existing role (never reset to "user")
            const existingData = snap.data();
            const existingRole: AppRole = isAdminEmail ? "admin" : (existingData.role || "user");

            const updateData = {
              role: existingRole,
              provider: isGoogleProvider ? "google" : (existingData.provider || "password"),
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
          // Fallback profile if offline/permission issue
          const fallbackRole: AppRole = isAdminEmail ? "admin" : "user";
          setUserProfile((prev) => prev || {
            uid: user.uid,
            name: user.displayName || user.email?.split("@")[0] || "GoldenGuard User",
            email: user.email || "",
            phone: "",
            role: fallbackRole,
            provider: isGoogleProvider ? "google" : "password",
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
          });
        } finally {
          setLoading(false);
        }

        // Attach real-time snapshot listener for document updates
        unsubDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const existingRole: AppRole = isAdminEmail ? "admin" : (data.role || "user");
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
  const loginWithGoogle = async () => {
    try {
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        console.warn("signInWithPopup error/notice:", popupError);
        const errStr = (popupError?.message || popupError?.code || "").toLowerCase();

        // If IndexedDB closed/closing or storage partitioning error occurs
        if (
          errStr.includes("closing") || 
          errStr.includes("indexeddb") || 
          errStr.includes("database") ||
          popupError.code === "auth/internal-error"
        ) {
          console.log("IndexedDB/session adjustment during popup, switching persistence and retrying...");
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
          console.log("Popup blocked/cancelled, attempting redirect...");
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
  };

  // Email/Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login error:", error);
      throw error;
    }
  };

  // Set User Role (Admin management action)
  const setUserRole = async (targetUid: string, newRole: AppRole) => {
    try {
      const targetRef = doc(db, "users", targetUid);
      await setDoc(targetRef, {
        role: newRole,
        uid: targetUid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (targetUid === currentUser?.uid) {
        setUserProfile((prev) => prev ? { ...prev, role: newRole } : null);
      }
    } catch (error) {
      console.error("Error setting user role:", error);
      throw error;
    }
  };

  // Email Signup
  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;

      try {
        await updateProfile(user, { displayName: name });
      } catch (e) {}

      const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name,
        email,
        phone: "",
        role: isAdminEmail ? "admin" : "user",
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
  };

  // Logout
  const logout = async () => {
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, { isOnline: false, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {}
    }
    await signOut(auth);
    setUserProfile(null);
    localStorage.removeItem("goldenguard_user_profile");
  };

  // Update Profile Data
  const updateProfileData = async (updates: Partial<UserProfile>, photoFile?: File) => {
    if (!currentUser) return;

    let photoURL = updates.photoURL || userProfile?.photoURL || "";

    if (photoFile) {
      photoURL = await uploadToCloudinary(photoFile, "profiles");
    }

    const computedRole: AppRole = 
      userProfile?.role === "admin" 
        ? "admin" 
        : (updates.role && updates.role !== "admin" ? updates.role : userProfile?.role || "user");

    const isComplete = updates.isProfileComplete !== undefined 
      ? updates.isProfileComplete 
      : (updates.profileCompleted !== undefined ? updates.profileCompleted : true);

    const finalUpdates = {
      ...updates,
      photoURL,
      role: computedRole,
      updatedAt: serverTimestamp(),
      profileCompleted: isComplete,
      isProfileComplete: isComplete
    };

    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, finalUpdates, { merge: true });

    setUserProfile((prev) => prev ? { 
      ...prev, 
      ...finalUpdates, 
      profileCompleted: isComplete, 
      isProfileComplete: isComplete 
    } : null);
  };

  const isGoogleAdmin = !!(
    currentUser && 
    currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && 
    currentUser.providerData.some((p) => p.providerId === "google.com")
  );

  const currentRole = userProfile?.role || "user";
  const isAdmin = isGoogleAdmin || currentRole === "admin";
  const isTrainer = currentRole === "trainer" || isAdmin;
  const isUser = true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isTrainer,
        isUser,
        isGoogleAdmin,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateProfileData,
        setUserRole
      }}
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
