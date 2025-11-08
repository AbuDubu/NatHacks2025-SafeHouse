/**
 * Custom hook for alerts
 */

'use client';

import { useState, useEffect } from 'react';
import type { Alert } from '../../../shared/types';
import { apiClient } from '../lib/api/client';
import { REFRESH_INTERVALS } from '../../../shared/constants';

export function useAlerts(elderId?: string) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setError(null);
      const response = await apiClient.getAlerts(elderId);
      if (response.success && response.data) {
        setAlerts(response.data);
      } else {
        setError(response.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Poll for updates
    const interval = setInterval(fetchAlerts, REFRESH_INTERVALS.ALERTS);

    return () => clearInterval(interval);
  }, [elderId]);

  const acknowledgeAlert = async (alertId: string, reason: string) => {
    try {
      const response = await apiClient.acknowledgeAlert(alertId, reason);
      if (response.success) {
        await fetchAlerts();
      }
      return response;
    } catch (err) {
      throw err;
    }
  };

  return { alerts, isLoading, error, refresh: fetchAlerts, acknowledgeAlert };
}

