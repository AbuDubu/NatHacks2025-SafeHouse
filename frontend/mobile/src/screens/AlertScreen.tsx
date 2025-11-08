/**
 * Alert Screen
 * Shows list of all alerts (active and historical)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAlerts } from '../contexts/AlertContext';
import type { Alert } from '../../../shared/types';
import { ALERT_STATUS_COLORS, RISK_LEVEL_COLORS } from '../../../shared/constants';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AlertScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { activeAlerts, isLoading, refreshAlerts } = useAlerts();

  const renderAlertItem = ({ item }: { item: Alert }) => {
    const statusColor = ALERT_STATUS_COLORS[item.status];
    const riskColor = RISK_LEVEL_COLORS[item.currentRiskLevel];

    return (
      <TouchableOpacity
        style={styles.alertCard}
        onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
      >
        <View style={styles.alertHeader}>
          <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
            <Text style={styles.riskText}>{item.currentRiskLevel}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.elderName}>{item.elderName || 'Elder'}</Text>

        <View style={styles.alertInfo}>
          <Text style={styles.alertLabel}>Started:</Text>
          <Text style={styles.alertValue}>
            {new Date(item.startedAt).toLocaleString()}
          </Text>
        </View>

        {item.closedAt && (
          <View style={styles.alertInfo}>
            <Text style={styles.alertLabel}>Closed:</Text>
            <Text style={styles.alertValue}>
              {new Date(item.closedAt).toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.alertInfo}>
          <Text style={styles.alertLabel}>Steps:</Text>
          <Text style={styles.alertValue}>{item.steps.length}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>
          {activeAlerts.length} active {activeAlerts.length === 1 ? 'alert' : 'alerts'}
        </Text>
      </View>

      <FlatList
        data={activeAlerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshAlerts} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No alerts</Text>
            <Text style={styles.emptySubtext}>
              You'll see alerts here when heat risk is detected
            </Text>
          </View>
        }
      />
    </View>
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
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  elderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  alertInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  alertLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertValue: {
    fontSize: 14,
    color: '#111827',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default AlertScreen;

