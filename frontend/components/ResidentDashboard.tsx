import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, DashboardData, SensorReading } from '../lib/api';
import { generateHealthInsights, Insight } from '../lib/healthInsights';
import { getLatestHealthMetrics, initializeHealthKit } from '../lib/appleHealth';
import { extractVitalsFromReadings, matchesSensorType } from '../lib/vitalsExtraction';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors, isDark, toggleTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'suggestions'>('status');
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
  const [healthMetrics, setHealthMetrics] = useState<{
    heartRate: number;
    steps: number;
    sleepHours: number;
    sleepWeeklyAverage: number;
    bloodGlucose: number;
  } | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  useEffect(() => {
    // Initialize Apple Health on mount and wait for it
    const initHealth = async () => {
      await initializeHealthKit();
      loadDashboardData();
    };
    initHealth();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const syncHealthDataToBackend = async (metrics: {
    heartRate: number;
    steps: number;
    sleepHours: number;
    sleepWeeklyAverage: number;
    bloodGlucose: number;
  }) => {
    console.log('🔄 Starting health data sync to backend...', metrics);
    try {
      // Get the actual user from database to ensure correct name and user_id
      let actualUserName = name;
      let userId: number | undefined;
      try {
        const user = await apiClient.getPrimaryUser();
        actualUserName = user.name;
        userId = user.id;
        console.log(`👤 Using user: ${actualUserName} (ID: ${userId}) for health data sync`);
      } catch (err) {
        console.log('⚠️ Could not get user for device ID:', err);
      }
      
      // Use a device ID based on the actual user's name from database
      const deviceId = `health-${actualUserName.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Get existing sensors for this device
      const existingSensors = await apiClient.getSensors();
      const deviceSensors = existingSensors.filter(s => s.device_id === deviceId);
      // Convert to lowercase for case-insensitive comparison (backend returns uppercase enum values)
      const existingSensorTypes = new Set(deviceSensors.map(s => (s.sensor_type || '').toLowerCase()));
      
      console.log(`🔍 Checking sensors for device: ${deviceId}`);
      console.log(`📋 Existing sensors:`, deviceSensors.map(s => ({ type: s.sensor_type, name: s.name })));
      console.log(`📋 Existing sensor types (lowercase):`, Array.from(existingSensorTypes));
      
      // Create sensors that don't exist yet - create ALL health sensors upfront
      // This ensures sensors exist even if data is 0, so Guardian can see them
      const sensorTypes = [
        { type: 'heart_rate', name: 'Heart Rate Monitor', unit: 'bpm' },
        { type: 'glucose', name: 'Blood Glucose Monitor', unit: 'mg/dL' },
        { type: 'sleep', name: 'Sleep Tracker', unit: 'hours' },
        { type: 'sleep_weekly_avg', name: 'Sleep Weekly Average', unit: 'hours' },
        { type: 'step_count', name: 'Step Counter', unit: 'steps' },
      ];
      
      // userId is already set above when getting user for device ID
      // If not set, try again
      if (!userId) {
        try {
          const user = await apiClient.getPrimaryUser();
          userId = user.id;
        } catch (err) {
          console.log('⚠️ Could not get user ID for sensor creation:', err);
        }
      }
      
      // Create all health sensors if they don't exist (even if data is 0)
      for (const { type, name: sensorName } of sensorTypes) {
        // Check case-insensitively (backend stores as uppercase enum, frontend uses lowercase)
        if (!existingSensorTypes.has(type.toLowerCase())) {
          try {
            // Create sensor with user_id to link it to the user
            await apiClient.createSensor(deviceId, sensorName, type, 'Apple Health', userId);
            console.log(`✅ Created ${type} sensor for ${actualUserName}`);
          } catch (err: any) {
            // Check if error is because sensor already exists (different device_id)
            if (err?.message?.includes('already exists') || err?.message?.includes('device_id')) {
              console.log(`ℹ️ ${type} sensor already exists (possibly with different device_id)`);
            } else {
              console.log(`⚠️ Could not create ${type} sensor:`, err?.message || err);
            }
          }
        } else {
          console.log(`ℹ️ ${type} sensor already exists`);
        }
      }
      
      // Prepare readings to sync - sync ALL health metrics (even if 0)
      // This ensures Guardian Dashboard can see all sensor types
      const readings: Array<{ sensor_type: string; value: number; unit?: string }> = [];
      
      // Always sync heart rate (even if 0, so Guardian knows the sensor exists)
      readings.push({
        sensor_type: 'heart_rate',
        value: metrics.heartRate,
        unit: 'bpm',
      });
      
      // Always sync glucose (even if 0)
      readings.push({
        sensor_type: 'glucose',
        value: metrics.bloodGlucose,
        unit: 'mg/dL',
      });
      
      // Always sync sleep hours (even if 0)
      readings.push({
        sensor_type: 'sleep',
        value: metrics.sleepHours,
        unit: 'hours',
      });
      
      // Always sync weekly average sleep (even if 0)
      readings.push({
        sensor_type: 'sleep_weekly_avg',
        value: metrics.sleepWeeklyAverage,
        unit: 'hours',
      });
      
      // Always sync steps (even if 0)
      readings.push({
        sensor_type: 'step_count',
        value: metrics.steps,
        unit: 'steps',
      });
      
      // Sync readings if we have any
      // Reuse userId from above (already fetched for sensor creation)
      // If userId wasn't set, try to get it again
      if (!userId) {
        try {
          const user = await apiClient.getPrimaryUser();
          userId = user.id;
          console.log(`👤 Got user ID for health data sync: ${userId}`);
        } catch (err) {
          console.log('⚠️ Could not get user ID for health data sync:', err);
        }
      } else {
        console.log(`👤 Syncing health data for user ID: ${userId}`);
      }
      
      if (readings.length > 0) {
        console.log(`📤 Syncing ${readings.length} health readings to backend:`, readings);
        await apiClient.syncHealthReadings(deviceId, readings, userId);
        console.log('✅ Synced Apple Health data to backend');
      } else {
        console.log('⚠️ No health readings to sync');
      }
    } catch (err) {
      // Silently fail - don't block the UI if sync fails
      console.log('Note: Could not sync health data to backend:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load Apple Health data
      const metrics = await getLatestHealthMetrics();
      console.log('📊 Health metrics fetched:', {
        heartRate: metrics.heartRate,
        steps: metrics.steps,
        sleepHours: metrics.sleepHours,
        sleepWeeklyAverage: metrics.sleepWeeklyAverage,
        bloodGlucose: metrics.bloodGlucose,
      });
      setHealthMetrics(metrics);
      
      // Always sync Apple Health data to backend so Guardian can see it
      // This ensures sensors are created and Guardian Dashboard can display all vitals
      await syncHealthDataToBackend(metrics);
      
      const data = await apiClient.getDashboard();
      setDashboardData(data);
      
      // Show most recent critical/warning alert as notification
      // Filter out fall_detection, co2 (carbon monoxide), and smoke alerts
      // Focusing only on temperature alerts for heat stroke prevention
      const activeAlerts = (data.active_alerts || []).filter(
        a => a.sensor_type !== 'fall_detection' && a.sensor_type !== 'co2' && a.sensor_type !== 'smoke'
      );
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
      // Show emergency modal for critical alerts (temperature only - for heat stroke prevention)
      const emergency = generatedInsights.find(
        (insight) => 
          insight.severity === 'critical' && 
          (insight.tags?.includes('temperature') || 
           insight.tags?.includes('emergency')),
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

  // Extract vitals from Apple Health and sensor readings
  // Uses the shared extraction function to ensure consistency with Guardian Dashboard
  const extractVitals = (readings: SensorReading[]): VitalCard[] => {
    const vitals: VitalCard[] = [];
    
    // Use the shared extraction function (EXACT same method as Guardian Dashboard)
    const { heartRate, bloodGlucose, sleepHours, steps } = extractVitalsFromReadings(readings, healthMetrics);
    
    // Heart Rate
    if (heartRate > 0) {
      const value = Math.round(heartRate);
      vitals.push({
        icon: 'heart-outline',
        label: 'Heart Rate',
        value: value.toString(),
        unit: 'bpm',
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

    // Blood Glucose
    if (bloodGlucose > 0) {
      const value = Math.round(bloodGlucose);
      vitals.push({
        icon: 'water-outline',
        label: 'Blood Glucose',
        value: value.toString(),
        unit: 'mg/dL',
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

    // Sleep Quality (from Apple Health - weekly average)
    if (sleepHours > 0) {
      vitals.push({
        icon: 'moon-outline',
        label: 'Sleep Quality',
        value: sleepHours.toFixed(1),
        unit: 'hours weekly average',
        status: sleepHours < 6 || sleepHours > 9 ? 'warning' : 'normal',
        color: sleepHours < 6 || sleepHours > 9 ? 'yellow' : 'green',
      });
    } else {
      vitals.push({
        icon: 'moon-outline',
        label: 'Sleep Quality',
        value: '--',
        unit: 'hours weekly average',
        status: 'normal',
        color: 'green',
      });
    }

    // Activity Level (from Apple Health steps)
    if (steps > 0) {
      vitals.push({
        icon: 'walk-outline',
        label: 'Activity Level',
        value: steps.toLocaleString(),
        unit: 'steps',
        status: 'normal',
        color: 'green',
      });
    } else {
      vitals.push({
        icon: 'walk-outline',
        label: 'Activity Level',
        value: '--',
        unit: 'steps',
        status: 'normal',
        color: 'green',
      });
    }

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
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error && !dashboardData) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        <TouchableOpacity onPress={loadDashboardData} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {activeEmergencyInsight && (
        <View style={[styles.emergencyOverlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.emergencyModal, { backgroundColor: colors.card }]}>
            <View style={styles.emergencyIcon}>
              <View style={[styles.emergencyIconCircle, { backgroundColor: colors.destructive }]}>
                <Text style={styles.emergencyIconExclamation}>!</Text>
              </View>
            </View>
            <Text style={[styles.emergencyTitle, { color: colors.foreground }]}>{activeEmergencyInsight.title}</Text>
            <Text style={[styles.emergencyMessage, { color: colors.mutedForeground }]}>
              {activeEmergencyInsight.message || 'We detected a potential emergency situation.'}
            </Text>
            <View style={styles.emergencyActions}>
              <TouchableOpacity
                style={[styles.emergencyDismissButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => setActiveEmergencyInsight(null)}
              >
                <Text style={[styles.emergencyDismissText, { color: colors.foreground }]}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.emergencyCallButton, { backgroundColor: colors.destructive }]}
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

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerTop}>
            <Text 
              style={[styles.greeting, { color: colors.foreground }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.7}
            >
              {getTimeGreeting()}, {displayName}
            </Text>
            {onLogout && (
              <TouchableOpacity onPress={onLogout} style={styles.logoutIconButton}>
                <Ionicons name="log-out" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Connection Status */}
          <View style={styles.connectionStatus}>
            <View style={[styles.statusBadge, { 
              backgroundColor: isDark ? '#1a2e1a' : '#f0fdf4',
              borderColor: isDark ? '#22c55e' : '#bbf7d0'
            }]}>
              <Ionicons name="watch" size={16} color={isDark ? '#86efac' : '#166534'} />
              <Text style={[styles.statusText, { color: isDark ? '#86efac' : '#166534' }]}>Apple Watch</Text>
              <Ionicons name="wifi" size={16} color={isDark ? '#86efac' : '#166534'} />
            </View>
            <View style={[styles.statusBadge, { 
              backgroundColor: isDark ? '#1a2e1a' : '#f0fdf4',
              borderColor: isDark ? '#22c55e' : '#bbf7d0'
            }]}>
              <Ionicons name="water" size={16} color={isDark ? '#86efac' : '#166534'} />
              <Text style={[styles.statusText, { color: isDark ? '#86efac' : '#166534' }]}>Dexcom</Text>
              <Ionicons name="wifi" size={16} color={isDark ? '#86efac' : '#166534'} />
            </View>
            {/* Dark Mode Toggle */}
            <TouchableOpacity 
              onPress={toggleTheme} 
              style={styles.themeToggleButton}
            >
              <Ionicons 
                name={isDark ? "sunny" : "moon"} 
                size={20} 
                color={colors.foreground} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Alert */}
        {notification.show && (
          <View style={[
            styles.notification,
            notification.confirmed 
              ? { backgroundColor: isDark ? '#1a2e1a' : '#f0fdf4', borderColor: isDark ? '#22c55e' : '#bbf7d0' }
              : { backgroundColor: isDark ? '#2e2e1a' : '#fefce8', borderColor: isDark ? '#eab308' : '#fde047' }
          ]}>
            <Text style={[
              styles.notificationText,
              { color: notification.confirmed 
                ? (isDark ? '#86efac' : '#166534')
                : (isDark ? '#fde047' : '#854d0e')
              }
            ]}>
              {notification.confirmed ? '✓ Action confirmed' : notification.message}
            </Text>
            {!notification.confirmed && (
              <TouchableOpacity
                onPress={handleConfirm}
                style={[styles.confirmButton, { backgroundColor: isDark ? '#eab308' : '#eab308' }]}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.confirmButtonText}>Confirm Action</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { backgroundColor: isDark ? colors.muted : '#f3f4f6' }]}>
          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'status' && [styles.tabActive, { backgroundColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('status')}
          >
            <Ionicons name="pulse" size={20} color={activeTab === 'status' ? '#ffffff' : colors.mutedForeground} />
            <Text style={[
              styles.tabLabel, 
              { color: activeTab === 'status' ? '#ffffff' : colors.mutedForeground }
            ]}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'suggestions' && [styles.tabActive, { backgroundColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('suggestions')}
          >
            <Ionicons name="bulb" size={20} color={activeTab === 'suggestions' ? '#ffffff' : colors.mutedForeground} />
            <Text style={[
              styles.tabLabel, 
              { color: activeTab === 'suggestions' ? '#ffffff' : colors.mutedForeground }
            ]}>Suggestions</Text>
            {insights.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: colors.destructive }]}>
                <Text style={styles.tabBadgeText}>{insights.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Status Tab Content */}
        {activeTab === 'status' && (
          <>
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
          <View style={[styles.voiceAssistBadge, { backgroundColor: isDark ? colors.muted : '#dbeafe' }]}>
            <Text style={[styles.voiceAssistText, { color: isDark ? colors.foreground : '#1e40af' }]}>🎙️ Voice assist available</Text>
          </View>
        </View>
          </>
        )}

        {/* Suggestions Tab Content */}
        {activeTab === 'suggestions' && (
          <View style={styles.suggestionsContent}>
            {insights.length > 0 ? (
              <>
                <Text style={[styles.insightsTitle, { color: colors.foreground }]}>Suggestions for Today</Text>
                {insights.map((insight, index) => (
                  <View
                    key={`${insight.title}-${index}`}
                    style={[
                      styles.insightCardCompact,
                      insight.severity === 'critical'
                        ? { backgroundColor: isDark ? '#2e1a1a' : '#fef2f2', borderColor: isDark ? '#ef4444' : '#fca5a5' }
                        : insight.severity === 'warning'
                          ? { backgroundColor: isDark ? '#2e2e1a' : '#fefce8', borderColor: isDark ? '#eab308' : '#fde047' }
                          : { backgroundColor: isDark ? colors.muted : '#eff6ff', borderColor: isDark ? colors.border : '#bfdbfe' },
                    ]}
                  >
                    <View style={styles.insightHeaderCompact}>
                      <Ionicons
                        name={
                          insight.severity === 'critical'
                            ? 'warning'
                            : insight.severity === 'warning'
                              ? 'alert-circle'
                            : 'bulb-outline'
                        }
                        size={18}
                        color={
                          insight.severity === 'critical'
                            ? (isDark ? '#fca5a5' : '#991b1b')
                            : insight.severity === 'warning'
                              ? (isDark ? '#fde047' : '#854d0e')
                              : colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.insightTitleCompact,
                          { color: insight.severity === 'critical'
                            ? (isDark ? '#fca5a5' : '#991b1b')
                            : insight.severity === 'warning'
                              ? (isDark ? '#fde047' : '#854d0e')
                              : colors.primary
                          }
                        ]}
                        numberOfLines={1}
                      >
                        {insight.title}
                      </Text>
                      {insight.notifyGuardian && (
                        <View style={[styles.guardianBadgeCompact, { backgroundColor: isDark ? colors.muted : '#dbeafe' }]}>
                          <Ionicons name="notifications" size={12} color={colors.primary} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.insightMessageCompact, { color: isDark ? colors.mutedForeground : '#4b5563' }]} numberOfLines={2}>
                      {insight.message}
                    </Text>
                    {insight.severity === 'critical' && (
                      <TouchableOpacity 
                        style={[styles.insightPrimaryButtonCompact, { backgroundColor: colors.destructive }]}
                        onPress={() => {
                          setSelectedInsight(insight);
                          setShowActionSheet(true);
                        }}
                      >
                        <Text style={styles.insightPrimaryButtonTextCompact}>View Options</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bulb-outline" size={64} color={colors.mutedForeground} />
                <Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>No suggestions at this time</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Emergency Button - Fixed at Bottom */}
      <View style={[styles.emergencyContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={onEmergency}
          style={styles.emergencyButton}
        >
          <Ionicons name="call" size={24} color="#ffffff" />
          <Text style={styles.emergencyButtonText}>Call for Help</Text>
        </TouchableOpacity>
      </View>

      {/* Action Sheet Modal for View Options */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.actionSheet, { backgroundColor: colors.card }]}>
            <View style={styles.actionSheetHeader}>
              <Text style={[styles.actionSheetTitle, { color: colors.foreground }]}>Select Action</Text>
              <TouchableOpacity
                onPress={() => setShowActionSheet(false)}
                style={styles.actionSheetCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {selectedInsight && (
              <View style={styles.actionSheetContent}>
                <Text style={[styles.actionSheetMessage, { color: colors.mutedForeground }]}>{selectedInsight.message}</Text>
              </View>
            )}
            <View style={styles.actionSheetButtons}>
              <TouchableOpacity
                style={[styles.actionSheetButton, { backgroundColor: colors.destructive }]}
                onPress={() => {
                  setShowActionSheet(false);
                  onEmergency();
                }}
              >
                <Ionicons name="call" size={20} color="#ffffff" />
                <Text style={styles.actionSheetButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionSheetButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => {
                  setShowActionSheet(false);
                  setSelectedInsight(null);
                  // Optionally remove the insight from the list
                  if (selectedInsight) {
                    setInsights(prev => prev.filter(i => i.title !== selectedInsight.title));
                  }
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
                <Text style={[styles.actionSheetButtonText, { color: colors.mutedForeground }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
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
    flex: 1,
    flexShrink: 1,
  },
  logoutIconButton: {
    padding: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  themeToggleButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
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
    gap: 8,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  insightCardCompact: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
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
  insightHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitleCompact: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  insightMessageCompact: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  guardianBadgeCompact: {
    padding: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 10,
  },
  insightPrimaryButtonCompact: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#dc2626',
    borderRadius: 10,
  },
  insightPrimaryButtonTextCompact: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyIconExclamation: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
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
    paddingBottom: 60,
    borderTopWidth: 1,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    backgroundColor: '#dc2626', // Always red regardless of theme
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  actionSheetCloseButton: {
    padding: 4,
  },
  actionSheetContent: {
    marginBottom: 24,
  },
  actionSheetMessage: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  actionSheetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionSheetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionSheetButtonCall: {
    backgroundColor: '#dc2626',
  },
  actionSheetButtonDismiss: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionSheetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    marginHorizontal: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  tabBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  suggestionsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
