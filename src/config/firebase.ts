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

if (!isFirebaseEnvValid()) {
  throw new Error(
    '[Firebase] Missing or invalid Firebase configuration. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment (.env.local).'
  );
}

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseEnvConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const isFirebaseConfigured: boolean = true;
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

