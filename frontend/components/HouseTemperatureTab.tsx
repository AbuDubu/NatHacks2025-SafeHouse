import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, Sensor, SensorReading } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';

interface TemperatureSensor {
  sensor: Sensor;
  latestReading: SensorReading | null;
  status: 'active' | 'inactive' | 'warning' | 'critical';
}

export function HouseTemperatureTab() {
  const { colors, isDark } = useTheme();
  const [temperatureSensors, setTemperatureSensors] = useState<TemperatureSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemperatureData();
    // Refresh every 30 seconds
    const interval = setInterval(loadTemperatureData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTemperatureData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all sensors
      const allSensors = await apiClient.getSensors();
      
      // Filter for temperature sensors
      const tempSensors = allSensors.filter(s => s.sensor_type === 'temperature');
      
      // Get latest reading for each temperature sensor
      const sensorsWithReadings: TemperatureSensor[] = await Promise.all(
        tempSensors.map(async (sensor) => {
          try {
            const readings = await apiClient.getSensorReadings(sensor.id, { limit: 1 });
            const latestReading = readings.length > 0 ? readings[0] : null;
            
            // Determine status
            let status: 'active' | 'inactive' | 'warning' | 'critical' = 'inactive';
            if (!sensor.is_active) {
              status = 'inactive';
            } else if (latestReading) {
              const temp = latestReading.value;
              if (temp > 35 || temp < 10) {
                status = 'critical';
              } else if (temp > 30 || temp < 15) {
                status = 'warning';
              } else {
                status = 'active';
              }
            } else if (sensor.is_active) {
              status = 'active';
            }
            
            return {
              sensor,
              latestReading,
              status,
            };
          } catch (err) {
            console.error(`Error loading readings for sensor ${sensor.id}:`, err);
            return {
              sensor,
              latestReading: null,
              status: sensor.is_active ? 'active' : 'inactive' as const,
            };
          }
        })
      );
      
      setTemperatureSensors(sensorsWithReadings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load temperature data');
      console.error('Error loading temperature data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', icon: '#10b981' };
      case 'warning':
        return { bg: '#fefce8', text: '#854d0e', border: '#fde047', icon: '#eab308' };
      case 'critical':
        return { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5', icon: '#dc2626' };
      case 'inactive':
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', icon: '#9ca3af' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', icon: '#9ca3af' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Normal';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
      case 'inactive':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const formatTemperature = (value: number | null): string => {
    if (value === null) return '--';
    return `${Math.round(value)}°C`;
  };

  const formatLastSeen = (timestamp: string | null | undefined): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading && temperatureSensors.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading temperature sensors...</Text>
      </View>
    );
  }

  if (error && temperatureSensors.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        <TouchableOpacity onPress={loadTemperatureData} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>House Temperature</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Monitor temperature across all rooms</Text>
      </View>

      {temperatureSensors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="thermometer" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>No temperature sensors found</Text>
        </View>
      ) : (
        <View style={styles.sensorsList}>
          {temperatureSensors.map((item) => {
            const statusColors = getStatusColor(item.status);
            const temp = item.latestReading?.value || null;
            
            return (
              <View
                key={item.sensor.id}
                style={[
                  styles.sensorCard,
                  {
                    backgroundColor: statusColors.bg,
                    borderColor: statusColors.border,
                  }
                ]}
              >
                <View style={styles.sensorHeader}>
                  <View style={styles.sensorInfo}>
                    <View style={[styles.sensorIconContainer, {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                    }]}>
                      <Ionicons name="thermometer" size={32} color={statusColors.icon} />
                    </View>
                    <View style={styles.sensorDetails}>
                      <Text style={[styles.sensorName, { color: statusColors.text }]}>
                        {item.sensor.name}
                      </Text>
                      <Text style={[styles.sensorLocation, { color: statusColors.text }]}>
                        {item.sensor.location || 'Unknown Location'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: statusColors.bg,
                    borderColor: statusColors.border,
                  }]}>
                    <Text style={[styles.statusText, { color: statusColors.text }]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.temperatureDisplay}>
                  <Text style={[styles.temperatureValue, { color: statusColors.text }]}>
                    {formatTemperature(temp)}
                  </Text>
                  {item.latestReading && (
                    <Text style={[styles.temperatureUnit, { color: statusColors.text }]}>
                      {item.latestReading.unit || '°C'}
                    </Text>
                  )}
                </View>

                <View style={styles.sensorMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={16} color={statusColors.text} />
                    <Text style={[styles.metaText, { color: statusColors.text }]}>
                      {formatLastSeen(item.sensor.last_seen)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons 
                      name={item.sensor.is_active ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={statusColors.text} 
                    />
                    <Text style={[styles.metaText, { color: statusColors.text }]}>
                      {item.sensor.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 100,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    minHeight: 400,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  sensorsList: {
    gap: 16,
  },
  sensorCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sensorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  sensorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorDetails: {
    flex: 1,
  },
  sensorName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sensorLocation: {
    fontSize: 14,
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  temperatureDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    gap: 8,
  },
  temperatureValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  temperatureUnit: {
    fontSize: 24,
    fontWeight: '500',
    opacity: 0.8,
  },
  sensorMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});

