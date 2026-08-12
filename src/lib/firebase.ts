import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence 
} from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// Use import.meta.glob so that the build does not fail if firebase-applet-config.json is ignored/missing on GitHub/Vercel
const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const fileConfig = (configs['../../firebase-applet-config.json'] as any)?.default || {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fileConfig.apiKey || "dummy-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fileConfig.authDomain || "goldenguard-7a8ee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fileConfig.projectId || "goldenguard-7a8ee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fileConfig.storageBucket || "goldenguard-7a8ee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId || "364129436292",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fileConfig.appId || "1:364129436292:web:ed797e2cdbddd83db878d1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fileConfig.measurementId || "G-H07B0LRX3Q"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Graceful persistence initialization to avoid IndexedDB "The database is closing" or iframe storage blocks
setPersistence(auth, browserLocalPersistence).catch(async (err) => {
  console.warn("browserLocalPersistence notice, falling back to session persistence:", err);
  try {
    await setPersistence(auth, browserSessionPersistence);
  } catch (e) {
    await setPersistence(auth, inMemoryPersistence).catch(() => {});
  }
});

// Force long polling to bypass iframe/proxy network routing issues in development container environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, fileConfig.firestoreDatabaseId || undefined);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

