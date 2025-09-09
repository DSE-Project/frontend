import { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';


const AuthPage = (props) => {
  const [view, setView] = useState(props.task); // 'login' or 'register'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">RecessionScope</h1>
        <p className="text-gray-500">AI-Powered Recession Risk Forecasting</p>
      </div>
      {view === 'login' ? <Login toggleView={setView} /> : <Register toggleView={setView} />}
      
      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
        >
          Continue without login
        </Link>
      </div>
    </div>
  );
};


export default AuthPage;