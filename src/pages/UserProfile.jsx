import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/supabase';
import { toast } from 'react-toastify';
import Header from '../components/Header';

// Custom CSS for wider confirmation toast
const customToastStyles = `
  .custom-toast-wide {
    min-width: 400px;
    max-width: 500px;
  }
  .custom-toast-wide .Toastify__toast-body {
    padding: 0;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = customToastStyles;
  document.head.appendChild(styleSheet);
}

const UserProfile = () => {
  const { user, userData, fetchUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [lastFetchedUserId, setLastFetchedUserId] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // Custom confirmation toast
  const showDeleteConfirmation = (itemName, onConfirm) => {
    const confirmToast = () => {
      toast.dismiss(); // Clear any existing toasts
      toast(
        ({ closeToast }) => (
          <div className="p-2">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Delete Confirmation</h4>
                <p className="text-sm text-gray-600">Are you sure you want to delete "{itemName}"?</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  closeToast();
                }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeToast();
                  onConfirm();
                }}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ),
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          closeButton: false,
          className: "custom-toast-wide"
        }
      );
    };
    confirmToast();
  };

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setFirstName(userData.first_name || '');
      setLastName(userData.last_name || '');
    }
  }, [userData]);

  // Fetch user reports from Supabase Storage
  const fetchUserReportsFromStorage = useCallback(async () => {
    // Prevent duplicate requests
    if (loadingReports) return;
    
    try {
      setLoadingReports(true);

      // 1️⃣ List all files in the user's folder inside the bucket
      const { data: files, error } = await supabase.storage
        .from("user-reports")
        .list(user.id + "/", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

      if (error) throw error;
      if (!files || files.length === 0) {
        setSavedReports([]);
        setReportsLoaded(true);
        setLastFetchedUserId(user.id);
        setLastRefreshTime(new Date());
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
      setReportsLoaded(true);
      setLastFetchedUserId(user.id);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("Error fetching reports from storage:", err);
      toast.error("Failed to load reports from storage.");
    } finally {
      setLoadingReports(false);
    }
  }, [user?.id, loadingReports]);

  // Fetch saved reports only when necessary
  useEffect(() => {
    // Only fetch if:
    // 1. User exists
    // 2. Reports haven't been loaded yet, OR user has changed
    // 3. Not currently loading
    if (user && (!reportsLoaded || user.id !== lastFetchedUserId) && !loadingReports) {
      fetchUserReportsFromStorage();
    }
  }, [user, reportsLoaded, lastFetchedUserId, loadingReports, fetchUserReportsFromStorage]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    const executeDelete = async () => {
      try {
        const { error } = await supabase
          .from('saved_reports')
          .delete()
          .eq('id', reportId)
          .eq('user_id', user.id);

        if (error) throw error;

        setSavedReports(prev => prev.filter(report => report.id !== reportId));
        toast.success('Report deleted successfully!');
      } catch (error) {
        console.error('Error deleting report:', error);
        toast.error('Failed to delete report. Please try again.');
      }
    };

    showDeleteConfirmation(`Report ${reportId}`, executeDelete);
  };

  const handleDeleteFile = async (fileName) => {
    const executeDelete = async () => {
      try {
        // First, check if the file exists
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('user-reports')
          .list(user.id + "/", { limit: 100 });

        if (listError) {
          throw listError;
        }
        
        const fileExists = existingFiles.some(file => file.name === fileName);

        if (!fileExists) {
          setSavedReports(prev => prev.filter(file => file.name !== fileName));
          toast.success('File removed from list (was already deleted from storage).');
          return;
        }
        
        // Proceed with deletion
        const { data, error } = await supabase.storage
          .from('user-reports')
          .remove([`${user.id}/${fileName}`]);

        if (error) {
          throw error;
        }

        // Check if the deletion was successful
        if (!data || data.length === 0) {
          // Verify if file was actually deleted by listing again
          const { data: verifyFiles, error: verifyError } = await supabase.storage
            .from('user-reports')
            .list(user.id + "/", { limit: 100 });

          if (!verifyError) {
            const stillExists = verifyFiles.some(file => file.name === fileName);
            
            if (!stillExists) {
              // File was actually deleted despite empty response
              setSavedReports(prev => prev.filter(file => file.name !== fileName));
              toast.success('File deleted successfully!');
              return;
            }
          }
          
          // File still exists - RLS policy or permission issue
          toast.error('Unable to delete file. This may be due to storage permissions. Please contact support.');
          return;
        }

        // Normal success case (non-empty response)
        setSavedReports(prev => prev.filter(file => file.name !== fileName));
        toast.success('File deleted successfully!');
        
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error(`Failed to delete file: ${error.message}`);
      }
    };

    showDeleteConfirmation(fileName, executeDelete);
  };

  const handleRefreshReports = async () => {
    setReportsLoaded(false);
    setLastFetchedUserId(null);
    await fetchUserReportsFromStorage();
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
        <div className="pt-20 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
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
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">User Profile</h1>
            


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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Saved Reports</h2>
              <div className="flex items-center space-x-4">
                {lastRefreshTime && (
                  <span className="text-sm text-gray-500">
                    Last updated: {formatDate(lastRefreshTime.toISOString())}
                  </span>
                )}
                <button
                  onClick={handleRefreshReports}
                  disabled={loadingReports}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors text-sm"
                >
                  {loadingReports ? 'Refreshing...' : 'Refresh Reports'}
                </button>
              </div>
            </div>

            {loadingReports && !reportsLoaded ? (
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