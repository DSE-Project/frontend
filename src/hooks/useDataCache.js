import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for caching API data with time-based invalidation
 * @param {Function} fetchFunction - The async function to fetch data
 * @param {string} cacheKey - Unique key for this cache entry
 * @param {number} cacheTime - Time in milliseconds to cache data (default: 5 minutes)
 */
export const useDataCache = (fetchFunction, cacheKey, cacheTime = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheTimerRef = useRef(null);
  const lastFetchRef = useRef(null);
  const mountedRef = useRef(true);

  // Check if cached data is still valid
  const isCacheValid = useCallback(() => {
    if (!lastFetchRef.current) return false;
    const now = Date.now();
    return (now - lastFetchRef.current) < cacheTime;
  }, [cacheTime]);

  // Fetch data with caching
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid() && data) {
      console.log(`[useDataCache] Using cached data for: ${cacheKey}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`[useDataCache] Fetching fresh data for: ${cacheKey}`);
      const result = await fetchFunction();
      
      if (mountedRef.current) {
        setData(result);
        lastFetchRef.current = Date.now();
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch data');
        console.error(`[useDataCache] Error fetching ${cacheKey}:`, err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction, cacheKey, isCacheValid, data]);

  // Initial fetch on mount
  useEffect(() => {
    mountedRef.current = true;
    const timer = cacheTimerRef.current;
    fetchData();

    return () => {
      mountedRef.current = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [cacheKey, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    isCached: isCacheValid()
  };
};

export default useDataCache;
