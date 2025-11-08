/**
 * SafeHouse Mobile App - Absolute Minimal Test
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function App() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SafeHouse</Text>
        <Text style={styles.subtitle}>Heat Safety Monitor</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Status</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Normal</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.item}>
            <Text style={styles.label}>Temperature</Text>
            <Text style={styles.value}>25.0°C</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Humidity</Text>
            <Text style={styles.value}>60%</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Heat Index</Text>
            <Text style={styles.value}>27.0°C</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device Status</Text>
        <Text style={styles.text}>Online ✓</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Info</Text>
        <Text style={styles.text}>
          This is a minimal test version. Navigation and features will be added once the base app is working.
        </Text>
      </View>
    </ScrollView>
  );
}

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
    color: '#EF4444',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  text: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
