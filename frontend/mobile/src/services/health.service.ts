/**
 * Health Data Service for HealthKit integration
 * 
 * DISABLED FOR EXPO GO
 * This file has been simplified to avoid loading react-native-health in Expo Go
 * 
 * To use HealthKit:
 * 1. Build a development build or standalone app
 * 2. Restore from health.service.ts.DISABLED
 * 3. Uncomment imports in screens
 */

import { Platform } from 'react-native';
import type { VitalSnapshot } from '../../../shared/types';

export class HealthService {
  private initialized = false;

  /**
   * Initialize HealthKit - DISABLED for Expo Go
   */
  async initialize(): Promise<boolean> {
    console.warn('HealthKit is disabled in Expo Go. Use a development build.');
    return false;
  }

  /**
   * Check if HealthKit is available
   */
  isAvailable(): boolean {
    return false; // Always false in Expo Go
  }

  /**
   * Get recent heart rate - DISABLED
   */
  async getRecentHeartRate(): Promise<number | null> {
    return null;
  }

  /**
   * Get heart rate variability - DISABLED
   */
  async getHeartRateVariability(): Promise<number | null> {
    return null;
  }

  /**
   * Get steps in last 5 minutes - DISABLED
   */
  async getRecentSteps(): Promise<number | null> {
    return null;
  }

  /**
   * Get comprehensive vital snapshot - DISABLED
   */
  async getVitalSnapshot(elderId: string): Promise<Partial<VitalSnapshot>> {
    return {
      elderId,
      timestamp: new Date(),
      fallDetected: false,
      stalenessSec: 0,
      status: 'unavailable',
    };
  }

  /**
   * Request authorization - DISABLED
   */
  async requestAuthorization(): Promise<boolean> {
    console.warn('HealthKit requires a development build or standalone app');
    return false;
  }
}

export const healthService = new HealthService();

