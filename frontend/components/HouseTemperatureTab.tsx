import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, Sensor, SensorReading } from '../lib/api';

interface TemperatureSensor {
  sensor: Sensor;
  latestReading: SensorReading | null;
  status: 'active' | 'inactive' | 'warning' | 'critical';
}

export function HouseTemperatureTab() {
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
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading temperature sensors...</Text>
      </View>
    );
  }

  if (error && temperatureSensors.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadTemperatureData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>House Temperature</Text>
        <Text style={styles.subtitle}>Monitor temperature across all rooms</Text>
      </View>

      {temperatureSensors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="thermometer" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateText}>No temperature sensors found</Text>
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
                    <View style={styles.sensorIconContainer}>
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
    backgroundColor: '#f9fafb',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    minHeight: 400,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
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
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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

