/**
 * Health Data Service using react-native-health
 * For Apple Watch and HealthKit integration
 * 
 * Based on: https://github.com/agencyenterprise/react-native-health
 */

import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
  HealthInputOptions,
} from 'react-native-health';
import { Platform } from 'react-native';
import type { VitalSnapshot } from '../../../shared/types';

// Define permissions we need
const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.BloodGlucose,
      AppleHealthKit.Constants.Permissions.BloodPressure,
      AppleHealthKit.Constants.Permissions.OxygenSaturation,
      AppleHealthKit.Constants.Permissions.BodyTemperature,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
    ],
    write: [],
  },
};

export class HealthService {
  private initialized = false;

  /**
   * Initialize HealthKit with permissions
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('HealthKit is only available on iOS');
      return false;
    }

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.error('Error initializing HealthKit:', error);
          resolve(false);
        } else {
          console.log('HealthKit initialized successfully');
          this.initialized = true;
          resolve(true);
        }
      });
    });
  }

  /**
   * Check if HealthKit is available
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && this.initialized;
  }

  /**
   * Get recent heart rate (last 5 minutes)
   */
  async getRecentHeartRate(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 10,
        ascending: false,
      };

      AppleHealthKit.getHeartRateSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.error('Error fetching heart rate:', err);
            resolve(null);
            return;
          }

          if (results && results.length > 0) {
            const latest = results[0];
            resolve(Math.round(latest.value));
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Get heart rate variability (HRV)
   */
  async getHeartRateVariability(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
        ascending: false,
      };

      AppleHealthKit.getHeartRateVariabilitySamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.error('Error fetching HRV:', err);
            resolve(null);
            return;
          }

          if (results && results.length > 0) {
            resolve(Math.round(results[0].value));
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Get steps in last 5 minutes
   */
  async getRecentSteps(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      };

      AppleHealthKit.getStepCount(options, (err: Object, results: HealthValue) => {
        if (err) {
          console.error('Error fetching steps:', err);
          resolve(null);
          return;
        }

        resolve(results?.value ? Math.round(results.value) : 0);
      });
    });
  }

  /**
   * Get blood glucose (most recent)
   */
  async getBloodGlucose(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
        ascending: false,
      };

      AppleHealthKit.getBloodGlucoseSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.error('Error fetching blood glucose:', err);
            resolve(null);
            return;
          }

          if (results && results.length > 0) {
            resolve(Math.round(results[0].value));
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Get blood pressure (most recent)
   */
  async getBloodPressure(): Promise<{ systolic: number; diastolic: number } | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
        ascending: false,
      };

      AppleHealthKit.getBloodPressureSamples(
        options,
        (err: Object, results: any[]) => {
          if (err) {
            console.error('Error fetching blood pressure:', err);
            resolve(null);
            return;
          }

          if (results && results.length > 0) {
            const bp = results[0];
            resolve({
              systolic: Math.round(bp.bloodPressureSystolicValue),
              diastolic: Math.round(bp.bloodPressureDiastolicValue),
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Get oxygen saturation (most recent)
   */
  async getOxygenSaturation(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
        ascending: false,
      };

      AppleHealthKit.getOxygenSaturationSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.error('Error fetching oxygen saturation:', err);
            resolve(null);
            return;
          }

          if (results && results.length > 0) {
            resolve(Math.round(results[0].value * 100));
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Get body temperature (most recent)
   */
  async getBodyTemperature(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
        ascending: false,
      };

      AppleHealthKit.getBodyTemperatureSamples(
        options,
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.error('Error fetching body temperature:', err);
            resolve(null);
            return;
          }

          if (results && results.length > 0) {
            resolve(Number(results[0].value.toFixed(1)));
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Get comprehensive vital snapshot for last 5 minutes
   */
  async getVitalSnapshot(elderId: string): Promise<Partial<VitalSnapshot>> {
    const [heartRate, hrv, steps] = await Promise.all([
      this.getRecentHeartRate(),
      this.getHeartRateVariability(),
      this.getRecentSteps(),
    ]);

    const now = new Date();
    const hasData = heartRate !== null || hrv !== null || steps !== null;
    
    return {
      elderId,
      timestamp: now,
      heartRate: heartRate || undefined,
      heartRateVariability: hrv || undefined,
      steps5min: steps || undefined,
      fallDetected: false,
      stalenessSec: hasData ? 0 : 300,
      status: hasData ? 'fresh' : 'unavailable',
    };
  }

  /**
   * Request authorization for HealthKit
   */
  async requestAuthorization(): Promise<boolean> {
    return this.initialize();
  }

  /**
   * Get all health metrics for dashboard
   */
  async getAllHealthMetrics(): Promise<{
    heartRate: number | null;
    hrv: number | null;
    steps: number | null;
    glucose: number | null;
    bloodPressure: { systolic: number; diastolic: number } | null;
    oxygenSaturation: number | null;
    bodyTemperature: number | null;
  }> {
    if (!this.initialized) {
      return {
        heartRate: null,
        hrv: null,
        steps: null,
        glucose: null,
        bloodPressure: null,
        oxygenSaturation: null,
        bodyTemperature: null,
      };
    }

    const [heartRate, hrv, steps, glucose, bloodPressure, oxygenSaturation, bodyTemperature] = 
      await Promise.all([
        this.getRecentHeartRate(),
        this.getHeartRateVariability(),
        this.getRecentSteps(),
        this.getBloodGlucose(),
        this.getBloodPressure(),
        this.getOxygenSaturation(),
        this.getBodyTemperature(),
      ]);

    return {
      heartRate,
      hrv,
      steps,
      glucose,
      bloodPressure,
      oxygenSaturation,
      bodyTemperature,
    };
  }
}

export const healthService = new HealthService();
