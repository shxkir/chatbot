'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { auth } from '@/lib/firebase/client';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  emailSignIn: (email: string, password: string) => Promise<void>;
  emailSignUp: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!auth); // If no auth, not loading

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const emailSignIn = useCallback(async (email: string, password: string) => {
    if (!auth) {
      console.warn('Firebase auth not configured');
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const emailSignUp = useCallback(async (email: string, password: string) => {
    if (!auth) {
      console.warn('Firebase auth not configured');
      return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      console.warn('Firebase auth not configured');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOutUser = useCallback(async () => {
    if (!auth) return; // No-op if auth not configured
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signOutUser,
      emailSignIn,
      emailSignUp,
    }),
    [user, loading, signInWithGoogle, signOutUser, emailSignIn, emailSignUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
