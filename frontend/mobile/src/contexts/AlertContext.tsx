/**
 * Alert Context for managing active alerts
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Alert } from '../../../shared/types';
import { REFRESH_INTERVALS } from '../../../shared/constants';

// Toggle between mock and real API
const USE_MOCK_API = true; // Set to false when backend is ready

import { apiService as realApiService } from '../services/api.service';
import { apiService as mockApiService } from '../services/mock-api.service';

const apiService = USE_MOCK_API ? mockApiService : realApiService;

interface AlertContextType {
  activeAlerts: Alert[];
  isLoading: boolean;
  refreshAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshAlerts();
    
    // Poll for active alerts
    const interval = setInterval(refreshAlerts, REFRESH_INTERVALS.ALERTS);
    
    return () => clearInterval(interval);
  }, []);

  const refreshAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getActiveAlerts();
      if (response.success && response.data) {
        setActiveAlerts(response.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await apiService.acknowledgeAlert(alertId);
      if (response.success) {
        // Remove alert from active list
        setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  };

  return (
    <AlertContext.Provider
      value={{
        activeAlerts,
        isLoading,
        refreshAlerts,
        acknowledgeAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
};

