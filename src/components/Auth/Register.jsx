import React, { useState } from 'react';
import { supabase } from '../../supabase/supabase';

const Register = ({ toggleView }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both first and last name.");
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              email: email,
              created_at: new Date().toISOString(),
            }
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't throw here as the user account was created successfully
        }

        setMessage('Registration successful! Please check your email to confirm your account.');
      }
      
    } catch (err) {
      // Beautify error messages
      let errorMessage = '';
      switch (err.message) {
        case 'User already registered':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'Password should be at least 6 characters':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'Unable to validate email address: invalid format':
          errorMessage = 'Please enter a valid email address.';
          break;
        default:
          errorMessage = err.message || 'Registration failed. Please try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">Create Account</h2>
        <p className="text-gray-500 text-center mb-6">Join us to start forecasting risks</p>
        <form onSubmit={handleRegister}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="First name" 
                    required 
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Last name" 
                    required 
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {message && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
                </div>
              </div>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
        </form>
        <p className="text-center text-gray-500 mt-6">
            Already have an account?
            <button onClick={() => toggleView('login')} className="text-blue-600 font-semibold ml-1 hover:underline">Login</button>
        </p>
    </div>
  );
};

export default Register;