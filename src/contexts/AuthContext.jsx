import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';

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

  // Fetch user profile data from Supabase
  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user data:', error);
        setUserData(null);
        return;
      }
      
      setUserData(data);
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
    if (userData && userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    if (user && user.email) {
      return user.email;
    }
    return 'Guest';
  };

  // Get welcome message
  const getWelcomeMessage = () => {
    if (userData && userData.first_name && userData.last_name) {
      return `, ${userData.first_name} ${userData.last_name}`;
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
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
      }
      
      setLoading(false);
      setInitializing(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserData(session.user.id);
        } else {
          clearUserData();
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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