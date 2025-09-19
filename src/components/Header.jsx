import React from 'react';
import { Link } from 'react-router-dom';
import { supabaseClient } from '../supabase/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, getDisplayName, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-blue-200">
          Recession Scope
        </Link>
        
        <nav className="flex items-center space-x-4">
          {isAuthenticated() ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {getDisplayName()}</span>
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