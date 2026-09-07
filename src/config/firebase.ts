/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

/**
 * Client-side environment configuration read from Vite
 */
export const firebaseEnvConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Validates whether essential Firebase configuration parameters exist,
 * are non-empty strings, and are not placeholder values.
 */
export function isFirebaseEnvValid(config: FirebaseConfig = firebaseEnvConfig): boolean {
  const { apiKey, projectId } = config;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '' || apiKey === 'undefined' || apiKey.startsWith('your-')) {
    return false;
  }
  if (!projectId || typeof projectId !== 'string' || projectId.trim() === '' || projectId === 'undefined' || projectId.startsWith('your-')) {
    return false;
  }
  return true;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Initialize Firebase only when valid keys are provided
if (isFirebaseEnvValid()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseEnvConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('[Firebase] Initialization error, gracefully falling back to LocalStorage demo mode:', error);
    app = null;
    auth = null;
    db = null;
    googleProvider = null;
  }
}

/**
 * Flag indicating whether live Firebase services are actively initialized.
 */
export const isFirebaseConfigured: boolean = Boolean(app && auth && db);

export { app, auth, db, googleProvider };

export function getFirebaseServices() {
  return {
    app,
    auth,
    db,
    googleProvider,
    isConfigured: isFirebaseConfigured,
  };
}
