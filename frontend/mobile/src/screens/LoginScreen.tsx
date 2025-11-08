/**
 * Login Screen
 * Handles phone number authentication
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
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to send verification code
      setStep('code');
    } catch (error) {
      Alert.alert('Error', 'Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 4) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      await login(phone, code);
    } catch (error) {
      Alert.alert('Error', 'Invalid code. Please try again.');
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
        <Text style={styles.title}>SafeHouse</Text>
        <Text style={styles.subtitle}>Heat Safety Monitor</Text>

        {step === 'phone' ? (
          <>
            <Text style={styles.label}>Enter your phone number</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Send Code'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter verification code</Text>
            <Text style={styles.hint}>Sent to {phone}</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoFocus
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setStep('phone')}
            >
              <Text style={styles.linkText}>Change phone number</Text>
            </TouchableOpacity>
          </>
        )}
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
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#EF4444',
    fontSize: 14,
  },
});

export default LoginScreen;

