import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import Dashboard from './pages/DashBoard';
import AuthPage from './pages/AuthPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

    if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user} />} />
      <Route path="/auth/login" element={user ? <Navigate to="/" replace /> : <AuthPage task={'login'} />} />
      <Route path="/auth/register" element={user ? <Navigate to="/" replace /> : <AuthPage task={'register'} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;