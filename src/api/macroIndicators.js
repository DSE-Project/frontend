const API_URL = import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL = API_URL;

// Generic API fetch function with error handling
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Macroeconomic indicators API
export const macroIndicatorsAPI = {
  // Get all macroeconomic indicators
  getMacroIndicators: () => apiRequest('/macro-indicators'),
};

// Export the base API function for other modules
export { apiRequest };
