/**
 * Alert Detail Screen
 * Shows detailed timeline of an alert
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { Alert, AlertStep } from '../../../shared/types';
import { apiService } from '../services/api.service';
import { useAlerts } from '../contexts/AlertContext';
import type { RootStackParamList } from '../navigation/AppNavigator';

type AlertDetailRouteProp = RouteProp<RootStackParamList, 'AlertDetail'>;

const AlertDetailScreen = () => {
  const route = useRoute<AlertDetailRouteProp>();
  const navigation = useNavigation();
  const { acknowledgeAlert } = useAlerts();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlertDetails();
  }, [route.params.alertId]);

  const loadAlertDetails = async () => {
    try {
      const response = await apiService.getAlertDetails(route.params.alertId);
      if (response.success && response.data) {
        setAlert(response.data);
      }
    } catch (error) {
      console.error('Error loading alert:', error);
      RNAlert.alert('Error', 'Failed to load alert details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = () => {
    RNAlert.alert(
      'Acknowledge Alert',
      'Are you safe and okay?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "I'm OK",
          onPress: async () => {
            try {
              await acknowledgeAlert(route.params.alertId);
              navigation.goBack();
            } catch (error) {
              RNAlert.alert('Error', 'Failed to acknowledge alert');
            }
          },
        },
      ]
    );
  };

  const renderStep = (step: AlertStep, index: number) => {
    const isLast = alert ? index === alert.steps.length - 1 : false;

    return (
      <View key={step.id} style={styles.stepContainer}>
        <View style={styles.stepLine}>
          <View style={styles.stepDot} />
          {!isLast && <View style={styles.stepConnector} />}
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepAction}>{step.action.replace('_', ' ')}</Text>
          <Text style={styles.stepTarget}>To: {step.target}</Text>
          <Text style={styles.stepResult}>
            Result: {step.result.replace('_', ' ')}
          </Text>
          <Text style={styles.stepTime}>
            {new Date(step.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Alert not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alert Details</Text>
        <Text style={styles.subtitle}>
          Started: {new Date(alert.startedAt).toLocaleString()}
        </Text>
      </View>

      {alert.status === 'open' && (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>This alert is active</Text>
          <TouchableOpacity
            style={styles.ackButton}
            onPress={handleAcknowledge}
          >
            <Text style={styles.ackButtonText}>I'm OK</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Timeline</Text>
        <Text style={styles.stepCount}>
          {alert.steps.length} {alert.steps.length === 1 ? 'step' : 'steps'}
        </Text>

        <View style={styles.timeline}>
          {alert.steps.map((step, index) => renderStep(step, index))}
        </View>
      </View>

      {alert.closeReason && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resolution</Text>
          <Text style={styles.closeReason}>{alert.closeReason}</Text>
          {alert.closedAt && (
            <Text style={styles.closeTime}>
              Closed: {new Date(alert.closedAt).toLocaleString()}
            </Text>
          )}
        </View>
      )}
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
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionCard: {
    backgroundColor: '#FEE2E2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 12,
  },
  ackButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  stepCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  timeline: {
    marginTop: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  stepConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 8,
  },
  stepAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  stepTarget: {
    fontSize: 14,
    color: '#6B7280',
  },
  stepResult: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  stepTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  closeReason: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  closeTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 48,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 48,
  },
});

export default AlertDetailScreen;

