/**
 * Health Dashboard Screen
 * Displays comprehensive health metrics from Apple Watch
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { healthService } from '../services/health.service.APPLEHEALTH';

interface HealthMetrics {
  heartRate: number | null;
  hrv: number | null;
  steps: number | null;
  glucose: number | null;
  bloodPressure: { systolic: number; diastolic: number } | null;
  oxygenSaturation: number | null;
  bodyTemperature: number | null;
}

const HealthDashboard = () => {
  const [healthData, setHealthData] = useState<HealthMetrics>({
    heartRate: null,
    hrv: null,
    steps: null,
    glucose: null,
    bloodPressure: null,
    oxygenSaturation: null,
    bodyTemperature: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    initializeHealthKit();
  }, []);

  const initializeHealthKit = async () => {
    const enabled = await healthService.initialize();
    setHealthKitEnabled(enabled);
    
    if (enabled) {
      await loadHealthData();
    }
  };

  const loadHealthData = async () => {
    try {
      const metrics = await healthService.getAllHealthMetrics();
      setHealthData(metrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading health data:', error);
      Alert.alert('Error', 'Failed to load health data');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHealthData();
    setIsRefreshing(false);
  };

  const handleEnableHealthKit = async () => {
    const enabled = await healthService.requestAuthorization();
    if (enabled) {
      setHealthKitEnabled(true);
      await loadHealthData();
      Alert.alert('Success', 'HealthKit enabled successfully');
    } else {
      Alert.alert(
        'HealthKit Unavailable',
        'Please enable HealthKit in iOS Settings > Health > Data Access & Devices > SafeHouse'
      );
    }
  };

  if (!healthKitEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>❤️ Health Monitoring</Text>
          <Text style={styles.emptyText}>
            Enable HealthKit to see your Apple Watch data
          </Text>
          <TouchableOpacity style={styles.enableButton} onPress={handleEnableHealthKit}>
            <Text style={styles.enableButtonText}>Enable HealthKit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Health Dashboard</Text>
        <Text style={styles.subtitle}>
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString()}`
            : 'Syncing with Apple Watch...'}
        </Text>
      </View>

      {/* Vital Signs Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💓 Vital Signs</Text>
        
        {/* Heart Rate */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Heart Rate</Text>
            <Text style={styles.metricUnit}>bpm</Text>
          </View>
          {healthData.heartRate ? (
            <Text style={styles.metricValue}>{healthData.heartRate}</Text>
          ) : (
            <Text style={styles.metricNoData}>No data</Text>
          )}
          <Text style={styles.metricSubtext}>Last 5 minutes</Text>
        </View>

        {/* HRV */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Heart Rate Variability</Text>
            <Text style={styles.metricUnit}>ms</Text>
          </View>
          {healthData.hrv ? (
            <Text style={styles.metricValue}>{healthData.hrv}</Text>
          ) : (
            <Text style={styles.metricNoData}>No data</Text>
          )}
          <Text style={styles.metricSubtext}>Last 24 hours</Text>
        </View>

        {/* Blood Pressure */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Blood Pressure</Text>
            <Text style={styles.metricUnit}>mmHg</Text>
          </View>
          {healthData.bloodPressure ? (
            <Text style={styles.metricValue}>
              {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}
            </Text>
          ) : (
            <Text style={styles.metricNoData}>No data</Text>
          )}
          <Text style={styles.metricSubtext}>Systolic / Diastolic</Text>
        </View>

        {/* Oxygen Saturation */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Oxygen Saturation</Text>
            <Text style={styles.metricUnit}>%</Text>
          </View>
          {healthData.oxygenSaturation ? (
            <Text style={styles.metricValue}>{healthData.oxygenSaturation}</Text>
          ) : (
            <Text style={styles.metricNoData}>No data</Text>
          )}
          <Text style={styles.metricSubtext}>SpO2 level</Text>
        </View>
      </View>

      {/* Health Metrics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🩺 Health Metrics</Text>

        {/* Blood Glucose */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Blood Glucose</Text>
            <Text style={styles.metricUnit}>mg/dL</Text>
          </View>
          {healthData.glucose ? (
            <Text style={styles.metricValue}>{healthData.glucose}</Text>
          ) : (
            <Text style={styles.metricNoData}>No data</Text>
          )}
          <Text style={styles.metricSubtext}>Last 24 hours</Text>
        </View>

        {/* Body Temperature */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Body Temperature</Text>
            <Text style={styles.metricUnit}>°C</Text>
          </View>
          {healthData.bodyTemperature ? (
            <Text style={styles.metricValue}>{healthData.bodyTemperature}</Text>
          ) : (
            <Text style={styles.metricNoData}>No data</Text>
          )}
          <Text style={styles.metricSubtext}>Recent reading</Text>
        </View>
      </View>

      {/* Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚶 Activity</Text>

        {/* Steps */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Steps</Text>
            <Text style={styles.metricUnit}>count</Text>
          </View>
          {healthData.steps !== null ? (
            <Text style={styles.metricValue}>{healthData.steps}</Text>
          ) : (
            <Text style={styles.metricNoData}>No data</Text>
          )}
          <Text style={styles.metricSubtext}>Last 5 minutes</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          📱 Data syncs automatically from your Apple Watch and iPhone Health app.
          Pull down to refresh manually.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  metricUnit: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EF4444',
    marginVertical: 8,
  },
  metricNoData: {
    fontSize: 24,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginVertical: 8,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  enableButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HealthDashboard;

