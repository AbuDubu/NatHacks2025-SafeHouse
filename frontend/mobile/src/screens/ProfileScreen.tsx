/**
 * Profile Screen
 * User profile and settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { healthService } from '../services/health.service';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleEnableHealthKit = async () => {
    // Disabled in Expo Go
    Alert.alert(
      'HealthKit Unavailable',
      'HealthKit requires a development build or standalone app. It is not supported in Expo Go.',
      [{ text: 'OK' }]
    );
    // const enabled = await healthService.requestAuthorization();
    // if (enabled) {
    //   Alert.alert('Success', 'HealthKit enabled successfully');
    // } else {
    //   Alert.alert('Error', 'Failed to enable HealthKit');
    // }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{user?.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || 'Not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Role:</Text>
          <Text style={[styles.value, styles.roleBadge]}>
            {user?.role}
          </Text>
        </View>
      </View>

      {/* Health Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Integration</Text>
        <Text style={styles.description}>
          HealthKit integration is disabled in Expo Go. Build a development build or standalone app to enable health data sharing.
        </Text>
        <View style={[styles.button, { backgroundColor: '#9CA3AF' }]}>
          <Text style={styles.buttonText}>⏸️ Unavailable in Expo Go</Text>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Text style={styles.description}>
          Manage notification preferences for alerts and reminders
        </Text>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Notification Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts (for elders) */}
      {user?.role === 'elder' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Contacts</Text>
          <Text style={styles.description}>
            Manage your caregivers and emergency contacts
          </Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Manage Contacts</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

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
  button: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
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

