// Custom hook để quản lý state cho Logworks

import { useState, useEffect } from 'react';
import { logworksApi } from '../api';

export function useLogworks() {
  const [logworks, setLogworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogworks();
  }, []);

  const fetchLogworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await logworksApi.getLogworks();
      setLogworks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch logworks');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchLogworks();
  };

  return {
    logworks,
    loading,
    error,
    refetch,
  };
}

