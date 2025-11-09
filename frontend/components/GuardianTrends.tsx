import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const heartRateData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [68, 70, 72, 71, 69, 72, 70],
      color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
      strokeWidth: 3,
    },
  ],
};

const glucoseData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [95, 88, 92, 78, 68, 85, 90],
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

const sleepData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [7.5, 8.0, 7.2, 6.8, 7.5, 8.2, 7.8],
      color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
      strokeWidth: 3,
    },
  ],
};

const activityData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [4200, 5100, 4800, 3900, 5400, 6200, 5800],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      strokeWidth: 2,
    },
  ],
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

export function GuardianTrends() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trend Analytics</Text>

      {/* Heart Rate Trend */}
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

      {/* Blood Glucose Trend */}
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

      {/* Sleep Quality Trend */}
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

      {/* Activity Level Trend */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 100,
    backgroundColor: '#f9fafb',
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
