import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc,
  getDocFromServer
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAP6ksECoGgJsXqmi-hsTpQFuvwct-57-M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "goldenguard-7a8ee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "goldenguard-7a8ee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "goldenguard-7a8ee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "364129436292",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:364129436292:web:ed797e2cdbddd83db878d1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-H07B0LRX3Q"
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

// Configure Firestore with auto long-polling detection and persistent/memory local cache to handle offline/network gracefully
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Validate connection to Firestore as per Firebase skill best practices
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firestore running in offline cache mode.");
    }
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


