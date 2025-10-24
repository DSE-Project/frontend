import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '/logo.png';

const Header = () => {
  const { user, getDisplayName, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const previousLocation = useRef('/dashboard'); // Default fallback location
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-lg sm:text-xl font-bold hover:text-blue-200">
          <img 
            src={logoImage} 
            alt="RecessionScope Logo" 
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
          <span className="block xs:hidden">RecessionScope</span>
          {/* <span className="block xs:hidden">RS</span> */}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {isAuthenticated() ? (
            <div className="flex items-center space-x-4">
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
                  className="bg-blue-500 hover:bg-blue-800 px-4 py-2 rounded transition-colors text-sm"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/auth/login"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors text-sm"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition-colors text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-500">
          <div className="px-4 py-2 space-y-2">
            {isAuthenticated() ? (
              <>
                {isOnProfilePage ? (
                  <button
                    onClick={() => {
                      handleBackClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back</span>
                  </button>
                ) : (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-blue-500 hover:bg-blue-800 px-4 py-2 rounded transition-colors text-center text-sm"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors text-center text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition-colors text-center text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;