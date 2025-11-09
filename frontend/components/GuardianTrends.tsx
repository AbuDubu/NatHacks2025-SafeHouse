import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, SensorReading, Sensor } from '../lib/api';
import { getHeartRateData, getBloodGlucoseData, getStepCountData, getSleepData, initializeHealthKit } from '../lib/appleHealth';

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
    // Initialize Apple Health on mount and wait for it
    const initHealth = async () => {
      await initializeHealthKit();
      loadTrendData();
    };
    initHealth();
  }, []);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate labels for the past 7 days
      const daysAgo = 7;
      const now = new Date();
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }

      // Load heart rate data from Apple Health
      try {
        const heartRateHealthData = await getHeartRateData(daysAgo);
        const dailyHeartRate = processHealthDataByDay(heartRateHealthData, daysAgo, 'heartRate');
        
        // Only set data if we have real data (at least some non-zero values)
        if (dailyHeartRate.length === 7 && dailyHeartRate.some(val => val > 0)) {
          setHeartRateData({
            labels,
            datasets: [{
              data: dailyHeartRate,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              strokeWidth: 3,
            }],
          });
        } else {
          // Try to get from backend sensor data
          const heartRateSensors = await apiClient.getSensors({ sensor_type: 'heart_rate' });
          if (heartRateSensors.length > 0) {
            const readings = await apiClient.getSensorReadings(heartRateSensors[0].id, { hours: daysAgo * 24 });
            const dailyFromBackend = processReadingsForChart(readings, labels, daysAgo);
            if (dailyFromBackend.some(val => val > 0)) {
              setHeartRateData({
                labels,
                datasets: [{
                  data: dailyFromBackend,
                  color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                  strokeWidth: 3,
                }],
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading heart rate data:', err);
        // No fallback - data will remain null and chart won't show
      }

      // Load glucose data from Apple Health
      try {
        const glucoseHealthData = await getBloodGlucoseData(daysAgo);
        const dailyGlucose = processHealthDataByDay(glucoseHealthData, daysAgo, 'bloodGlucose');
        
        // Only set data if we have real data (at least some non-zero values)
        if (dailyGlucose.length === 7 && dailyGlucose.some(val => val > 0)) {
          setGlucoseData({
            labels,
            datasets: [{
              data: dailyGlucose,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              strokeWidth: 2,
            }],
          });
        } else {
          // Try to get from backend sensor data
          const glucoseSensors = await apiClient.getSensors({ sensor_type: 'blood_glucose' });
          if (glucoseSensors.length > 0) {
            const readings = await apiClient.getSensorReadings(glucoseSensors[0].id, { hours: daysAgo * 24 });
            const dailyFromBackend = processReadingsForChart(readings, labels, daysAgo);
            if (dailyFromBackend.some(val => val > 0)) {
              setGlucoseData({
                labels,
                datasets: [{
                  data: dailyFromBackend,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 2,
                }],
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading glucose data:', err);
        // No fallback - data will remain null and chart won't show
      }

      // Load sleep data from Apple Health
      try {
        const sleepHealthData = await getSleepData(daysAgo);
        const dailySleep = processHealthDataByDay(sleepHealthData, daysAgo, 'sleepHours');
        
        // Only set data if we have real data (at least some non-zero values)
        if (dailySleep.length === 7 && dailySleep.some(val => val > 0)) {
          setSleepData({
            labels,
            datasets: [{
              data: dailySleep,
              color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
              strokeWidth: 3,
            }],
          });
        } else {
          // Try to get from backend sensor data
          const sleepSensors = await apiClient.getSensors({ sensor_type: 'sleep' });
          if (sleepSensors.length > 0) {
            const readings = await apiClient.getSensorReadings(sleepSensors[0].id, { hours: daysAgo * 24 });
            const dailyFromBackend = processReadingsForChart(readings, labels, daysAgo);
            if (dailyFromBackend.some(val => val > 0)) {
              setSleepData({
                labels,
                datasets: [{
                  data: dailyFromBackend,
                  color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                  strokeWidth: 3,
                }],
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading sleep data:', err);
        // No fallback - data will remain null and chart won't show
      }

      // Load activity (steps) data from Apple Health
      try {
        const activityHealthData = await getStepCountData(daysAgo);
        const dailyActivity = processHealthDataByDay(activityHealthData, daysAgo, 'steps');
        
        // Only set data if we have real data (at least some non-zero values)
        if (dailyActivity.length === 7 && dailyActivity.some(val => val > 0)) {
          setActivityData({
            labels,
            datasets: [{
              data: dailyActivity,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              strokeWidth: 2,
            }],
          });
        } else {
          // Try to get from backend sensor data (activity or step_count)
          const activitySensors = await apiClient.getSensors({ sensor_type: 'activity' });
          const stepSensors = await apiClient.getSensors({ sensor_type: 'step_count' });
          const sensorsToUse = activitySensors.length > 0 ? activitySensors : stepSensors;
          
          if (sensorsToUse.length > 0) {
            const readings = await apiClient.getSensorReadings(sensorsToUse[0].id, { hours: daysAgo * 24 });
            const dailyFromBackend = processReadingsForChart(readings, labels, daysAgo);
            if (dailyFromBackend.some(val => val > 0)) {
              setActivityData({
                labels,
                datasets: [{
                  data: dailyFromBackend,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  strokeWidth: 2,
                }],
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading activity data:', err);
        // No fallback - data will remain null and chart won't show
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trend data');
      console.error('Error loading trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process Apple Health data by day for chart display
  const processHealthDataByDay = (
    healthData: Array<{ date: Date; heartRate?: number; steps?: number; sleepHours?: number; bloodGlucose?: number }>,
    days: number,
    type: 'heartRate' | 'steps' | 'sleepHours' | 'bloodGlucose'
  ): number[] => {
    if (healthData.length === 0) {
      return Array(7).fill(0);
    }

    const now = new Date();
    const dayData: { [key: number]: number[] } = {};
    
    // Initialize day buckets
    for (let i = 0; i < days; i++) {
      dayData[i] = [];
    }

    // Group data by day
    healthData.forEach(data => {
      const dataDate = new Date(data.date);
      const daysDiff = Math.floor((now.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < days) {
        let value: number | undefined;
        switch (type) {
          case 'heartRate':
            value = data.heartRate;
            break;
          case 'steps':
            value = data.steps;
            break;
          case 'sleepHours':
            value = data.sleepHours;
            break;
          case 'bloodGlucose':
            value = data.bloodGlucose;
            break;
        }
        if (value !== undefined && value > 0) {
          dayData[daysDiff].push(value);
        }
      }
    });

    // Calculate average or sum for each day
    const result: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      if (dayData[i].length > 0) {
        if (type === 'steps') {
          // Sum steps for the day
          result.push(Math.round(dayData[i].reduce((sum, val) => sum + val, 0)));
        } else {
          // Average for other metrics
          const avg = dayData[i].reduce((sum, val) => sum + val, 0) / dayData[i].length;
          result.push(Math.round(avg * 10) / 10); // Round to 1 decimal
        }
      } else {
        result.push(0);
      }
    }

    return result;
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
        // No data for this day - return 0 (no fallback to previous day)
        result.push(0);
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

  // Check if we have any data at all
  const hasAnyData = heartRateData || glucoseData || sleepData || activityData;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trend Analytics</Text>

      {!hasAnyData && (
        <View style={[styles.chartCard, styles.centerContent]}>
          <Ionicons name="stats-chart-outline" size={64} color="#d1d5db" />
          <Text style={styles.noDataText}>No trend data available</Text>
          <Text style={styles.noDataSubtext}>
            Connect Apple Health or ensure sensors are sending data to view trends.
          </Text>
        </View>
      )}

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
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
  },
});
