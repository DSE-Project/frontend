import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';


const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

const Dashboard = ({ user }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">RecessionScope</h1>
            <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-gray-900 font-medium py-2 px-4 rounded-lg transition hover:bg-gray-100">
                <LogoutIcon />
                Logout
            </button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.email}!</h2>
            <p className="text-gray-500">Here's your recession risk dashboard.</p>
            
        </main>
    </div>
  );
};

export default Dashboard;