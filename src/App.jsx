import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/DashBoard';

const AuthPage = () => {
  const [view, setView] = useState('login'); // 'login' or 'register'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">RecessionScope</h1>
        <p className="text-gray-500">AI-Powered Recession Risk Forecasting</p>
      </div>
      {view === 'login' ? <Login toggleView={setView} /> : <Register toggleView={setView} />}
    </div>
  );
};


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div>
      {user ? <Dashboard user={user} /> : <AuthPage />}
    </div>
  );
}

export default App;