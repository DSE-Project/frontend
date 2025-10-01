import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI } from '../api/reports';

const SaveReportButton = ({ 
  reportData, 
  reportType = 'general', 
  defaultTitle = '',
  defaultDescription = '',
  className = '',
  onSaveSuccess = null,
  onSaveError = null,
  variant = 'primary' // 'primary', 'secondary', 'outline'
}) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);

  const buttonStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
  };

  const handleSaveReport = async () => {
    if (!user) {
      alert('Please log in to save reports');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title for the report');
      return;
    }

    if (!reportData) {
      alert('No report data to save');
      return;
    }

    setIsSaving(true);

    try {
      const result = await reportsAPI.saveReport(
        user.id,
        title.trim(),
        reportType,
        reportData,
        description.trim()
      );

      if (result.success) {
        setIsModalOpen(false);
        setTitle(defaultTitle);
        setDescription(defaultDescription);
        
        if (onSaveSuccess) {
          onSaveSuccess(result.data);
        } else {
          alert('Report saved successfully!');
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      if (onSaveError) {
        onSaveError(error.message);
      } else {
        alert('Failed to save report. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null; // Don't show save button if user is not logged in
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-4 py-2 rounded-md transition-colors font-medium ${buttonStyles[variant]} ${className}`}
        disabled={!reportData}
      >
        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Save Report
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Report</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="reportTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="reportTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter report title..."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="reportDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Type:</strong> {reportType}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setTitle(defaultTitle);
                  setDescription(defaultDescription);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                disabled={isSaving || !title.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveReportButton;