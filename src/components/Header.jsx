import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const Header = ({ user }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-blue-200">
          US Recession Forecasting
        </Link>
        
        <nav className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              {/* <span className="text-sm">Welcome, {user.email}</span> */}
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/auth/login"
                className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
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