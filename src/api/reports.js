import { supabase } from '../supabase/supabase';

export const reportsAPI = {
  /**
   * Save a report to the user's saved reports
   * @param {string} userId - The user's ID
   * @param {string} title - The report title
   * @param {string} reportType - The type of report (e.g., 'economic_forecast', 'simulation', etc.)
   * @param {object} reportData - The actual report data/content
   * @param {string} description - Optional description of the report
   * @returns {Promise} - The saved report data
   */
  async saveReport(userId, title, reportType, reportData, description = '') {
    try {
      const reportPayload = {
        user_id: userId,
        title: title.trim(),
        report_type: reportType,
        report_data: reportData,
        description: description.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('saved_reports')
        .insert([reportPayload])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving report:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all saved reports for a user
   * @param {string} userId - The user's ID
   * @returns {Promise} - Array of saved reports
   */
  async getUserReports(userId) {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Delete a saved report
   * @param {string} userId - The user's ID
   * @param {string} reportId - The report ID to delete
   * @returns {Promise} - Success/error response
   */
  async deleteReport(userId, reportId) {
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting report:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update a saved report
   * @param {string} userId - The user's ID
   * @param {string} reportId - The report ID to update
   * @param {object} updates - The fields to update
   * @returns {Promise} - The updated report data
   */
  async updateReport(userId, reportId, updates) {
    try {
      const updatePayload = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('saved_reports')
        .update(updatePayload)
        .eq('id', reportId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating report:', error);
      return { success: false, error: error.message };
    }
  }
};

export default reportsAPI;