import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isGuest?: boolean;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          lastLogin: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
        };
        setUser(newUser);
      } else {
        // Check for guest user in session storage
        const guestUser = sessionStorage.getItem('anemia_guest');
        if (guestUser) {
          setUser(JSON.parse(guestUser));
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user
    } catch (error) {
      console.error("Sign up error:", error);
      throw new Error('Failed to create account. The email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user
    } catch (error) {
      console.error("Sign in error:", error);
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user
    } catch (error) {
      console.error("Google sign in error:", error);
      throw new Error('Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGithub = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        id: `github_${Date.now()}`,
        email: 'user@github.com',
        displayName: 'GitHub User',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      setUser(userData);
      localStorage.setItem('anemia_user', JSON.stringify(userData));
    } catch (error) {
      throw new Error('GitHub sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        email: 'guest@anemia-app.com',
        displayName: 'Guest User',
        isGuest: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      setUser(guestUser);
      sessionStorage.setItem('anemia_guest', JSON.stringify(guestUser));
    } catch (error) {
      throw new Error('Failed to continue as guest');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
      setUser(null);
      sessionStorage.removeItem('anemia_guest');
    } catch (error) {
      console.error("Sign out error:", error);
      throw new Error('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock password reset email sent
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    
    // Here you would typically update the user profile in Firebase Auth and/or Firestore
  };

  const value = {
    user,
    isLoading,
    isGuest: user?.isGuest || false,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signInAsGuest,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};