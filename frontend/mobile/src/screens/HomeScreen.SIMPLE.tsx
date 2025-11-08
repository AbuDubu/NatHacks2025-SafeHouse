/**
 * Simplified Home Screen - No Contexts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello!</Text>
        <Text style={styles.role}>SafeHouse App</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Status</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Normal</Text>
        </View>

        <View style={styles.telemetryGrid}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Temperature</Text>
            <Text style={styles.telemetryValue}>25.0°C</Text>
          </View>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Humidity</Text>
            <Text style={styles.telemetryValue}>60%</Text>
          </View>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Heat Index</Text>
            <Text style={styles.telemetryValue}>27.0°C</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device Status</Text>
        <Text style={styles.noData}>Online</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Data</Text>
        <Text style={styles.noData}>HealthKit disabled in Expo Go</Text>
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
    marginTop: 4,
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
    backgroundColor: '#10B981',
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
  },
});

export default HomeScreen;

