import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, DashboardData, SensorReading } from '../lib/api';
import { generateHealthInsights, Insight } from '../lib/healthInsights';

interface ResidentDashboardProps {
  name: string;
  onEmergency: () => void;
  onLogout?: () => void;
}

interface VitalCard {
  icon: string;
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'alert';
  color: string;
}

export function ResidentDashboard({ name, onEmergency, onLogout }: ResidentDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    confirmed: boolean;
    alertId?: number;
  }>({
    show: false,
    message: '',
    confirmed: false,
  });
  const [insights, setInsights] = useState<Insight[]>([]);
  const [activeEmergencyInsight, setActiveEmergencyInsight] = useState<Insight | null>(null);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDashboard();
      setDashboardData(data);
      
      // Show most recent critical/warning alert as notification
      const activeAlerts = data.active_alerts || [];
      const criticalAlert = activeAlerts.find(a => a.alert_level === 'critical');
      const warningAlert = activeAlerts.find(a => a.alert_level === 'warning');
      const alertToShow = criticalAlert || warningAlert;
      
      if (alertToShow && !notification.confirmed) {
        setNotification({
          show: true,
          message: alertToShow.message,
          confirmed: false,
          alertId: alertToShow.id,
        });
      }

      const generatedInsights = generateHealthInsights(data);
      setInsights(generatedInsights);
      const emergency = generatedInsights.find(
        (insight) => insight.tags?.includes('fall') && insight.severity === 'critical',
      );
      setActiveEmergencyInsight(emergency ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (notification.alertId) {
      try {
        await apiClient.resolveAlert(notification.alertId);
      } catch (err) {
        console.error('Error resolving alert:', err);
      }
    }
    setNotification({ ...notification, confirmed: true });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 1500);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Extract vitals from sensor readings
  const extractVitals = (readings: SensorReading[]): VitalCard[] => {
    const vitals: VitalCard[] = [];
    
    // Find latest readings for each vital type
    const heartRateReading = readings
      .filter(r => r.sensor?.sensor_type === 'heart_rate')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    const glucoseReading = readings
      .filter(r => r.sensor?.sensor_type === 'glucose' || r.sensor?.sensor_type === 'co2') // Using co2 as glucose proxy if available
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    // Heart Rate
    if (heartRateReading) {
      const value = Math.round(heartRateReading.value);
      vitals.push({
        icon: 'heart-outline',
        label: 'Heart Rate',
        value: value.toString(),
        unit: heartRateReading.unit || 'bpm',
        status: value > 100 || value < 60 ? 'warning' : 'normal',
        color: value > 100 || value < 60 ? 'yellow' : 'green',
      });
    } else {
      vitals.push({
        icon: 'heart-outline',
        label: 'Heart Rate',
        value: '--',
        unit: 'bpm',
        status: 'normal',
        color: 'green',
      });
    }

    // Blood Glucose (using co2 or other sensor as proxy, or default)
    if (glucoseReading) {
      const value = Math.round(glucoseReading.value);
      vitals.push({
        icon: 'water-outline',
        label: 'Blood Glucose',
        value: value.toString(),
        unit: glucoseReading.unit || 'mg/dL',
        status: value < 70 || value > 180 ? 'warning' : 'normal',
        color: value < 70 || value > 180 ? 'yellow' : 'green',
      });
    } else {
      vitals.push({
        icon: 'water-outline',
        label: 'Blood Glucose',
        value: '--',
        unit: 'mg/dL',
        status: 'normal',
        color: 'green',
      });
    }

    // Sleep Quality (placeholder - would need sleep sensor)
    vitals.push({
      icon: 'moon-outline',
      label: 'Sleep Quality',
      value: '7.5',
      unit: 'hours',
      status: 'normal',
      color: 'green',
    });

    // Activity Level (placeholder - would need activity sensor)
    vitals.push({
      icon: 'walk-outline',
      label: 'Activity Level',
      value: '5,432',
      unit: 'steps',
      status: 'normal',
      color: 'green',
    });

    return vitals;
  };

  const getVitalStyles = (color: string) => {
    switch (color) {
      case 'green':
        return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
      case 'yellow':
        return { bg: '#fefce8', text: '#854d0e', border: '#fde047' };
      case 'red':
        return { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' };
      default:
        return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
    }
  };

  const displayName = dashboardData?.user?.name || name;
  const vitals = dashboardData ? extractVitals(dashboardData.recent_readings || []) : [];

  if (loading && !dashboardData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error && !dashboardData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadDashboardData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeEmergencyInsight && (
        <View style={styles.emergencyOverlay}>
          <View style={styles.emergencyModal}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="warning" size={48} color="#dc2626" />
            </View>
            <Text style={styles.emergencyTitle}>{activeEmergencyInsight.title}</Text>
            <Text style={styles.emergencyMessage}>
              {activeEmergencyInsight.message || 'We detected a potential emergency situation.'}
            </Text>
            <View style={styles.emergencyActions}>
              <TouchableOpacity
                style={styles.emergencyDismissButton}
                onPress={() => setActiveEmergencyInsight(null)}
              >
                <Text style={styles.emergencyDismissText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emergencyCallButton}
                onPress={() => {
                  setActiveEmergencyInsight(null);
                  onEmergency();
                }}
              >
                <Ionicons name="call" size={16} color="#ffffff" />
                <Text style={styles.emergencyCallText}>Contact Emergency</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text 
              style={styles.greeting}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.7}
            >
              {getTimeGreeting()}, {displayName}
            </Text>
            {onLogout && (
              <TouchableOpacity onPress={onLogout} style={styles.logoutIconButton}>
                <Ionicons name="log-out" size={24} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Connection Status */}
          <View style={styles.connectionStatus}>
            <View style={styles.statusBadge}>
              <Ionicons name="watch" size={16} color="#166534" />
              <Text style={styles.statusText}>Apple Watch</Text>
              <Ionicons name="wifi" size={16} color="#166534" />
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="water" size={16} color="#166534" />
              <Text style={styles.statusText}>Dexcom</Text>
              <Ionicons name="wifi" size={16} color="#166534" />
            </View>
          </View>
        </View>

        {/* Notification Alert */}
        {notification.show && (
          <View style={[
            styles.notification,
            notification.confirmed ? styles.notificationConfirmed : styles.notificationWarning
          ]}>
            <Text style={[
              styles.notificationText,
              notification.confirmed && styles.notificationTextConfirmed
            ]}>
              {notification.confirmed ? '✓ Action confirmed' : notification.message}
            </Text>
            {!notification.confirmed && (
              <TouchableOpacity
                onPress={handleConfirm}
                style={styles.confirmButton}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.confirmButtonText}>Confirm Action</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Health Insights */}
        {insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.insightsTitle}>Suggestions for Today</Text>
            {insights.map((insight) => (
              <View
                key={insight.id}
                style={[
                  styles.insightCard,
                  insight.severity === 'critical'
                    ? styles.insightCardCritical
                    : insight.severity === 'warning'
                      ? styles.insightCardWarning
                      : styles.insightCardInfo,
                ]}
              >
                <View style={styles.insightHeader}>
                  <Ionicons
                    name={
                      insight.severity === 'critical'
                        ? 'warning'
                        : insight.severity === 'warning'
                          ? 'alert-circle'
                        : 'bulb-outline'
                    }
                    size={20}
                    color={
                      insight.severity === 'critical'
                        ? '#991b1b'
                        : insight.severity === 'warning'
                          ? '#854d0e'
                          : '#2563eb'
                    }
                  />
                  <Text
                    style={[
                      styles.insightTitle,
                      insight.severity === 'critical'
                        ? styles.insightTitleCritical
                        : insight.severity === 'warning'
                          ? styles.insightTitleWarning
                          : styles.insightTitleInfo,
                    ]}
                  >
                    {insight.title}
                  </Text>
                </View>
                <Text style={styles.insightMessage}>{insight.message}</Text>
                {insight.actions && insight.actions.length > 0 && (
                  <View style={styles.insightActions}>
                    {insight.actions.map((action) => (
                      <Text key={action} style={styles.insightActionItem}>
                        • {action}
                      </Text>
                    ))}
                  </View>
                )}
                {insight.notifyGuardian && (
                  <View style={styles.guardianBadge}>
                    <Ionicons name="notifications" size={14} color="#1d4ed8" />
                    <Text style={styles.guardianBadgeText}>Guardian notified</Text>
                  </View>
                )}
                {insight.severity === 'critical' && (
                  <TouchableOpacity style={styles.insightPrimaryButton}>
                    <Text style={styles.insightPrimaryButtonText}>View Options</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Vitals Grid */}
        <View style={styles.vitalsGrid}>
          {vitals.map((vital) => {
            const vitalStyles = getVitalStyles(vital.color);
            return (
              <View
                key={vital.label}
                style={[
                  styles.vitalCard,
                  {
                    backgroundColor: vitalStyles.bg,
                    borderColor: vitalStyles.border,
                  }
                ]}
              >
                <View style={styles.vitalIconContainer}>
                  <Ionicons name={vital.icon as keyof typeof Ionicons.glyphMap} size={40} color={vitalStyles.text} />
                </View>
                <Text style={[styles.vitalLabel, { color: vitalStyles.text }]}>
                  {vital.label}
                </Text>
                <Text style={[styles.vitalValue, { color: vitalStyles.text }]}>
                  {vital.value}
                </Text>
                <Text style={[styles.vitalUnit, { color: vitalStyles.text }]}>
                  {vital.unit}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Voice Assist Indicator */}
        <View style={styles.voiceAssistContainer}>
          <View style={styles.voiceAssistBadge}>
            <Text style={styles.voiceAssistText}>🎙️ Voice assist available</Text>
          </View>
        </View>
      </ScrollView>

      {/* Emergency Button - Fixed at Bottom */}
      <View style={styles.emergencyContainer}>
        <TouchableOpacity
          onPress={onEmergency}
          style={styles.emergencyButton}
        >
          <Ionicons name="call" size={24} color="#ffffff" />
          <Text style={styles.emergencyButtonText}>Call for Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    flexShrink: 1,
  },
  logoutIconButton: {
    padding: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    gap: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusText: {
    fontSize: 14,
    color: '#166534',
  },
  notification: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    marginBottom: 24,
  },
  notificationWarning: {
    backgroundColor: '#fefce8',
    borderColor: '#fde047',
  },
  notificationConfirmed: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  notificationText: {
    fontSize: 16,
    color: '#854d0e',
    marginBottom: 16,
  },
  notificationTextConfirmed: {
    color: '#166534',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#eab308',
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsSection: {
    marginBottom: 24,
    gap: 16,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  insightCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  insightCardInfo: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  insightCardWarning: {
    backgroundColor: '#fefce8',
    borderColor: '#fde047',
  },
  insightCardCritical: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightTitleInfo: {
    color: '#1d4ed8',
  },
  insightTitleWarning: {
    color: '#b45309',
  },
  insightTitleCritical: {
    color: '#b91c1c',
  },
  insightMessage: {
    fontSize: 14,
    color: '#374151',
  },
  insightActions: {
    marginTop: 4,
    gap: 4,
  },
  insightActionItem: {
    fontSize: 13,
    color: '#4b5563',
  },
  insightPrimaryButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc2626',
    borderRadius: 999,
  },
  insightPrimaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  guardianBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e0e7ff',
    borderRadius: 999,
  },
  guardianBadgeText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emergencyModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  emergencyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#b91c1c',
    textAlign: 'center',
  },
  emergencyMessage: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  emergencyDismissButton: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyDismissText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 14,
  },
  emergencyCallButton: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  emergencyCallText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  vitalCard: {
    width: '47%',
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  vitalIconContainer: {
    marginBottom: 12,
  },
  vitalLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  vitalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vitalUnit: {
    fontSize: 14,
    opacity: 0.7,
  },
  voiceAssistContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  voiceAssistBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  voiceAssistText: {
    fontSize: 14,
    color: '#1e40af',
  },
  emergencyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    backgroundColor: '#dc2626',
    borderRadius: 32,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
