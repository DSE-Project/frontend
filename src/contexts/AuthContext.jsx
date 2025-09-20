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
    console.log("[AuthContext] fetchUserData started for user:", userId);
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
      
      console.log("[AuthContext] User data fetched:", data);
      setUserData(data);
    } catch (error) {
      console.error('[AuthContext] Error fetching user data:', error);
      setUserData(null);
    }
  };

  // Clear user data
  const clearUserData = () => {
    console.log("[AuthContext] Clearing user data");
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

  useEffect(() => {
    console.log("[AuthContext] useEffect triggered");
    
    let isInitialized = false;

    // Get initial session
    const getInitialSession = async () => {
      console.log("[AuthContext] getInitialSession started");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("[AuthContext] getSession result:", { session, error });

        if (session?.user) {
          console.log("[AuthContext] Session has user:", session.user.id);
          setUser(session.user);
          await fetchUserData(session.user.id);
        } else {
          console.log("[AuthContext] No session found");
        }
      } catch (error) {
        console.error("[AuthContext] Error getting initial session:", error);
      } finally {
        console.log("[AuthContext] Finished initial session fetch. Setting loading=false, initializing=false");
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
          console.log("[AuthContext] Skipping SIGNED_IN event during initialization");
          return;
        }

        // Only set loading if we're already initialized
        if (isInitialized) {
          console.log("[AuthContext] Setting loading=true for auth change");
          setLoading(true);
        }

        try {
          if (session?.user) {
            console.log("[AuthContext] Auth change has user:", session.user.id);
            setUser(session.user);
            
            // Only fetch user data if we're initialized
            if (isInitialized) {
              await fetchUserData(session.user.id);
            }
          } else {
            console.log("[AuthContext] Auth change has no user, clearing data");
            clearUserData();
          }
        } catch (error) {
          console.error("[AuthContext] Error handling auth state change:", error);
        } finally {
          // Only set loading=false if we're initialized
          if (isInitialized) {
            console.log("[AuthContext] Finished handling auth change, setting loading=false");
            setLoading(false);
          }
        }
      }
    );

    // Start the initialization
    getInitialSession();

    return () => {
      console.log("[AuthContext] Cleanup: unsubscribing from auth listener");
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
  };

  console.log("[AuthContext] Context value:", { 
    hasUser: !!user, 
    hasUserData: !!userData, 
    loading, 
    initializing 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};