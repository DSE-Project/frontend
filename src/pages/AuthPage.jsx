import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';


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


export default AuthPage;