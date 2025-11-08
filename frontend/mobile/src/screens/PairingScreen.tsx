/**
 * Pairing Screen
 * For caregivers to pair with elder's account
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { apiService } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

const PairingScreen = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handlePair = async () => {
    if (!inviteCode || inviteCode.length < 6) {
      Alert.alert('Error', 'Please enter a valid invite code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.pairDevice(inviteCode);
      if (response.success) {
        Alert.alert(
          'Success',
          'Successfully paired with elder account',
          [
            {
              text: 'OK',
              onPress: () => refreshUser(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to pair device');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid invite code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Pair Device</Text>
        <Text style={styles.subtitle}>
          Enter the invite code provided by the elder
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Invite Code</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC123XYZ"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handlePair}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Pairing...' : 'Pair Device'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How to get an invite code:</Text>
          <Text style={styles.infoText}>
            1. Ask the elder to open their SafeHouse app{'\n'}
            2. Go to Profile → Emergency Contacts{'\n'}
            3. Tap "Add Caregiver"{'\n'}
            4. Share the generated code with you
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default PairingScreen;

