const API_BASE_URL = 'http://localhost:8000/api/v1';

export const ECONOMIC_INDICATORS = {
  GDP: 'gdp',
  CPI: 'cpi',
  UNEMPLOYMENT_RATE: 'unemployment_rate',
  INFLATION: 'inflation',
  PPI: 'ppi',
  PCE: 'pce'
};

export const TIME_PERIODS = {
  SIX_MONTHS: '6m',
  TWELVE_MONTHS: '12m',
  TWENTY_FOUR_MONTHS: '24m',
  ALL: 'all'
};

export const economicChartsAPI = {
  async getHistoricalData(period = TIME_PERIODS.TWELVE_MONTHS, indicators = null) {
    try {
      const params = new URLSearchParams({ period });
      if (indicators && indicators.length > 0) {
        params.append('indicators', indicators.join(','));
      }
      
      const response = await fetch(`${API_BASE_URL}/economic-charts/historical-data?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result; // Return full response including success flag
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  },

  async getSummaryStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/economic-charts/summary-stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result; // Return full response including success flag
    } catch (error) {
      console.error('Error fetching summary statistics:', error);
      throw error;
    }
  }
};

export default economicChartsAPI;
