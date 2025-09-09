import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data());
      } else {
        console.log('No user document found');
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  // Clear user data
  const clearUserData = () => {
    setUser(null);
    setUserData(null);
  };

  // Get display name
  const getDisplayName = () => {
    if (userData && userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    if (user && user.email) {
      return user.email;
    }
    return 'Guest';
  };

  // Get welcome message
  const getWelcomeMessage = () => {
    if (userData && userData.firstName && userData.lastName) {
      return `, ${userData.firstName} ${userData.lastName}`;
    }
    if (user && user.email) {
      return `, ${user.email}`;
    }
    return '';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user data is loaded
  const isUserDataLoaded = () => {
    return !!userData;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        clearUserData();
      }
      
      setLoading(false);
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [initializing]);

  const value = {
    // State
    user,
    userData,
    loading,
    initializing,
    
    // Helper functions
    getDisplayName,
    getWelcomeMessage,
    isAuthenticated,
    isUserDataLoaded,
    fetchUserData,
    clearUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};