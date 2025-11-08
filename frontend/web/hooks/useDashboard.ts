/**
 * Custom hook for dashboard data
 */

'use client';

import { useState, useEffect } from 'react';
import type { DashboardData } from '../../../shared/types';
import { apiClient } from '../lib/api/client';
import { REFRESH_INTERVALS } from '../../../shared/constants';

export function useDashboard(elderId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await apiClient.getDashboardData(elderId);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!elderId) return;

    fetchData();

    // Poll for updates
    const interval = setInterval(fetchData, REFRESH_INTERVALS.DASHBOARD);

    return () => clearInterval(interval);
  }, [elderId]);

  return { data, isLoading, error, refresh: fetchData };
}

