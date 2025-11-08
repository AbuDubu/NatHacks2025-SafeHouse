/**
 * Home Screen
 * Main dashboard showing current status and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAlerts } from '../contexts/AlertContext';
import { apiService } from '../services/api.service';
import { healthService } from '../services/health.service';
import type { DashboardData } from '../../../shared/types';
import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '../../../shared/constants';

const HomeScreen = () => {
  const { user } = useAuth();
  const { activeAlerts, acknowledgeAlert } = useAlerts();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Disable HealthKit for now to avoid errors in Expo Go
    // initializeHealthKit();
  }, []);

  const initializeHealthKit = async () => {
    const enabled = await healthService.initialize();
    setHealthKitEnabled(enabled);
  };

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const elderId = user.role === 'elder' ? user.id : ''; // TODO: Get linked elder ID for caregivers
      if (!elderId) return;

      const response = await apiService.getDashboardData(elderId);
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    Alert.alert(
      'Acknowledge Alert',
      'Are you safe and okay?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "I'm OK",
          style: 'default',
          onPress: async () => {
            try {
              await acknowledgeAlert(alertId);
              await handleRefresh();
              
              // HealthKit disabled for Expo Go - will work in production builds
              // if (healthKitEnabled && user) {
              //   const vitals = await healthService.getVitalSnapshot(user.id);
              //   await apiService.submitVitals(user.id, vitals);
              // }
            } catch (error) {
              Alert.alert('Error', 'Failed to acknowledge alert');
            }
          },
        },
      ]
    );
  };

  const currentTelemetry = dashboardData?.currentTelemetry;
  const device = dashboardData?.device;
  const riskLevel = currentTelemetry?.riskLevel || 'normal';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'there'}!</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertBannerTitle}>⚠️ Active Alert</Text>
          <Text style={styles.alertBannerText}>
            Heat risk detected. Please confirm you're safe.
          </Text>
          <TouchableOpacity
            style={styles.ackButton}
            onPress={() => handleAcknowledgeAlert(activeAlerts[0].id)}
          >
            <Text style={styles.ackButtonText}>I'm OK</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Status</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: RISK_LEVEL_COLORS[riskLevel] },
          ]}
        >
          <Text style={styles.statusText}>
            {RISK_LEVEL_LABELS[riskLevel]}
          </Text>
        </View>

        {currentTelemetry ? (
          <View style={styles.telemetryGrid}>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>Temperature</Text>
              <Text style={styles.telemetryValue}>
                {currentTelemetry.tempC.toFixed(1)}°C
              </Text>
            </View>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>Humidity</Text>
              <Text style={styles.telemetryValue}>
                {currentTelemetry.humidity.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>Heat Index</Text>
              <Text style={styles.telemetryValue}>
                {currentTelemetry.heatIndexC.toFixed(1)}°C
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>No sensor data available</Text>
        )}
      </View>

      {/* Device Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device Status</Text>
        {device ? (
          <>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>Status:</Text>
              <View
                style={[
                  styles.deviceStatusBadge,
                  device.status === 'online' && styles.deviceStatusOnline,
                  device.status === 'offline' && styles.deviceStatusOffline,
                ]}
              >
                <Text style={styles.deviceStatusText}>{device.status}</Text>
              </View>
            </View>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>Last seen:</Text>
              <Text style={styles.deviceValue}>
                {new Date(device.lastSeenAt).toLocaleString()}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noData}>No device connected</Text>
        )}
      </View>

      {/* Health Integration */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Data</Text>
        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>HealthKit:</Text>
          <Text style={styles.deviceValue}>
            ⏸️ Disabled in Expo Go
          </Text>
        </View>
        <Text style={styles.noData}>
          HealthKit requires a development build or physical device with standalone app
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
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  role: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  alertBanner: {
    backgroundColor: '#FEE2E2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  alertBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  alertBannerText: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 12,
  },
  ackButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telemetryItem: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  telemetryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  noData: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  deviceValue: {
    fontSize: 14,
    color: '#111827',
  },
  deviceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deviceStatusOnline: {
    backgroundColor: '#D1FAE5',
  },
  deviceStatusOffline: {
    backgroundColor: '#FEE2E2',
  },
  deviceStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  linkButton: {
    marginTop: 8,
  },
  linkText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;

