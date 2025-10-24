import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '/logo.png';

const Header = () => {
  const { user, getDisplayName, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const previousLocation = useRef('/dashboard'); // Default fallback location

  // Track previous location for back navigation
  useEffect(() => {
    // Only update previous location if we're not on the profile page
    // This ensures we remember where the user came from before visiting profile
    if (location.pathname !== '/profile') {
      previousLocation.current = location.pathname;
    }
  }, [location.pathname]);

  // Check if user is currently on profile page
  const isOnProfilePage = location.pathname === '/profile';

  const handleBackClick = () => {
    // Navigate back to the previous location
    navigate(previousLocation.current);
  };

  const handleSignOut = async () => {
    // console.log('Signing out user...');
    try {
      // console.log('Current user before sign out:', user);
      
      const { error } = await signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        // Even with error, continue with cleanup
      } else {
        console.log('User signed out successfully');
      }
      
      // Navigate to home page after sign out
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      // Last resort: navigate to home to clear everything
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold hover:text-blue-200">
          <img 
            src={logoImage} 
            alt="RecessionScope Logo" 
            className="h-8 w-8"
          />
          <span>RecessionScope</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          {isAuthenticated() ? (
            <div className="flex items-center space-x-4">
              {/* <span className="text-sm">Welcome, {getDisplayName()}</span> */}
              {isOnProfilePage ? (
                <button
                  onClick={handleBackClick}
                  className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded transition-colors text-sm flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>
              ) : (
                <Link
                  to="/profile"
                  className="bg-blue-500 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/auth/login"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;