import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  getRedirectResult,
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

  // Auth state listener
  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Clean up previous user listener if it exists
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = undefined;
      }

      setCurrentUser(user);

      if (user) {
        const isGoogleProvider = user.providerData.some((p) => p.providerId === "google.com");
        const defaultRole: AppRole = (user.email === ADMIN_EMAIL) ? "admin" : "user";

        const fallbackProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split("@")[0] || "GoldenGuard User",
          email: user.email || "",
          phone: "",
          role: defaultRole,
          provider: isGoogleProvider ? "google" : "password",
          photoURL: user.photoURL || "",
          city: "",
          state: "",
          bloodGroup: "",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isOnline: true,
          emergencyContacts: [],
          settings: {
            notifications: true,
            locationSharing: true,
            autoSOS: true
          },
          profileCompleted: false,
          isProfileComplete: false
        };

        // Populate fallback profile immediately if none set yet
        setUserProfile((prev) => prev || fallbackProfile);

        const userRef = doc(db, "users", user.uid);
        
        // Listen to Firestore User Document in real-time
        unsubDoc = onSnapshot(userRef, (snapshot) => {
          try {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const existingRole = data.role || defaultRole;
              const finalRole: AppRole = (user.email === ADMIN_EMAIL) ? "admin" : existingRole;

              const isComplete = data.isProfileComplete !== false && data.profileCompleted !== false;

              setUserProfile({
                ...fallbackProfile,
                ...data,
                role: finalRole,
                profileCompleted: isComplete,
                isProfileComplete: isComplete
              } as UserProfile);
            } else {
              // Document does not exist in Firestore yet
              setUserProfile(fallbackProfile);

              // Auto-create minimal profile in Firestore in background
              setDoc(userRef, {
                uid: user.uid,
                name: user.displayName || user.email?.split("@")[0] || "GoldenGuard User",
                email: user.email || "",
                phone: "",
                role: defaultRole,
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
              }, { merge: true }).catch((err) => {
                console.warn("Background user document note:", err.message);
              });
            }
          } catch (snapshotErr) {
            console.error("Error parsing user profile in snapshot:", snapshotErr);
            setUserProfile(fallbackProfile);
          } finally {
            setLoading(false);
          }
        }, (err) => {
          console.warn("Firestore user snapshot listener notice (using auth fallback):", err.message);
          setUserProfile(fallbackProfile);
          setLoading(false);
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

  // Google Login
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user) return;

      const isAdminEmail = user.email === ADMIN_EMAIL;
      const assignedRole: AppRole = isAdminEmail ? "admin" : "user";

      const userRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || user.email?.split("@")[0] || "GoldenGuard User",
            email: user.email || "",
            phone: "",
            role: assignedRole,
            provider: "google",
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
          });
        } else {
          const existingData = docSnap.data();
          const existingRole = existingData?.role || "user";
          // NEVER overwrite an existing user's role during Google login unless ADMIN_EMAIL
          const finalRole: AppRole = isAdminEmail ? "admin" : existingRole;

          await updateDoc(userRef, {
            role: finalRole,
            provider: "google",
            photoURL: user.photoURL || existingData?.photoURL || "",
            updatedAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            isOnline: true
          });
        }
      } catch (firestoreErr: any) {
        console.warn("Firestore sync during Google login warning:", firestoreErr.message);
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
      const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          await updateDoc(userRef, {
            provider: "password",
            updatedAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            isOnline: true
          });
        } else {
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || email.split("@")[0] || "GoldenGuard User",
            email: user.email || email,
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
          });
        }
      } catch (firestoreErr: any) {
        console.warn("Firestore sync during email login warning:", firestoreErr.message);
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
      const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
        });
      } catch (firestoreErr: any) {
        console.warn("Firestore profile creation on signup warning:", firestoreErr.message);
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

    const isComplete = updates.isProfileComplete !== undefined 
      ? updates.isProfileComplete 
      : (updates.profileCompleted !== undefined ? updates.profileCompleted : true);

    const finalUpdates = {
      ...updates,
      photoURL,
      // Security guard: Users cannot elevate role to admin via self-update
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
