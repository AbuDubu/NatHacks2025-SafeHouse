import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface EmergencyFlowProps {
  context?: {
    residentName?: string;
    alertType?: string;
  };
  onResolve: () => void;
}

export function EmergencyFlow({ context, onResolve }: EmergencyFlowProps) {
  const [callStage, setCallStage] = useState<'detecting' | 'calling' | 'waiting' | 'contacted'>('detecting');

  useEffect(() => {
    // Simulate emergency detection flow
    const timer1 = setTimeout(() => setCallStage('calling'), 2000);
    const timer2 = setTimeout(() => setCallStage('waiting'), 4000);
    const timer3 = setTimeout(() => setCallStage('contacted'), 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleResponse = (response: '1' | '2') => {
    if (response === '1') {
      // User is OK
      setCallStage('contacted');
      setTimeout(() => onResolve(), 2000);
    } else {
      // Emergency help needed
      setCallStage('contacted');
    }
  };

  return (
    <LinearGradient
      colors={['#fef2f2', '#ffffff']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Detecting Stage */}
        {callStage === 'detecting' && (
          <View style={styles.stageContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle" size={64} color="#dc2626" />
            </View>
            <Text style={styles.title}>Alert Detected</Text>
            <Text style={styles.subtitle}>
              {context?.alertType === 'no-response' 
                ? `${context?.residentName || 'Resident'} has not responded`
                : 'Unusual vital signs detected'}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Initiating safety protocol...</Text>
            </View>
          </View>
        )}

        {/* Calling Stage */}
        {callStage === 'calling' && (
          <View style={styles.stageContainer}>
            <View style={[styles.iconCircle, styles.pulsing]}>
              <Ionicons name="call" size={64} color="#dc2626" />
            </View>
            <Text style={styles.title}>Calling...</Text>
            <Text style={styles.subtitle}>
              Attempting to reach {context?.residentName || 'resident'}
            </Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>🔊 AI Voice Call Active</Text>
            </View>
          </View>
        )}

        {/* Waiting for Response Stage */}
        {callStage === 'waiting' && (
          <View style={styles.stageContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={64} color="#dc2626" />
            </View>
            <Text style={styles.title}>Are You OK?</Text>
            <Text style={styles.subtitle}>Please respond using your phone keypad</Text>
            
            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionTitle}>Press 1</Text>
                <Text style={styles.instructionText}>If you're OK</Text>
              </View>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionTitle}>Press 2</Text>
                <Text style={styles.instructionText}>For emergency help</Text>
              </View>
            </View>

            {/* Simulate response buttons (for demo purposes) */}
            <View style={styles.responseButtons}>
              <TouchableOpacity
                onPress={() => handleResponse('1')}
                style={[styles.responseButton, styles.okButton]}
              >
                <Text style={styles.responseButtonText}>I'm OK (Press 1)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleResponse('2')}
                style={[styles.responseButton, styles.helpButton]}
              >
                <Text style={styles.responseButtonText}>Need Help (Press 2)</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.warningText}>
              No response after 2 calls → Emergency services will be contacted
            </Text>
          </View>
        )}

        {/* Emergency Services Contacted Stage */}
        {callStage === 'contacted' && (
          <View style={styles.stageContainer}>
            <View style={[styles.iconCircle, styles.successCircle]}>
              <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
            </View>
            <Text style={[styles.title, styles.successTitle]}>Emergency Services Contacted</Text>
            <Text style={[styles.subtitle, styles.successSubtitle]}>
              Help is on the way. Guardian has been notified.
            </Text>

            <View style={styles.statusCards}>
              <View style={[styles.statusCard, styles.successCard]}>
                <Text style={styles.statusCardTitle}>✓ 911 Dispatch Notified</Text>
                <Text style={styles.statusCardSubtext}>ETA: 6 minutes</Text>
              </View>
              <View style={[styles.statusCard, styles.infoCard]}>
                <Text style={styles.statusCardTitle}>✓ Guardian Alerted</Text>
                <Text style={styles.statusCardSubtext}>Notification sent</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onResolve}
              style={styles.returnButton}
            >
              <Text style={styles.returnButtonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stageContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulsing: {
    opacity: 0.7,
  },
  successCircle: {
    backgroundColor: '#dcfce7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
    textAlign: 'center',
  },
  successTitle: {
    color: '#166534',
  },
  subtitle: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 24,
    textAlign: 'center',
  },
  successSubtitle: {
    color: '#16a34a',
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    color: '#dc2626',
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    color: '#374151',
    fontSize: 16,
  },
  instructionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  instructionCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  responseButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  responseButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButton: {
    backgroundColor: '#16a34a',
  },
  helpButton: {
    backgroundColor: '#dc2626',
  },
  responseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    color: '#dc2626',
    textAlign: 'center',
  },
  statusCards: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  statusCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successCard: {
    borderColor: '#bbf7d0',
  },
  statusCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusCardSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  returnButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
