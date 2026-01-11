// Custom hook để quản lý state cho Logworks

import { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { Logwork } from '../../models';

export function useLogworks() {
  const [logworks, setLogworks] = useState<Logwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogworks();
  }, []);

  const fetchLogworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getLogworks();
      setLogworks(data);
    } catch (err: any) {
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

