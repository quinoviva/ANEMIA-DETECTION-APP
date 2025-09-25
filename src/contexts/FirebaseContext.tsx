import React, { createContext, useContext, ReactNode } from 'react';

// Mock Firebase configuration and services
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface FirebaseContextType {
  config: FirebaseConfig;
  initialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  // Mock Firebase configuration for the anemia-1a16d project
  const config: FirebaseConfig = {
    apiKey: "<<INSERT_FIREBASE_API_KEY>>",
    authDomain: "anemia-1a16d.firebaseapp.com",
    projectId: "anemia-1a16d",
    storageBucket: "anemia-1a16d.appspot.com",
    messagingSenderId: "710836108374",
    appId: "<<INSERT_FIREBASE_APP_ID>>"
  };

  const value = {
    config,
    initialized: true
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};