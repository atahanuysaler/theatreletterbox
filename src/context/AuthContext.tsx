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
import { auth, db, googleProvider } from '../config/firebase';
import { calculateLevel } from '../services/gamification';
import type { UserProfile, UserRole } from '../types';

export const USER_UPDATED_EVENT = 'tiyatronot:user-updated';

export { calculateLevel };

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
  const isDemoMode = false;

  // 1. Initial State Resolution from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
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
          setUser(null);
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

  // 3. Google Sign-In
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
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
  }, []);

  // 4. Logout
  const logout = useCallback(async (): Promise<void> => {
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

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

    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, updates as { [key: string]: any });
      setUser(updatedUser);
      dispatchUserUpdateEvent(updatedUser);
      return updatedUser;
    }

    throw new Error('[Auth] Cannot update profile: No active Firebase authenticated user.');
  }, [user]);

  // 6. Refresh User
  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setUser(profile);
        return profile;
      }
    }
    return null;
  }, []);

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
