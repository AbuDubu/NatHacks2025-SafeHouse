/**
 * Simplified Alert Screen - No Contexts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const AlertScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>0 active alerts</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No alerts</Text>
        <Text style={styles.emptySubtext}>
          You'll see alerts here when heat risk is detected
        </Text>
      </View>
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

