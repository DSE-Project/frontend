import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/supabase';
import Header from '../components/Header';

const UserProfile = () => {
  const { user, userData, fetchUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setFirstName(userData.first_name || '');
      setLastName(userData.last_name || '');
    }
  }, [userData]);

  // Fetch saved reports
  useEffect(() => {
    if (user) {
      //fetchSavedReports();
      fetchUserReportsFromStorage()
    }
  }, [user]);

  // const fetchSavedReports = async () => {
  //   try {
  //     setLoadingReports(true);
  //     const { data, error } = await supabase
  //       .from('saved_reports')
  //       .select('*')
  //       .eq('user_id', user.id)
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;
  //     setSavedReports(data || []);
  //   } catch (error) {
  //     console.error('Error fetching saved reports:', error);
  //     setMessage({ type: 'error', text: 'Failed to load saved reports' });
  //   } finally {
  //     setLoadingReports(false);
  //   }
  // };


  // Fetch user reports from Supabase Storage
const fetchUserReportsFromStorage = async () => {
  try {
    setLoadingReports(true);

    // 1️⃣ List all files in the user’s folder inside the bucket
    const { data: files, error } = await supabase.storage
      .from("user-reports")
      .list(user.id + "/", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (error) throw error;
    if (!files || files.length === 0) {
      setSavedReports([]);
      return;
    }

    // 2️⃣ For each file, generate a signed URL (valid 1 hour)
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data: signed } = await supabase.storage
          .from("user-reports")
          .createSignedUrl(`${user.id}/${file.name}`, 60 * 60);
        return {
          name: file.name,
          created_at: file.created_at,
          url: signed?.signedUrl,
        };
      })
    );

    setSavedReports(filesWithUrls);
  } catch (err) {
    console.error("Error fetching reports from storage:", err);
    setMessage({ type: "error", text: "Failed to load reports from storage." });
  } finally {
    setLoadingReports(false);
  }
};


  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      const profileData = {
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: user.email,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('id', user.id);
      } else {
        // Insert new profile
        profileData.created_at = new Date().toISOString();
        result = await supabase
          .from('user_profiles')
          .insert([profileData]);
      }

      if (result.error) throw result.error;

      // Refresh user data
      await fetchUserData(user.id);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedReports(prev => prev.filter(report => report.id !== reportId));
      setMessage({ type: 'success', text: 'Report deleted successfully!' });
    } catch (error) {
      console.error('Error deleting report:', error);
      setMessage({ type: 'error', text: 'Failed to delete report. Please try again.' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
            
            {/* Message Display */}
            {message.text && (
              <div className={`mb-4 p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">
                        {userData?.first_name && userData?.last_name 
                          ? `${userData.first_name} ${userData.last_name}`
                          : 'Not set'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-600 text-sm">Email cannot be changed</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFirstName(userData?.first_name || '');
                          setLastName(userData?.last_name || '');
                          setMessage({ type: '', text: '' });
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Account Statistics */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Member since:</span>
                    <span className="text-gray-900">
                      {user.created_at ? formatDate(user.created_at) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Saved reports:</span>
                    <span className="text-gray-900">{savedReports.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Last login:</span>
                    <span className="text-gray-900">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Reports Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Saved Reports</h2>

            {loadingReports ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading reports...</p>
              </div>
            ) : savedReports.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>No uploaded reports found.</p>
                <p className="text-sm text-gray-500">Generate a report to see it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedReports.map((file, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Uploaded: {formatDate(file.created_at)}
                    </p>
                    <div className="flex justify-between items-center">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View / Download
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default UserProfile;