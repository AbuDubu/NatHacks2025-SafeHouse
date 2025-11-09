import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuardianTrends } from './GuardianTrends';
import { HouseTemperatureTab } from './HouseTemperatureTab';
import { useTheme } from '../contexts/ThemeContext';
import { apiClient, User, DashboardData, Alert, SensorReading, Sensor } from '../lib/api';
import { generateHealthInsights, Insight } from '../lib/healthInsights';

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
  insights?: Insight[];
}

export function GuardianDashboard({ onEmergency, onLogout }: GuardianDashboardProps) {
  const { isDark, themeMode, setThemeMode, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criticalAlert, setCriticalAlert] = useState<Alert | null>(null);
  const [guardian, setGuardian] = useState<User | null>(null);

  const toggleDarkMode = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

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
      
      // Get the guardian user (default guardian)
      const guardianUser = await apiClient.getDefaultGuardian();
      setGuardian(guardianUser);
      
      // Get residents under this guardian's care
      const residentUsers = await apiClient.getGuardianResidents(guardianUser.id);
      
      // If no residents linked, fall back to all primary users (for backward compatibility)
      const usersToLoad = residentUsers.length > 0 ? residentUsers : 
        (await apiClient.getUsers()).filter(u => u.is_primary);
      
      // Load dashboard data for each resident
      const residentsData: Resident[] = await Promise.all(
        usersToLoad.map(async (user) => {
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
              insights: generateHealthInsights(dashboardData).filter(insight => insight.notifyGuardian),
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {activeTab === 'home' && (
        <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            {guardian && (
              <View style={styles.greetingContainer}>
                <Text 
                  style={[styles.greeting, { color: colors.foreground }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.7}
                >
                  {getGreeting()}, {guardian.name}
                </Text>
                <Text style={[styles.greetingSubtext, { color: colors.mutedForeground }]}>
                  {residents.length} {residents.length === 1 ? 'resident' : 'residents'} under your care
                </Text>
              </View>
            )}
            {!guardian && (
              <Text style={[styles.title, { color: colors.foreground }]}>Guardian Dashboard</Text>
            )}

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.mutedForeground} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search residents..."
                placeholderTextColor={colors.mutedForeground}
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
                  <View key={resident.id} style={[styles.residentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.residentHeader}>
                      <View style={styles.avatar}>
                        <Ionicons name="person" size={32} color="#2563eb" />
                      </View>
                      <View style={styles.residentInfo}>
                        <View style={styles.residentNameRow}>
                          <View style={styles.residentNameContainer}>
                            <Text style={[styles.residentName, { color: colors.foreground }]}>{resident.name}</Text>
                            {guardian && (
                              <View style={styles.careBadge}>
                                <Ionicons name="heart" size={12} color={colors.primary} />
                                <Text style={[styles.careText, { color: colors.mutedForeground }]}>
                                  Under {guardian.name}'s care
                                </Text>
                              </View>
                            )}
                            {resident.age && (
                              <Text style={[styles.residentAge, { color: colors.mutedForeground }]}>Age {resident.age}</Text>
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
                      <View style={[styles.vitalItem, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.vitalLabel, { color: colors.mutedForeground }]}>Heart Rate</Text>
                        <Text style={[styles.vitalValue, { color: colors.foreground }]}>
                          {resident.vitals.heartRate > 0 ? `${resident.vitals.heartRate} bpm` : '--'}
                        </Text>
                      </View>
                      <View style={[styles.vitalItem, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.vitalLabel, { color: colors.mutedForeground }]}>Glucose</Text>
                        <Text style={[styles.vitalValue, { color: colors.foreground }]}>
                          {resident.vitals.glucose > 0 ? `${resident.vitals.glucose} mg/dL` : '--'}
                        </Text>
                      </View>
                      <View style={[styles.vitalItem, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.vitalLabel, { color: colors.mutedForeground }]}>Sleep</Text>
                        <Text style={[styles.vitalValue, { color: colors.foreground }]}>{resident.vitals.sleep}h</Text>
                      </View>
                      <View style={[styles.vitalItem, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.vitalLabel, { color: colors.mutedForeground }]}>Activity</Text>
                        <Text style={[styles.vitalValue, { color: colors.foreground }]}>{resident.vitals.activity} steps</Text>
                      </View>
                    </View>

                    {resident.insights && resident.insights.length > 0 && (
                      <View style={styles.guardianInsightsSection}>
                        {resident.insights.map((insight) => (
                          <View
                            key={insight.id}
                            style={[
                              styles.guardianInsightCard,
                              insight.severity === 'critical'
                                ? styles.guardianInsightCritical
                                : styles.guardianInsightWarning,
                            ]}
                          >
                            <View style={styles.guardianInsightHeader}>
                              <Ionicons
                                name={insight.severity === 'critical' ? 'warning' : 'alert-circle'}
                                size={16}
                                color={insight.severity === 'critical' ? '#991b1b' : '#854d0e'}
                              />
                              <Text
                                style={[
                                  styles.guardianInsightTitle,
                                  insight.severity === 'critical'
                                    ? styles.guardianInsightTitleCritical
                                    : styles.guardianInsightTitleWarning,
                                ]}
                              >
                                {insight.title}
                              </Text>
                            </View>
                            <Text style={styles.guardianInsightMessage}>{insight.message}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity style={[styles.checkInButton, { borderColor: colors.ring }]}>
                      <Text style={[styles.checkInButtonText, { color: colors.primary }]}>Check In</Text>
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
          <Ionicons name="chatbubbles" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>Messages coming soon</Text>
        </View>
      )}

      {activeTab === 'settings' && (
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <View style={styles.settingsHeader}>
            <Text style={[styles.settingsTitle, { color: colors.foreground }]}>Settings</Text>
          </View>
          
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account</Text>
            
            <TouchableOpacity style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="person" size={24} color={colors.foreground} />
                <Text style={[styles.settingsItemText, { color: colors.foreground }]}>Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="notifications" size={24} color={colors.foreground} />
                <Text style={[styles.settingsItemText, { color: colors.foreground }]}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Preferences</Text>
            
            <TouchableOpacity style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="language" size={24} color={colors.foreground} />
                <Text style={[styles.settingsItemText, { color: colors.foreground }]}>Language</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
            
            <View style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={colors.foreground} />
                <Text style={[styles.settingsItemText, { color: colors.foreground }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={isDark ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>About</Text>
            
            <TouchableOpacity style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="help-circle" size={24} color={colors.foreground} />
                <Text style={[styles.settingsItemText, { color: colors.foreground }]}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingsItemLeft}>
                <Ionicons name="document-text" size={24} color={colors.foreground} />
                <Text style={[styles.settingsItemText, { color: colors.foreground }]}>Terms & Privacy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
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
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('home')}
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
        >
          <Ionicons name="home" size={24} color={activeTab === 'home' ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.navLabel, activeTab === 'home' && { color: colors.primary }, !activeTab && { color: colors.mutedForeground }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('trends')}
          style={[styles.navItem, activeTab === 'trends' && styles.navItemActive]}
        >
          <Ionicons name="trending-up" size={24} color={activeTab === 'trends' ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.navLabel, activeTab === 'trends' && { color: colors.primary }, !activeTab && { color: colors.mutedForeground }]}>Trends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('messages')}
          style={[styles.navItem, activeTab === 'messages' && styles.navItemActive]}
        >
          <Ionicons name="chatbubbles" size={24} color={activeTab === 'messages' ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.navLabel, activeTab === 'messages' && { color: colors.primary }, !activeTab && { color: colors.mutedForeground }]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('temperature')}
          style={[styles.navItem, activeTab === 'temperature' && styles.navItemActive]}
        >
          <Ionicons name="thermometer" size={24} color={activeTab === 'temperature' ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.navLabel, activeTab === 'temperature' && { color: colors.primary }, !activeTab && { color: colors.mutedForeground }]}>Temperature</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('settings')}
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]}
        >
          <Ionicons name="settings" size={24} color={activeTab === 'settings' ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.navLabel, activeTab === 'settings' && { color: colors.primary }, !activeTab && { color: colors.mutedForeground }]}>Settings</Text>
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
  greetingContainer: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    flexShrink: 1,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
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
  residentNameContainer: {
    flex: 1,
  },
  residentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  careBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    gap: 4,
  },
  careText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
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
  guardianInsightsSection: {
    marginTop: 12,
    gap: 12,
  },
  guardianInsightCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  guardianInsightWarning: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  guardianInsightCritical: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  guardianInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  guardianInsightTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  guardianInsightTitleWarning: {
    color: '#b45309',
  },
  guardianInsightTitleCritical: {
    color: '#b91c1c',
  },
  guardianInsightMessage: {
    fontSize: 13,
    color: '#4b5563',
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
    marginTop: 4,
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
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
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
