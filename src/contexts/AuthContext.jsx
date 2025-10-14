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
        console.error('[AuthContext] Error fetching user data:', error);
        setUserData(null);
        return;
      }
      
      // If no profile exists, we might need to create one
      if (!data || !data.id) {
        console.log('[AuthContext] No user profile found for user:', userId);
        // You can create a profile here if needed
        setUserData(null);
        return;
      }
      
      setUserData(data);
    } catch (error) {
      console.error('[AuthContext] Error fetching user data:', error);
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

  // Check if we're still loading user data specifically
  const isLoadingUserData = () => {
    return !!user && !userData && loading;
  };

  // Robust sign out function
  const signOut = async () => {
    try {
      console.log('[AuthContext] Starting sign out process...');
      
      // Clear local state immediately
      clearUserData();
      
      // Try global sign out first
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.warn('[AuthContext] Global sign out error, trying local:', error);
        // Fallback to local sign out
        await supabase.auth.signOut({ scope: 'local' });
      }
      
      // Clear any remaining local storage
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      console.log('[AuthContext] Sign out completed successfully');
      return { error: null };
      
    } catch (error) {
      console.error('[AuthContext] Sign out failed:', error);
      // Even if sign out fails, clear local state
      clearUserData();
      return { error };
    }
  };

  useEffect(() => {
    
    let isInitialized = false;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchUserData(session.user.id);
        } else {
          console.log("[AuthContext] No session found", error);
        }
      } catch (error) {
        console.error("[AuthContext] Error getting initial session:", error);
      } finally {
        setLoading(false);
        setInitializing(false);
        isInitialized = true;
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthContext] onAuthStateChange event:", event, session?.user?.id);

        // Skip the first SIGNED_IN event during initialization
        if (!isInitialized && event === 'SIGNED_IN') {
          return;
        }

        // Only set loading if we're already initialized
        if (isInitialized) {
          setLoading(true);
        }

        try {
          if (session?.user) {
            setUser(session.user);
            
            // Only fetch user data if we're initialized
            if (isInitialized) {
              await fetchUserData(session.user.id);
            }
          } else {
            clearUserData();
          }
        } catch (error) {
          console.error("[AuthContext] Error handling auth state change:", error);
        } finally {
          // Only set loading=false if we're initialized
          if (isInitialized) {
            setLoading(false);
          }
        }
      }
    );

    // Start the initialization
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
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
    isLoadingUserData,
    fetchUserData,
    clearUserData,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};