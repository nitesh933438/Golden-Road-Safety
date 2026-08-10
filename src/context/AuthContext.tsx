import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
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
  isOnline: boolean;
  emergencyContacts: Array<{ name: string; phone: string; relation: string }>;
  settings: {
    notifications: boolean;
    locationSharing: boolean;
    autoSOS: boolean;
  };
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

  // Auth state listener
  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Clean up previous user listener if it exists
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = undefined;
      }

      setCurrentUser(user);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        
        // Listen to Firestore User Document in real-time
        unsubDoc = onSnapshot(userRef, async (snapshot) => {
          try {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              
              // Determine role: Google Login with ADMIN_EMAIL gets "admin". Otherwise preserve stored role from Firestore!
              const isGoogleProvider = user.providerData.some((p) => p.providerId === "google.com");
              const calculatedRole: AppRole = (isGoogleProvider && user.email === ADMIN_EMAIL) 
                ? "admin" 
                : (data.role || "user");

              setUserProfile({
                ...data,
                role: calculatedRole,
                isProfileComplete: data.isProfileComplete !== false // If not explicitly false, treat existing profiles as complete
              });
            } else {
              // No profile exists yet! Do NOT write a fake/placeholder profile to Firestore.
              // Instead, prepare a partial local state with isProfileComplete: false.
              const isGoogleProvider = user.providerData.some((p) => p.providerId === "google.com");
              const assignedRole = (isGoogleProvider && user.email === ADMIN_EMAIL) ? "admin" : "user";

              setUserProfile({
                uid: user.uid,
                name: user.displayName || "",
                email: user.email || "",
                phone: "",
                role: assignedRole,
                provider: isGoogleProvider ? "google" : "password",
                photoURL: user.photoURL || "",
                city: "",
                state: "",
                bloodGroup: "",
                createdAt: null,
                lastLogin: null,
                isOnline: false,
                emergencyContacts: [],
                settings: {
                  notifications: true,
                  locationSharing: true,
                  autoSOS: true
                },
                isProfileComplete: false
              } as UserProfile);
            }
          } catch (snapshotErr) {
            console.error("Error setting/retrieving user profile in snapshot:", snapshotErr);
          }
        }, (err) => {
          console.warn("Firestore user snapshot note:", err.message);
        });

        // Update last login & online status if profile is complete/exists
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            await updateDoc(userRef, {
              lastLogin: serverTimestamp(),
              isOnline: true
            });
          }
        } catch (e) {}

        setLoading(false);
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
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const isGoogle = true;
      const isAdminEmail = user.email === ADMIN_EMAIL;
      const assignedRole = (isGoogle && isAdminEmail) ? "admin" : "user";

      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || "",
            email: user.email || "",
            phone: "",
            role: assignedRole,
            provider: "google",
            photoURL: user.photoURL || "",
            city: "",
            state: "",
            bloodGroup: "",
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            isOnline: false,
            emergencyContacts: [],
            settings: { notifications: true, locationSharing: true, autoSOS: true },
            isProfileComplete: false
          });
        } else {
          const existingData = docSnap.data();
          const existingRole = existingData?.role || "user";
          const finalRole = (user.email === ADMIN_EMAIL) ? "admin" : existingRole;
          await updateDoc(userRef, {
            role: finalRole,
            provider: "google",
            lastLogin: serverTimestamp(),
            isOnline: true
          });
        }
      } catch (firestoreErr) {
        console.warn("Firestore sync during Google login warning (offline/network):", firestoreErr);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  // Email/Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          await updateDoc(userRef, {
            provider: "password",
            lastLogin: serverTimestamp(),
            isOnline: true
          });
        }
      } catch (firestoreErr) {
        console.warn("Firestore sync during email login warning:", firestoreErr);
      }
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

      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          name,
          email,
          phone: "",
          role: "user",
          provider: "password",
          photoURL: "",
          city: "",
          state: "",
          bloodGroup: "",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isOnline: false,
          emergencyContacts: [],
          settings: { notifications: true, locationSharing: true, autoSOS: true },
          isProfileComplete: false
        });
      } catch (firestoreErr) {
        console.warn("Firestore profile creation on signup warning:", firestoreErr);
      }
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
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          await updateDoc(userRef, { isOnline: false });
        }
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

    const finalUpdates = {
      ...updates,
      photoURL,
      // Security guard: Users cannot elevate role to admin via self-update
      role: computedRole
    };

    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, finalUpdates, { merge: true });

    setUserProfile((prev) => prev ? { ...prev, ...finalUpdates } : null);
  };

  const isGoogleAdmin = !!(
    currentUser && 
    currentUser.email === ADMIN_EMAIL && 
    currentUser.providerData.some((p) => p.providerId === "google.com")
  );

  const currentRole = userProfile?.role || "user";
  const isAdmin = isGoogleAdmin || currentRole === "admin";
  const isTrainer = currentRole === "trainer" || isAdmin;
  const isUser = true; // Everyone has citizen capabilities

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
