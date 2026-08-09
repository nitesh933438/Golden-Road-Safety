import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use import.meta.glob so that the build does not fail if firebase-applet-config.json is ignored/missing on GitHub/Vercel
const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const fileConfig = (configs['../../firebase-applet-config.json'] as any)?.default || {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fileConfig.apiKey || "dummy-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fileConfig.authDomain || "dummy-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fileConfig.projectId || "dummy-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fileConfig.storageBucket || "dummy-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fileConfig.appId || "1:123456789:web:123456789"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, fileConfig.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();
