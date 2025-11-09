import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, SensorReading, Sensor } from '../lib/api';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: (opacity: number) => string;
    strokeWidth: number;
  }>;
}

export function GuardianTrends() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heartRateData, setHeartRateData] = useState<ChartData | null>(null);
  const [glucoseData, setGlucoseData] = useState<ChartData | null>(null);
  const [sleepData, setSleepData] = useState<ChartData | null>(null);
  const [activityData, setActivityData] = useState<ChartData | null>(null);

  useEffect(() => {
    loadTrendData();
  }, []);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all sensors
      const sensors = await apiClient.getSensors();
      
      // Find sensors by type
      const heartRateSensor = sensors.find(s => s.sensor_type === 'heart_rate');
      const glucoseSensor = sensors.find(s => s.sensor_type === 'glucose' || s.sensor_type === 'co2');
      
      // Load readings for the past 7 days
      const daysAgo = 7;
      const now = new Date();
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }

      // Load heart rate data
      if (heartRateSensor) {
        try {
          const readings = await apiClient.getSensorReadings(heartRateSensor.id, { hours: daysAgo * 24 });
          const data = processReadingsForChart(readings, labels, daysAgo);
          setHeartRateData({
            labels,
            datasets: [{
              data,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              strokeWidth: 3,
            }],
          });
        } catch (err) {
          console.error('Error loading heart rate data:', err);
        }
      } else {
        // Default data if no sensor
        setHeartRateData({
          labels,
          datasets: [{
            data: [68, 70, 72, 71, 69, 72, 70],
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            strokeWidth: 3,
          }],
        });
      }

      // Load glucose data
      if (glucoseSensor) {
        try {
          const readings = await apiClient.getSensorReadings(glucoseSensor.id, { hours: daysAgo * 24 });
          const data = processReadingsForChart(readings, labels, daysAgo);
          setGlucoseData({
            labels,
            datasets: [{
              data,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              strokeWidth: 2,
            }],
          });
        } catch (err) {
          console.error('Error loading glucose data:', err);
        }
      } else {
        // Default data if no sensor
        setGlucoseData({
          labels,
          datasets: [{
            data: [95, 88, 92, 78, 68, 85, 90],
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            strokeWidth: 2,
          }],
        });
      }

      // Sleep and activity are placeholders (would need specific sensors)
      setSleepData({
        labels,
        datasets: [{
          data: [7.5, 8.0, 7.2, 6.8, 7.5, 8.2, 7.8],
          color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
          strokeWidth: 3,
        }],
      });

      setActivityData({
        labels,
        datasets: [{
          data: [4200, 5100, 4800, 3900, 5400, 6200, 5800],
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 2,
        }],
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trend data');
      console.error('Error loading trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processReadingsForChart = (readings: SensorReading[], labels: string[], days: number): number[] => {
    if (readings.length === 0) {
      return Array(7).fill(0);
    }

    // Group readings by day
    const now = new Date();
    const dayData: { [key: number]: number[] } = {};
    
    for (let i = 0; i < days; i++) {
      dayData[i] = [];
    }

    readings.forEach(reading => {
      const readingDate = new Date(reading.timestamp);
      const daysDiff = Math.floor((now.getTime() - readingDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < days) {
        dayData[daysDiff].push(reading.value);
      }
    });

    // Calculate average for each day
    const result: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const values = dayData[i];
      if (values && values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        result.push(Math.round(avg * 10) / 10);
      } else {
        // Use previous day's value or 0
        result.push(result.length > 0 ? result[result.length - 1] : 0);
      }
    }

    return result;
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffffff',
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading trends...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadTrendData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trend Analytics</Text>

      {/* Heart Rate Trend */}
      {heartRateData && (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <View style={[styles.iconContainer, styles.redIcon]}>
                <Ionicons name="heart" size={20} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.chartTitle}>Heart Rate</Text>
                <Text style={styles.chartSubtitle}>7-day trend</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.checkInButton}>
              <Text style={styles.checkInButtonText}>Check In</Text>
            </TouchableOpacity>
          </View>
          <LineChart
            data={heartRateData}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
            yAxisInterval={5}
          />
        </View>
      )}

      {/* Blood Glucose Trend */}
      {glucoseData && (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <View style={[styles.iconContainer, styles.blueIcon]}>
                <Ionicons name="water-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.chartTitle}>Blood Glucose</Text>
                <Text style={styles.chartSubtitle}>7-day trend</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.checkInButton}>
              <Text style={styles.checkInButtonText}>Check In</Text>
            </TouchableOpacity>
          </View>
          <LineChart
            data={glucoseData}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
          />
        </View>
      )}

      {/* Sleep Quality Trend */}
      {sleepData && (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <View style={[styles.iconContainer, styles.purpleIcon]}>
                <Ionicons name="moon" size={20} color="#8b5cf6" />
              </View>
              <View>
                <Text style={styles.chartTitle}>Sleep Quality</Text>
                <Text style={styles.chartSubtitle}>7-day trend</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.checkInButton}>
              <Text style={styles.checkInButtonText}>Check In</Text>
            </TouchableOpacity>
          </View>
          <LineChart
            data={sleepData}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
          />
        </View>
      )}

      {/* Activity Level Trend */}
      {activityData && (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <View style={[styles.iconContainer, styles.greenIcon]}>
                <Ionicons name="walk-outline" size={20} color="#10b981" />
              </View>
              <View>
                <Text style={styles.chartTitle}>Activity Level</Text>
                <Text style={styles.chartSubtitle}>7-day trend</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.checkInButton}>
              <Text style={styles.checkInButtonText}>Check In</Text>
            </TouchableOpacity>
          </View>
          <LineChart
            data={activityData}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
          />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  chartCard: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  redIcon: {
    backgroundColor: '#fee2e2',
  },
  blueIcon: {
    backgroundColor: '#dbeafe',
  },
  purpleIcon: {
    backgroundColor: '#f3e8ff',
  },
  greenIcon: {
    backgroundColor: '#d1fae5',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  checkInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
  },
  checkInButtonText: {
    color: '#2563eb',
    fontWeight: '500',
    fontSize: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
