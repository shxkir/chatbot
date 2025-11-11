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

interface User {
  email: string;
  uid: string;
  fullName: string;
  username: string;
  createdAt: string;
}

interface UserData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  createdAt: string;
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  emailSignIn: (email: string, password: string) => Promise<void>;
  emailSignUp: (email: string, password: string, fullName: string, username: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = localStorage.getItem('chatbot_user');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
    setLoading(false);
  }, []);

  const emailSignIn = useCallback(async (email: string, password: string) => {
    // Get users from localStorage
    const usersData = localStorage.getItem('chatbot_users');
    const users: Record<string, UserData> = usersData ? JSON.parse(usersData) : {};

    // Check if user exists and password matches
    if (users[email] && users[email].password === password) {
      const userData = users[email];
      const newUser: User = {
        email: userData.email,
        uid: btoa(email), // Simple uid generation
        fullName: userData.fullName,
        username: userData.username,
        createdAt: userData.createdAt,
      };
      setUser(newUser);
      localStorage.setItem('chatbot_user', JSON.stringify(newUser));
    } else {
      throw new Error('Invalid email or password');
    }
  }, []);

  const emailSignUp = useCallback(async (email: string, password: string, fullName: string, username: string) => {
    // Validate email format
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Validate full name
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    // Validate username
    if (!username || username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    // Get existing users
    const usersData = localStorage.getItem('chatbot_users');
    const users: Record<string, UserData> = usersData ? JSON.parse(usersData) : {};

    // Check if email already exists
    if (users[email]) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const usernameExists = Object.values(users).some(user => user.username === username);
    if (usernameExists) {
      throw new Error('Username already taken');
    }

    // Add new user
    const userData: UserData = {
      email,
      password,
      fullName: fullName.trim(),
      username: username.trim(),
      createdAt: new Date().toISOString(),
    };
    users[email] = userData;
    localStorage.setItem('chatbot_users', JSON.stringify(users));

    // Sign in the new user
    const newUser: User = {
      email,
      uid: btoa(email),
      fullName: userData.fullName,
      username: userData.username,
      createdAt: userData.createdAt,
    };
    setUser(newUser);
    localStorage.setItem('chatbot_user', JSON.stringify(newUser));
  }, []);

  const signOutUser = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('chatbot_user');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      emailSignIn,
      emailSignUp,
      signOutUser,
    }),
    [user, loading, emailSignIn, emailSignUp, signOutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSimpleAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}
