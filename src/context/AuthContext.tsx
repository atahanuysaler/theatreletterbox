import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { DEFAULT_DEMO_USER, localStorageService } from '../services/localStorageService';
import { calculateLevel } from '../services/gamification';
import type { UserProfile, UserRole } from '../types';

export const LOCAL_STORAGE_USER_KEY = 'tiyatronot_current_user';
export const USER_UPDATED_EVENT = 'tiyatronot:user-updated';

export { DEFAULT_DEMO_USER, calculateLevel };

/**
 * Dispatches a reactive update event across components (Header, Profile, Izlediklerim)
 */
export function dispatchUserUpdateEvent(user: UserProfile): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: user }));
  }
}

export interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isDemoMode: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isDemoMode = !isFirebaseConfigured;

  // 1. Initial State Resolution (Firebase vs LocalStorage Demo)
  useEffect(() => {
    const currentAuth = auth;
    const currentDb = db;

    if (!isFirebaseConfigured || !currentAuth || !currentDb) {
      // Demo Mode: load from LocalStorage or seed default demo user
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_USER_KEY) : null;
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(DEFAULT_DEMO_USER);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
          }
        }
      } catch (err) {
        console.warn('[Auth] Error reading user from localStorage:', err);
        setUser(DEFAULT_DEMO_USER);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Firebase Mode: listen to Firebase Auth changes
    const unsubscribe = onAuthStateChanged(currentAuth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(currentDb, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setUser(userSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Tiyatrosever',
              photoURL: firebaseUser.photoURL || '',
              role: 'user',
              xp: 0,
              level: 'Fuaye Meraklısı',
              seenPlayIds: [],
              badges: [],
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
          }
        } catch (err) {
          console.error('[Firebase Auth] Failed to fetch or provision user profile:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Reactive Event Listener: sync user updates across storage & gamification actions
  useEffect(() => {
    const handleUserUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<UserProfile>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener(USER_UPDATED_EVENT, handleUserUpdate);
      return () => window.removeEventListener(USER_UPDATED_EVENT, handleUserUpdate);
    }
  }, []);

  // 3. Google Sign-In / Demo Sign-In
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    if (isDemoMode) {
      console.log('Tiyatronot is running in interactive LocalStorage demo mode. To connect Firebase, run firebase login and set .env.local');
      setUser(DEFAULT_DEMO_USER);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
      }
      dispatchUserUpdateEvent(DEFAULT_DEMO_USER);
      return;
    }

    const currentAuth = auth;
    const currentDb = db;
    const currentProvider = googleProvider;

    if (!currentAuth || !currentDb || !currentProvider) {
      throw new Error('Firebase Auth is not properly configured.');
    }

    try {
      const result = await signInWithPopup(currentAuth, currentProvider);
      const firebaseUser = result.user;
      const userDocRef = doc(currentDb, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      let profile: UserProfile;
      if (userSnap.exists()) {
        profile = userSnap.data() as UserProfile;
      } else {
        profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Tiyatrosever',
          photoURL: firebaseUser.photoURL || '',
          role: 'user',
          xp: 0,
          level: 'Fuaye Meraklısı',
          seenPlayIds: [],
          badges: [],
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, profile);
      }
      setUser(profile);
      dispatchUserUpdateEvent(profile);
    } catch (error) {
      console.error('[Auth] Google sign-in error:', error);
      throw error;
    }
  }, [isDemoMode]);

  // 4. Logout
  const logout = useCallback(async (): Promise<void> => {
    if (isDemoMode) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
      return;
    }

    const currentAuth = auth;
    if (currentAuth) {
      await firebaseSignOut(currentAuth);
      setUser(null);
    }
  }, [isDemoMode]);

  // 5. Update Profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user) return null;

    const newXp = updates.xp !== undefined ? updates.xp : user.xp;
    const newLevel = updates.level !== undefined ? updates.level : calculateLevel(newXp);

    const updatedUser: UserProfile = {
      ...user,
      ...updates,
      xp: newXp,
      level: newLevel,
    };

    if (isDemoMode) {
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
      }
      await localStorageService.updateUserProfile(user.uid, updatedUser);
      dispatchUserUpdateEvent(updatedUser);
      return updatedUser;
    }

    const currentDb = db;
    const currentAuth = auth;
    if (currentDb && currentAuth?.currentUser) {
      const userDocRef = doc(currentDb, 'users', user.uid);
      await updateDoc(userDocRef, updates as { [key: string]: any });
      setUser(updatedUser);
      dispatchUserUpdateEvent(updatedUser);
      return updatedUser;
    }

    return null;
  }, [user, isDemoMode]);

  // 6. Refresh User
  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    if (isDemoMode) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_USER_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setUser(parsed);
        return parsed;
      }
      return user;
    }

    const currentDb = db;
    const currentAuth = auth;
    if (currentDb && currentAuth?.currentUser) {
      const userDocRef = doc(currentDb, 'users', currentAuth.currentUser.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setUser(profile);
        return profile;
      }
    }
    return null;
  }, [user, isDemoMode]);

  const role: UserRole = user?.role ?? 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isDemoMode,
        loading,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthSafe = (): AuthContextType | null => {
  return useContext(AuthContext) || null;
};

export default AuthContext;
