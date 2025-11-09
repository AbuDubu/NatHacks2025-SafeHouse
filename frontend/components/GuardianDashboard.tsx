import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuardianTrends } from './GuardianTrends';

interface GuardianDashboardProps {
  onEmergency: (context?: { residentName?: string; alertType?: string }) => void;
}

interface Resident {
  id: string;
  name: string;
  age: number;
  photo: string;
  status: 'normal' | 'warning' | 'alert';
  vitals: {
    heartRate: number;
    glucose: number;
    sleep: number;
    activity: number;
  };
}

export function GuardianDashboard({ onEmergency }: GuardianDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const residents: Resident[] = [
    {
      id: '1',
      name: 'Margaret Chen',
      age: 78,
      photo: 'MC',
      status: 'warning',
      vitals: { heartRate: 72, glucose: 68, sleep: 7.5, activity: 5432 },
    },
    {
      id: '2',
      name: 'Robert Williams',
      age: 82,
      photo: 'RW',
      status: 'normal',
      vitals: { heartRate: 68, glucose: 95, sleep: 8.0, activity: 3200 },
    },
    {
      id: '3',
      name: 'Helen Martinez',
      age: 75,
      photo: 'HM',
      status: 'alert',
      vitals: { heartRate: 95, glucose: 180, sleep: 4.2, activity: 850 },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
      case 'warning':
        return { bg: '#fefce8', text: '#854d0e', border: '#fde047' };
      case 'alert':
        return { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'All Normal';
      case 'warning':
        return 'Trending Concern';
      case 'alert':
        return 'Alert';
      default:
        return 'Unknown';
    }
  };

  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {activeTab === 'home' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Guardian Dashboard</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search residents..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Emergency Alert Banner */}
          <View style={styles.emergencyBanner}>
            <Ionicons name="alert-circle" size={24} color="#dc2626" />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Emergency Alert</Text>
              <Text style={styles.emergencyText}>
                Helen Martinez did not respond. Emergency services contacted.
              </Text>
              <View style={styles.emergencyButtons}>
                <TouchableOpacity
                  onPress={() => onEmergency({ residentName: 'Helen Martinez', alertType: 'no-response' })}
                  style={styles.emergencyButton}
                >
                  <Text style={styles.emergencyButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.callButton}>
                  <Ionicons name="call" size={16} color="#dc2626" />
                  <Text style={styles.callButtonText}>Call Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Residents List */}
          <View style={styles.residentsList}>
            {filteredResidents.map((resident) => {
              const statusColors = getStatusColor(resident.status);
              return (
                <View key={resident.id} style={styles.residentCard}>
                  <View style={styles.residentHeader}>
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={32} color="#2563eb" />
                    </View>
                    <View style={styles.residentInfo}>
                      <View style={styles.residentNameRow}>
                        <View>
                          <Text style={styles.residentName}>{resident.name}</Text>
                          <Text style={styles.residentAge}>Age {resident.age}</Text>
                        </View>
                        <View style={[styles.statusBadge, {
                          backgroundColor: statusColors.bg,
                          borderColor: statusColors.border,
                        }]}>
                          <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {getStatusText(resident.status)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Vitals Grid */}
                  <View style={styles.vitalsGrid}>
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Heart Rate</Text>
                      <Text style={styles.vitalValue}>{resident.vitals.heartRate} bpm</Text>
                    </View>
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Glucose</Text>
                      <Text style={styles.vitalValue}>{resident.vitals.glucose} mg/dL</Text>
                    </View>
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Sleep</Text>
                      <Text style={styles.vitalValue}>{resident.vitals.sleep}h</Text>
                    </View>
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Activity</Text>
                      <Text style={styles.vitalValue}>{resident.vitals.activity} steps</Text>
                    </View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity style={styles.checkInButton}>
                    <Text style={styles.checkInButtonText}>Check In</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {activeTab === 'trends' && <GuardianTrends />}

      {activeTab === 'messages' && (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateText}>Messages coming soon</Text>
        </View>
      )}

      {activeTab === 'settings' && (
        <View style={styles.emptyState}>
          <Ionicons name="settings" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateText}>Settings coming soon</Text>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => setActiveTab('home')}
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
        >
          <Ionicons name="home" size={24} color={activeTab === 'home' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('trends')}
          style={[styles.navItem, activeTab === 'trends' && styles.navItemActive]}
        >
          <Ionicons name="trending-up" size={24} color={activeTab === 'trends' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.navLabel, activeTab === 'trends' && styles.navLabelActive]}>Trends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('messages')}
          style={[styles.navItem, activeTab === 'messages' && styles.navItemActive]}
        >
          <Ionicons name="chatbubbles" size={24} color={activeTab === 'messages' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.navLabel, activeTab === 'messages' && styles.navLabelActive]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('settings')}
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]}
        >
          <Ionicons name="settings" size={24} color={activeTab === 'settings' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.navLabel, activeTab === 'settings' && styles.navLabelActive]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  emergencyBanner: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fca5a5',
    marginBottom: 24,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 16,
  },
  emergencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  emergencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    gap: 8,
  },
  callButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  residentsList: {
    gap: 16,
  },
  residentCard: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  residentHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  residentInfo: {
    flex: 1,
  },
  residentNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  residentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  residentAge: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  vitalItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  checkInButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#dbeafe',
  },
  navLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#2563eb',
  },
});
