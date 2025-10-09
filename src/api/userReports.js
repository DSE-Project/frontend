/**
 * API service for managing user PDF reports stored in Supabase storage
 */

const API_BASE_URL = 'http://localhost:8000';

export const userReportsAPI = {
  /**
   * Get all PDF reports for a user
   * @param {string} userId - The user's ID
   * @returns {Promise} - Promise resolving to user reports data
   */
  async getUserPDFReports(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user-reports/list/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.reports || [] };
    } catch (error) {
      console.error('Error fetching user PDF reports:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Get download URL for a specific PDF report
   * @param {string} userId - The user's ID
   * @param {string} fileName - The PDF file name
   * @returns {Promise} - Promise resolving to download URL
   */
  async getReportDownloadUrl(userId, fileName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user-reports/download/${userId}/${fileName}`, {
        method: 'GET',
        redirect: 'manual' // Don't follow redirects, we want the URL
      });
      
      if (response.status === 0 || (response.status >= 300 && response.status < 400)) {
        // This is a redirect response, get the Location header
        const downloadUrl = response.headers.get('Location') || response.url;
        return { success: true, downloadUrl };
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get download URL: ${response.statusText}`);
      }
      
      // If not a redirect, return the response URL
      return { success: true, downloadUrl: response.url };
    } catch (error) {
      console.error('Error getting download URL:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Download a PDF report directly (triggers browser download)
   * @param {string} userId - The user's ID  
   * @param {string} fileName - The PDF file name
   * @returns {Promise} - Promise for download operation
   */
  async downloadReport(userId, fileName) {
    try {
      // Create a temporary anchor element and trigger download
      const downloadUrl = `${API_BASE_URL}/api/v1/user-reports/download/${userId}/${fileName}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading report:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a PDF report from storage
   * @param {string} userId - The user's ID
   * @param {string} fileName - The PDF file name
   * @returns {Promise} - Promise for delete operation
   */
  async deleteReport(userId, fileName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user-reports/delete/${userId}/${fileName}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting PDF report:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get metadata information about a specific PDF report
   * @param {string} userId - The user's ID
   * @param {string} fileName - The PDF file name  
   * @returns {Promise} - Promise resolving to report metadata
   */
  async getReportInfo(userId, fileName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user-reports/info/${userId}/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get report info: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.report };
    } catch (error) {
      console.error('Error getting report info:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Format file size to human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Extract report date from filename (assuming format: recession_report_YYYY-MM-DDTHH-mm-ss.pdf)
   * @param {string} fileName - The PDF file name
   * @returns {string} - Formatted date or original filename if parsing fails
   */
  extractDateFromFileName(fileName) {
    try {
      const match = fileName.match(/recession_report_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
      if (match) {
        const dateStr = match[1].replace(/T/, ' ').replace(/-/g, ':');
        const date = new Date(dateStr.replace(/:/g, '-').replace(' ', 'T') + 'Z');
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return fileName.replace('.pdf', '');
    } catch (error) {
      return fileName.replace('.pdf', '');
    }
  }
};

export default userReportsAPI;