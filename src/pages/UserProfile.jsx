import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userReportsAPI } from '../api/userReports';
import Header from '../components/Header';

const UserProfile = () => {
  const { user, userData, fetchUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfReports, setPdfReports] = useState([]);
  const [loadingPdfReports, setLoadingPdfReports] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setFirstName(userData.first_name || '');
      setLastName(userData.last_name || '');
    }
  }, [userData]);

  // Fetch PDF reports
  useEffect(() => {
    if (user) {
      fetchPdfReports();
    }
  }, [user]);

  const fetchPdfReports = async () => {
    try {
      setLoadingPdfReports(true);
      const result = await userReportsAPI.getUserPDFReports(user.id);
      
      if (result.success) {
        setPdfReports(result.data || []);
      } else {
        console.error('Error fetching PDF reports:', result.error);
        setMessage({ type: 'error', text: 'Failed to load PDF reports' });
      }
    } catch (error) {
      console.error('Error fetching PDF reports:', error);
      setMessage({ type: 'error', text: 'Failed to load PDF reports' });
    } finally {
      setLoadingPdfReports(false);
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

  const handleDownloadPdfReport = async (fileName) => {
    try {
      const result = await userReportsAPI.downloadReport(user.id, fileName);
      if (!result.success) {
        setMessage({ type: 'error', text: 'Failed to download report: ' + result.error });
      }
    } catch (error) {
      console.error('Error downloading PDF report:', error);
      setMessage({ type: 'error', text: 'Failed to download report. Please try again.' });
    }
  };

  const handleDeletePdfReport = async (fileName) => {
    if (!confirm('Are you sure you want to delete this PDF report?')) {
      return;
    }

    try {
      const result = await userReportsAPI.deleteReport(user.id, fileName);
      
      if (result.success) {
        setPdfReports(prev => prev.filter(report => report.name !== fileName));
        setMessage({ type: 'success', text: 'PDF report deleted successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete PDF report: ' + result.error });
      }
    } catch (error) {
      console.error('Error deleting PDF report:', error);
      setMessage({ type: 'error', text: 'Failed to delete PDF report. Please try again.' });
    }
  };

  const handleViewPdfReport = async (fileName) => {
    try {
      const result = await userReportsAPI.getReportDownloadUrl(user.id, fileName);
      
      if (result.success && result.downloadUrl) {
        // Open PDF in a new tab for viewing
        window.open(result.downloadUrl, '_blank');
      } else {
        setMessage({ type: 'error', text: 'Failed to view report: ' + result.error });
      }
    } catch (error) {
      console.error('Error viewing PDF report:', error);
      setMessage({ type: 'error', text: 'Failed to view report. Please try again.' });
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
                    <span className="text-gray-700">Generated reports:</span>
                    <span className="text-gray-900 font-semibold">{pdfReports.length}</span>
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

          {/* PDF Reports Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">My Reports</h2>
              <div className="text-sm text-gray-500">
                {pdfReports.length} PDF reports
              </div>
            </div>

            {loadingPdfReports ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading PDF reports...</p>
              </div>
            ) : pdfReports.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF reports yet</h3>
                <p className="text-gray-600">Go to the Report Generation page to create your first PDF report.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pdfReports.map((report, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <svg className="h-8 w-8 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {userReportsAPI.extractDateFromFileName(report.name)}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {userReportsAPI.formatFileSize(report.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewPdfReport(report.name)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View PDF"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadPdfReport(report.name)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Download PDF"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePdfReport(report.name)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete PDF"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Created: {report.created_at ? formatDate(report.created_at) : 'N/A'}
                    </p>
                    
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleViewPdfReport(report.name)}
                        className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => handleDownloadPdfReport(report.name)}
                        className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Download
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