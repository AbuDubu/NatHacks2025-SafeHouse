/**
 * Simplified Profile Screen - No Contexts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>Demo User</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>+1 (555) 123-4567</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Role:</Text>
          <Text style={[styles.value, styles.roleBadge]}>elder</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Integration</Text>
        <Text style={styles.description}>
          HealthKit integration is disabled in Expo Go.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SafeHouse v1.0.0</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  roleBadge: {
    textTransform: 'capitalize',
    color: '#EF4444',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ProfileScreen;

