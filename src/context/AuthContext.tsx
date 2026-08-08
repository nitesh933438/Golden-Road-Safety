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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        
        // Listen to Firestore User Document in real-time
        const unsubDoc = onSnapshot(userRef, async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            
            // Determine role: Google Login with ADMIN_EMAIL gets "admin". Otherwise preserve stored role from Firestore!
            const isGoogleProvider = user.providerData.some((p) => p.providerId === "google.com");
            const calculatedRole: AppRole = (isGoogleProvider && user.email === ADMIN_EMAIL) 
              ? "admin" 
              : (data.role || "user");

            setUserProfile({
              ...data,
              role: calculatedRole
            });
          } else {
            // First time registration doc creation
            const isGoogleProvider = user.providerData.some((p) => p.providerId === "google.com");
            const assignedRole = (isGoogleProvider && user.email === ADMIN_EMAIL) ? "admin" : "user";

            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split("@")[0] || "Good Samaritan",
              email: user.email || "",
              phone: user.phoneNumber || "+91 98765 43210",
              role: assignedRole,
              provider: isGoogleProvider ? "google" : "password",
              photoURL: user.photoURL || "",
              city: "New Delhi",
              state: "Delhi NCR",
              bloodGroup: "O+",
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              isOnline: true,
              emergencyContacts: [
                { name: "Family Emergency", phone: "+91 98765 00000", relation: "Family" }
              ],
              settings: {
                notifications: true,
                locationSharing: true,
                autoSOS: true
              }
            };

            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        }, (err) => {
          console.warn("Firestore user snapshot note:", err.message);
        });

        // Update last login & online status
        try {
          await updateDoc(userRef, {
            lastLogin: serverTimestamp(),
            isOnline: true
          });
        } catch (e) {}

        setLoading(false);
        return () => unsubDoc();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Login
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const isGoogle = true;
      const isAdminEmail = user.email === ADMIN_EMAIL;
      const assignedRole = (isGoogle && isAdminEmail) ? "admin" : "user";

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "Good Samaritan",
          email: user.email || "",
          phone: "+91 98765 43210",
          role: assignedRole,
          provider: "google",
          photoURL: user.photoURL || "",
          city: "New Delhi",
          state: "Delhi NCR",
          bloodGroup: "O+",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isOnline: true,
          emergencyContacts: [],
          settings: { notifications: true, locationSharing: true, autoSOS: true }
        });
      } else {
        await updateDoc(userRef, {
          role: assignedRole,
          provider: "google",
          lastLogin: serverTimestamp(),
          isOnline: true
        });
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
      
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        provider: "password",
        lastLogin: serverTimestamp(),
        isOnline: true
      }, { merge: true }).catch(() => {});
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

      await updateProfile(user, { displayName: name });

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name,
        email,
        phone: "+91 98765 43210",
        role: "user", // Email/password signups are never admin
        provider: "password",
        photoURL: "",
        city: "New Delhi",
        state: "Delhi NCR",
        bloodGroup: "O+",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isOnline: true,
        emergencyContacts: [],
        settings: { notifications: true, locationSharing: true, autoSOS: true }
      });
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
        await updateDoc(userRef, { isOnline: false });
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
    await updateDoc(userRef, finalUpdates);

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
