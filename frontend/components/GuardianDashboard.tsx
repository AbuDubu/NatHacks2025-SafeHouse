import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuardianTrends } from './GuardianTrends';
import { HouseTemperatureTab } from './HouseTemperatureTab';
import { apiClient, User, DashboardData, Alert, SensorReading, Sensor } from '../lib/api';

interface GuardianDashboardProps {
  onEmergency: (context?: { residentName?: string; alertType?: string }) => void;
  onLogout?: () => void;
}

interface Resident {
  id: number;
  name: string;
  age?: number;
  photo: string;
  status: 'normal' | 'warning' | 'alert';
  vitals: {
    heartRate: number;
    glucose: number;
    sleep: number;
    activity: number;
  };
  dashboardData?: DashboardData;
}

export function GuardianDashboard({ onEmergency, onLogout }: GuardianDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criticalAlert, setCriticalAlert] = useState<Alert | null>(null);

  useEffect(() => {
    loadResidents();
    // Refresh every 30 seconds
    const interval = setInterval(loadResidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadResidents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all users
      const users = await apiClient.getUsers();
      const primaryUsers = users.filter(u => u.is_primary);
      
      // Load dashboard data for each resident
      const residentsData: Resident[] = await Promise.all(
        primaryUsers.map(async (user) => {
          try {
            const dashboardData = await apiClient.getDashboard(user.id);
            const activeAlerts = dashboardData.active_alerts || [];
            const criticalAlerts = activeAlerts.filter(a => a.alert_level === 'critical');
            const warningAlerts = activeAlerts.filter(a => a.alert_level === 'warning');
            
            // Determine status
            let status: 'normal' | 'warning' | 'alert' = 'normal';
            if (criticalAlerts.length > 0) {
              status = 'alert';
            } else if (warningAlerts.length > 0) {
              status = 'warning';
            }
            
            // Extract vitals from readings
            const readings = dashboardData.recent_readings || [];
            const heartRate = getLatestReading(readings, 'heart_rate') || 0;
            const glucose = getLatestReading(readings, 'glucose') || 0;
            
            // Set critical alert if found
            if (criticalAlerts.length > 0 && !criticalAlert) {
              setCriticalAlert(criticalAlerts[0]);
            }
            
            return {
              id: user.id,
              name: user.name,
              age: undefined, // Age not in user model
              photo: user.name.substring(0, 2).toUpperCase(),
              status,
              vitals: {
                heartRate: Math.round(heartRate),
                glucose: Math.round(glucose),
                sleep: 7.5, // Placeholder
                activity: 5432, // Placeholder
              },
              dashboardData,
            };
          } catch (err) {
            console.error(`Error loading dashboard for user ${user.id}:`, err);
            return {
              id: user.id,
              name: user.name,
              age: undefined,
              photo: user.name.substring(0, 2).toUpperCase(),
              status: 'normal' as const,
              vitals: {
                heartRate: 0,
                glucose: 0,
                sleep: 0,
                activity: 0,
              },
            };
          }
        })
      );
      
      setResidents(residentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load residents');
      console.error('Error loading residents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLatestReading = (readings: SensorReading[], sensorType: string): number | null => {
    const filtered = readings.filter(r => r.sensor?.sensor_type === sensorType);
    if (filtered.length === 0) return null;
    const sorted = filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sorted[0].value;
  };

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

  if (loading && residents.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading residents...</Text>
      </View>
    );
  }

  if (error && residents.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadResidents} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          {criticalAlert && (
            <View style={styles.emergencyBanner}>
              <Ionicons name="alert-circle" size={24} color="#dc2626" />
              <View style={styles.emergencyContent}>
                <Text style={styles.emergencyTitle}>Emergency Alert</Text>
                <Text style={styles.emergencyText}>
                  {criticalAlert.title}: {criticalAlert.message}
                </Text>
                <View style={styles.emergencyButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      const resident = residents.find(r => r.dashboardData?.user.id === criticalAlert.user_id);
                      onEmergency({ 
                        residentName: resident?.name || 'Resident', 
                        alertType: criticalAlert.alert_level 
                      });
                    }}
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
          )}

          {/* Residents List */}
          <View style={styles.residentsList}>
            {filteredResidents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No residents found</Text>
              </View>
            ) : (
              filteredResidents.map((resident) => {
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
                            {resident.age && (
                              <Text style={styles.residentAge}>Age {resident.age}</Text>
                            )}
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
                        <Text style={styles.vitalValue}>
                          {resident.vitals.heartRate > 0 ? `${resident.vitals.heartRate} bpm` : '--'}
                        </Text>
                      </View>
                      <View style={styles.vitalItem}>
                        <Text style={styles.vitalLabel}>Glucose</Text>
                        <Text style={styles.vitalValue}>
                          {resident.vitals.glucose > 0 ? `${resident.vitals.glucose} mg/dL` : '--'}
                        </Text>
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
              })
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === 'trends' && <GuardianTrends />}

      {activeTab === 'temperature' && (
        <HouseTemperatureTab />
      )}

      {activeTab === 'messages' && (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateText}>Messages coming soon</Text>
        </View>
      )}

      {activeTab === 'settings' && (
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Settings</Text>
          </View>
          
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="person" size={24} color="#6b7280" />
                <Text style={styles.settingsItemText}>Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="notifications" size={24} color="#6b7280" />
                <Text style={styles.settingsItemText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="language" size={24} color="#6b7280" />
                <Text style={styles.settingsItemText}>Language</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="moon" size={24} color="#6b7280" />
                <Text style={styles.settingsItemText}>Dark Mode</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="help-circle" size={24} color="#6b7280" />
                <Text style={styles.settingsItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="document-text" size={24} color="#6b7280" />
                <Text style={styles.settingsItemText}>Terms & Privacy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoutSection}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={onLogout}
            >
              <Ionicons name="log-out" size={24} color="#ffffff" />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
          onPress={() => setActiveTab('temperature')}
          style={[styles.navItem, activeTab === 'temperature' && styles.navItemActive]}
        >
          <Ionicons name="thermometer" size={24} color={activeTab === 'temperature' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.navLabel, activeTab === 'temperature' && styles.navLabelActive]}>Temperature</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
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
  settingsContent: {
    padding: 24,
    paddingBottom: 100,
  },
  settingsHeader: {
    marginBottom: 32,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemText: {
    fontSize: 16,
    color: '#111827',
  },
  logoutSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    gap: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
